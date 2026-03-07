import { createHash } from "crypto";
import { once } from "events";
import { createReadStream, createWriteStream } from "fs";
import {
  mkdir,
  readdir,
  readFile,
  rename,
  rm,
  stat,
  unlink,
  writeFile,
} from "fs/promises";
import path from "path";
import { finished } from "stream/promises";
import { RequestHandler } from "express";
import mongoose from "mongoose";
import archiver from "archiver";
import { ApiError } from "../../utils/ApiError";
import { successResponse } from "../../utils/successResponse";

const BACKUP_DIR = path.resolve(process.cwd(), "backups", "db");
const BACKUP_EXT = ".zip";
const BACKUP_META_EXT = ".meta.json";
const TEMP_SUFFIX = ".tmp";

type BackupCollectionInfo = {
  collection: string;
  fileName: string;
  documents: number;
};

type BackupManifest = {
  version: "backup-v1";
  generatedAt: string;
  generatedBy: "settings.createBackup";
  databaseName: string;
  archiveFileName: string;
  folderName: string;
  totalCollections: number;
  totalDocuments: number;
  collections: BackupCollectionInfo[];
  importGuide: {
    notes: string[];
    mongoimportExample: string;
  };
  checksumSha256?: string;
};

type BackupFileInfo = {
  fileName: string;
  sizeBytes: number;
  createdAt: string;
  generatedAt?: string;
  totalCollections?: number;
  totalDocuments?: number;
  databaseName?: string;
  checksumSha256?: string;
};

let isBackupRunning = false;

const safeJsonStringify = (value: unknown) =>
  JSON.stringify(value, (_, currentValue) => {
    if (typeof currentValue === "bigint") {
      return currentValue.toString();
    }
    return currentValue;
  });

const timestampForFileName = (date: Date) => {
  return date
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}Z$/, "Z");
};

const ensureBackupDirectory = async () => {
  await mkdir(BACKUP_DIR, { recursive: true });
};

const sanitizeBackupName = (value: string) =>
  value.replace(/[^a-zA-Z0-9._-]/g, "");

const safeCollectionFileName = (collectionName: string) => {
  const safe = collectionName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${safe || "collection"}.json`;
};

const writeJsonArrayFileFromCollection = async (
  collection: mongoose.mongo.Collection,
  destinationFilePath: string,
) => {
  const output = createWriteStream(destinationFilePath, { flags: "wx" });
  let documents = 0;
  let isFirst = true;

  const writeChunk = async (chunk: string) => {
    const canContinue = output.write(chunk);
    if (!canContinue) {
      await once(output, "drain");
    }
  };

  try {
    await writeChunk("[");

    const cursor = collection.find({});
    for await (const doc of cursor) {
      const serialized = safeJsonStringify(doc);
      await writeChunk(`${isFirst ? "" : ","}\n${serialized}`);
      isFirst = false;
      documents += 1;
    }

    if (!isFirst) {
      await writeChunk("\n]");
    } else {
      await writeChunk("]");
    }

    output.end();
    await finished(output);
    return documents;
  } catch (error) {
    output.destroy();
    throw error;
  }
};

const hashFileSha256 = async (filePath: string): Promise<string> => {
  const stream = createReadStream(filePath);
  const hash = createHash("sha256");

  return await new Promise<string>((resolve, reject) => {
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(hash.digest("hex")));
  });
};

const getMetadataPathFromBackupFileName = (backupFileName: string) =>
  path.resolve(BACKUP_DIR, `${backupFileName}${BACKUP_META_EXT}`);

const readBackupMetadata = async (
  backupFileName: string,
): Promise<BackupManifest | null> => {
  const metadataPath = getMetadataPathFromBackupFileName(backupFileName);

  try {
    const raw = await readFile(metadataPath, "utf-8");
    const parsed = JSON.parse(raw) as BackupManifest;
    return parsed;
  } catch {
    return null;
  }
};

const isValidIsoDate = (value: string | undefined): value is string => {
  if (!value) return false;
  return !Number.isNaN(new Date(value).getTime());
};

const resolveBackupCreatedAt = (
  fileStats: Awaited<ReturnType<typeof stat>>,
  metadata: BackupManifest | null,
) => {
  if (isValidIsoDate(metadata?.generatedAt)) {
    return metadata.generatedAt;
  }

  // birthtime is unreliable on some docker/linux filesystems.
  return fileStats.mtime.toISOString();
};

const buildBackupSummary = async (
  fileName: string,
): Promise<BackupFileInfo> => {
  const filePath = path.resolve(BACKUP_DIR, fileName);
  const fileStats = await stat(filePath);
  const metadata = await readBackupMetadata(fileName);
  const createdAt = resolveBackupCreatedAt(fileStats, metadata);

  return {
    fileName,
    sizeBytes: fileStats.size,
    createdAt,
    generatedAt: isValidIsoDate(metadata?.generatedAt)
      ? metadata.generatedAt
      : createdAt,
    totalCollections: metadata?.totalCollections,
    totalDocuments: metadata?.totalDocuments,
    databaseName: metadata?.databaseName,
    checksumSha256: metadata?.checksumSha256,
  };
};

const listBackupFiles = async (): Promise<BackupFileInfo[]> => {
  await ensureBackupDirectory();

  const files = await readdir(BACKUP_DIR, { withFileTypes: true });
  const backupFiles = files
    .filter((entry) => entry.isFile() && entry.name.endsWith(BACKUP_EXT))
    .map((entry) => entry.name);

  const detailed = await Promise.all(backupFiles.map(buildBackupSummary));

  return detailed.sort(
    (a, b) =>
      new Date(b.generatedAt || b.createdAt).getTime() -
      new Date(a.generatedAt || a.createdAt).getTime(),
  );
};

const createDatabaseBackupInternal = async () => {
  if (mongoose.connection.readyState !== 1 || !mongoose.connection.db) {
    throw new ApiError(503, "Database is not connected");
  }

  await ensureBackupDirectory();

  const now = new Date();
  const timestamp = timestampForFileName(now);
  const folderName = `backup-${timestamp}`;
  const fileName = `${folderName}${BACKUP_EXT}`;
  const tempFolderPath = path.resolve(
    BACKUP_DIR,
    `${folderName}${TEMP_SUFFIX}`,
  );
  const tempFilePath = path.resolve(BACKUP_DIR, `${fileName}${TEMP_SUFFIX}`);
  const finalFilePath = path.resolve(BACKUP_DIR, fileName);

  const db = mongoose.connection.db;
  const collections = await db
    .listCollections({}, { nameOnly: true })
    .toArray();

  await mkdir(tempFolderPath, { recursive: false });
  const collectionsDir = path.resolve(tempFolderPath, "collections");
  await mkdir(collectionsDir, { recursive: true });

  const collectionStats: BackupCollectionInfo[] = [];
  let totalDocuments = 0;

  const manifest: BackupManifest = {
    version: "backup-v1",
    generatedAt: now.toISOString(),
    generatedBy: "settings.createBackup",
    databaseName: db.databaseName,
    archiveFileName: fileName,
    folderName,
    totalCollections: 0,
    totalDocuments: 0,
    collections: [],
    importGuide: {
      notes: [
        "Extract this zip first.",
        "Each collection is exported as JSON Array in collections/*.json.",
        "Import collection-wise using mongoimport with --jsonArray.",
      ],
      mongoimportExample:
        'mongoimport --uri="<MONGODB_URI>" --db="<DB_NAME>" --collection="users" --file="collections/users.json" --jsonArray --drop',
    },
  };

  try {
    for (const col of collections) {
      const collectionName = col.name;
      const collection = db.collection(collectionName);

      const collectionFileName = safeCollectionFileName(collectionName);
      const collectionFilePath = path.resolve(
        collectionsDir,
        collectionFileName,
      );
      const documents = await writeJsonArrayFileFromCollection(
        collection,
        collectionFilePath,
      );

      collectionStats.push({
        collection: collectionName,
        fileName: `collections/${collectionFileName}`,
        documents,
      });

      totalDocuments += documents;
    }

    manifest.totalCollections = collectionStats.length;
    manifest.totalDocuments = totalDocuments;
    manifest.collections = collectionStats;

    const manifestPath = path.resolve(tempFolderPath, "manifest.json");
    await writeFile(manifestPath, `${safeJsonStringify(manifest)}\n`, "utf-8");

    const zipOutput = createWriteStream(tempFilePath, { flags: "wx" });
    const archive = archiver("zip", {
      zlib: { level: 9 },
    });

    const archiveComplete = new Promise<void>((resolve, reject) => {
      zipOutput.on("close", () => resolve());
      zipOutput.on("error", reject);
      archive.on("error", reject);
      archive.on("warning", (warning) => {
        if ((warning as NodeJS.ErrnoException).code !== "ENOENT") {
          reject(warning);
        }
      });
    });

    archive.pipe(zipOutput);
    archive.directory(tempFolderPath, folderName);
    await archive.finalize();
    await archiveComplete;

    await rename(tempFilePath, finalFilePath);
    await rm(tempFolderPath, { recursive: true, force: true });

    const fileStats = await stat(finalFilePath);
    const checksumSha256 = await hashFileSha256(finalFilePath);

    manifest.checksumSha256 = checksumSha256;
    await writeFile(
      getMetadataPathFromBackupFileName(fileName),
      `${safeJsonStringify(manifest)}\n`,
      "utf-8",
    );

    return {
      fileName,
      sizeBytes: fileStats.size,
      generatedAt: now.toISOString(),
      databaseName: db.databaseName,
      collections: collectionStats,
      totalCollections: collectionStats.length,
      totalDocuments,
      checksumSha256,
      archiveType: "zip",
      archiveEntry: folderName,
    };
  } catch (error) {
    await unlink(tempFilePath).catch(() => undefined);
    await rm(tempFolderPath, { recursive: true, force: true }).catch(
      () => undefined,
    );
    throw error;
  }
};

const ensureValidBackupFileName = (rawName: string) => {
  const clean = sanitizeBackupName(rawName);
  if (!clean || clean !== rawName || !clean.endsWith(BACKUP_EXT)) {
    throw new ApiError(400, "Invalid backup name");
  }

  return clean;
};

const getLatestBackupSummary = async () => {
  const backups = await listBackupFiles();
  if (!backups.length) {
    throw new ApiError(404, "No backup found");
  }
  return backups[0];
};

const getBackupNameParam = (value: string | string[] | undefined) => {
  if (typeof value !== "string") {
    throw new ApiError(400, "Backup name is required");
  }
  return value;
};

export const backupDatabase: RequestHandler = async (req, res) => {
  const backups = await listBackupFiles();
  const dbConnected = mongoose.connection.readyState === 1;

  return successResponse(res, "Backup status fetched", 200, {
    database: {
      connected: dbConnected,
      name: mongoose.connection.db?.databaseName ?? null,
    },
    backupDirectory: path.relative(process.cwd(), BACKUP_DIR) || "backups/db",
    activeBackupJob: isBackupRunning,
    totalBackups: backups.length,
    latestBackup: backups[0] ?? null,
    backups,
  });
};

export const createBackup: RequestHandler = async (req, res) => {
  if (isBackupRunning) {
    throw new ApiError(409, "A backup job is already running");
  }

  isBackupRunning = true;
  try {
    const result = await createDatabaseBackupInternal();
    return successResponse(res, "Database backup created", 201, result);
  } finally {
    isBackupRunning = false;
  }
};

export const getSingleBackup: RequestHandler = async (req, res) => {
  const backupName = ensureValidBackupFileName(
    getBackupNameParam(req.params.id),
  );
  const filePath = path.resolve(BACKUP_DIR, backupName);

  let fileStats;
  try {
    fileStats = await stat(filePath);
  } catch {
    throw new ApiError(404, "Backup not found");
  }

  const metadata = await readBackupMetadata(backupName);
  const createdAt = resolveBackupCreatedAt(fileStats, metadata);

  return successResponse(res, "Backup details fetched", 200, {
    fileName: backupName,
    sizeBytes: fileStats.size,
    createdAt,
    metadata,
  });
};

export const downloadSingleBackup: RequestHandler = async (req, res) => {
  const backupName = ensureValidBackupFileName(
    getBackupNameParam(req.params.id),
  );
  const filePath = path.resolve(BACKUP_DIR, backupName);

  try {
    await stat(filePath);
  } catch {
    throw new ApiError(404, "Backup not found");
  }

  return res.download(filePath, backupName);
};

export const downloadLatestBackup: RequestHandler = async (req, res) => {
  const latest = await getLatestBackupSummary();
  const filePath = path.resolve(BACKUP_DIR, latest.fileName);

  return res.download(filePath, latest.fileName);
};

export const deleteSingleBackup: RequestHandler = async (req, res) => {
  const backupName = ensureValidBackupFileName(
    getBackupNameParam(req.params.id),
  );
  const filePath = path.resolve(BACKUP_DIR, backupName);
  const metaPath = getMetadataPathFromBackupFileName(backupName);

  try {
    await stat(filePath);
  } catch {
    throw new ApiError(404, "Backup not found");
  }

  await unlink(filePath);
  await unlink(metaPath).catch(() => undefined);

  return successResponse(res, "Backup deleted", 200, { fileName: backupName });
};

export const deleteLatestBackup: RequestHandler = async (req, res) => {
  const latest = await getLatestBackupSummary();
  const filePath = path.resolve(BACKUP_DIR, latest.fileName);
  const metaPath = getMetadataPathFromBackupFileName(latest.fileName);

  await unlink(filePath);
  await unlink(metaPath).catch(() => undefined);

  return successResponse(res, "Latest backup deleted", 200, {
    fileName: latest.fileName,
  });
};
