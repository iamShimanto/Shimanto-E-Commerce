import { useMemo, useState } from "react"
import {
    Copy,
    Database,
    Download,
    Info,
    RefreshCcw,
    ShieldCheck,
    Trash2,
    Upload,
} from "lucide-react"

import Button from "../components/ui/Button"
import ConfirmDialog from "../components/ui/ConfirmDialog"
import { useToast } from "../hooks/useToast"
import {
    useCreateBackupMutation,
    useDeleteBackupMutation,
    useDeleteLatestBackupMutation,
    useDownloadBackupMutation,
    useDownloadLatestBackupMutation,
    useGetBackupDetailsQuery,
    useGetBackupStatusQuery,
} from "../api/backup/backupApi"

const formatBytes = (bytes) => {
    const num = Number(bytes)
    if (!Number.isFinite(num) || num < 0) return "0 B"
    if (num === 0) return "0 B"

    const units = ["B", "KB", "MB", "GB", "TB"]
    const index = Math.min(Math.floor(Math.log(num) / Math.log(1024)), units.length - 1)
    const value = num / Math.pow(1024, index)
    return `${value.toFixed(value >= 100 || index === 0 ? 0 : 2)} ${units[index]}`
}

const formatDate = (value) => {
    if (!value) return "—"
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return "—"
    return date.toLocaleString()
}

const toErrorMessage = (error, fallback = "Request failed") =>
    error?.data?.message ||
    error?.data?.error ||
    (typeof error?.data === "string" ? error.data : null) ||
    (typeof error?.error === "string" ? error.error : null) ||
    fallback

const triggerFileDownload = ({ blob, fileName }) => {
    if (!blob) return
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = objectUrl
    anchor.download = fileName || "backup.zip"
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(objectUrl)
}

export default function Settings() {
    const toast = useToast()

    const [selectedBackup, setSelectedBackup] = useState(null)
    const [confirmDelete, setConfirmDelete] = useState({
        open: false,
        type: null,
        fileName: null,
    })

    const {
        data: backupData,
        isLoading,
        isFetching,
        error,
        refetch,
    } = useGetBackupStatusQuery()

    const {
        data: selectedBackupDetails,
        isFetching: isFetchingDetails,
    } = useGetBackupDetailsQuery(selectedBackup, { skip: !selectedBackup })

    const [createBackup, { isLoading: isCreating }] = useCreateBackupMutation()
    const [deleteBackup, { isLoading: isDeletingSingle }] = useDeleteBackupMutation()
    const [deleteLatestBackup, { isLoading: isDeletingLatest }] = useDeleteLatestBackupMutation()
    const [downloadBackup, { isLoading: isDownloadingSingle }] = useDownloadBackupMutation()
    const [downloadLatestBackup, { isLoading: isDownloadingLatest }] = useDownloadLatestBackupMutation()

    const backups = useMemo(() => (Array.isArray(backupData?.backups) ? backupData.backups : []), [backupData])
    const latestBackup = backupData?.latestBackup || null

    const onCreateBackup = async () => {
        try {
            const result = await createBackup().unwrap()
            const createdName = result?.data?.fileName || "backup.zip"
            toast.success("Backup created", createdName)
        } catch (err) {
            toast.error("Create failed", toErrorMessage(err, "Failed to create backup"))
        }
    }

    const onDownloadBackup = async (fileName) => {
        if (!fileName) return
        try {
            const result = await downloadBackup(fileName).unwrap()
            triggerFileDownload(result)
            toast.success("Download started", fileName)
        } catch (err) {
            toast.error("Download failed", toErrorMessage(err, "Failed to download backup"))
        }
    }

    const onDownloadLatest = async () => {
        try {
            const result = await downloadLatestBackup().unwrap()
            triggerFileDownload(result)
            toast.success("Latest backup downloaded")
        } catch (err) {
            toast.error("Download failed", toErrorMessage(err, "Failed to download latest backup"))
        }
    }

    const onDeleteBackup = (fileName) => {
        if (!fileName) return

        setConfirmDelete({
            open: true,
            type: "single",
            fileName,
        })
    }

    const onDeleteLatest = () => {
        if (!latestBackup?.fileName) return

        setConfirmDelete({
            open: true,
            type: "latest",
            fileName: latestBackup.fileName,
        })
    }

    const closeDeleteDialog = () => {
        setConfirmDelete({ open: false, type: null, fileName: null })
    }

    const onConfirmDelete = async () => {
        if (confirmDelete.type === "single") {
            const fileName = confirmDelete.fileName
            if (!fileName) return

            try {
                await deleteBackup(fileName).unwrap()
                if (selectedBackup === fileName) {
                    setSelectedBackup(null)
                }
                toast.success("Backup deleted", fileName)
                closeDeleteDialog()
            } catch (err) {
                toast.error("Delete failed", toErrorMessage(err, "Failed to delete backup"))
            }
            return
        }

        if (confirmDelete.type === "latest") {
            try {
                await deleteLatestBackup().unwrap()
                if (selectedBackup === confirmDelete.fileName) {
                    setSelectedBackup(null)
                }
                toast.success("Latest backup deleted")
                closeDeleteDialog()
            } catch (err) {
                toast.error("Delete failed", toErrorMessage(err, "Failed to delete latest backup"))
            }
        }
    }

    const onCopyImportExample = async () => {
        const command = selectedBackupDetails?.metadata?.importGuide?.mongoimportExample
        if (!command) {
            toast.error("No import command", "Select a backup first")
            return
        }

        try {
            await navigator.clipboard.writeText(command)
            toast.success("Copied", "mongoimport command copied")
        } catch {
            toast.error("Copy failed", "Clipboard permission denied")
        }
    }

    const pageErrorText = toErrorMessage(error, "Failed to load backup settings")

    return (
        <div className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="text-lg font-extrabold tracking-tight">Settings - Backup</div>
                    <div className="mt-1 text-sm font-semibold text-(--text-muted)">
                        Create database backups, download archives, and manage restore metadata.
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => refetch()}
                        disabled={isFetching}
                    >
                        <RefreshCcw size={16} />
                        {isFetching ? "Refreshing…" : "Refresh"}
                    </Button>

                    <Button
                        type="button"
                        onClick={onCreateBackup}
                        disabled={isCreating || backupData?.activeBackupJob}
                    >
                        <Database size={16} />
                        {isCreating ? "Creating…" : "Create backup"}
                    </Button>
                </div>
            </div>

            {error ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
                    {pageErrorText}
                </div>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-sm">
                    <div className="text-xs font-semibold text-(--text-muted)">Database</div>
                    <div className="mt-2 text-sm font-extrabold">
                        {backupData?.database?.name || "—"}
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-(--border) px-2 py-1 text-[11px] font-extrabold">
                        <ShieldCheck size={13} className={backupData?.database?.connected ? "text-emerald-600" : "text-rose-600"} />
                        {backupData?.database?.connected ? "Connected" : "Disconnected"}
                    </div>
                </div>

                <div className="rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-sm">
                    <div className="text-xs font-semibold text-(--text-muted)">Backup count</div>
                    <div className="mt-2 text-2xl font-extrabold">{backupData?.totalBackups ?? 0}</div>
                    <div className="mt-1 text-xs font-semibold text-(--text-muted)">
                        Directory: {backupData?.backupDirectory || "backups/db"}
                    </div>
                </div>

                <div className="rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-sm">
                    <div className="text-xs font-semibold text-(--text-muted)">Latest backup</div>
                    <div className="mt-2 truncate text-sm font-extrabold">
                        {latestBackup?.fileName || "No backup"}
                    </div>
                    <div className="mt-1 text-xs font-semibold text-(--text-muted)">
                        {latestBackup ? formatDate(latestBackup.generatedAt || latestBackup.createdAt) : "—"}
                    </div>
                </div>

                <div className="rounded-2xl border border-(--border) bg-(--surface) p-4 shadow-sm">
                    <div className="text-xs font-semibold text-(--text-muted)">Quick actions</div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                        <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={onDownloadLatest}
                            disabled={!latestBackup || isDownloadingLatest}
                        >
                            <Download size={14} />
                            {isDownloadingLatest ? "Wait…" : "Latest"}
                        </Button>

                        <Button
                            type="button"
                            size="sm"
                            variant="danger"
                            onClick={onDeleteLatest}
                            disabled={!latestBackup || isDeletingLatest}
                        >
                            <Trash2 size={14} />
                            {isDeletingLatest ? "Deleting…" : "Delete"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-12">
                <section className="xl:col-span-8 overflow-hidden rounded-3xl border border-(--border) bg-(--surface) shadow-sm ring-1 ring-black/5">
                    <div className="flex items-center justify-between gap-3 border-b border-(--border) px-5 py-4">
                        <div className="text-sm font-extrabold">Backups</div>
                        <div className="text-xs font-semibold text-(--text-muted)">
                            {isLoading ? "Loading…" : `${backups.length} items`}
                        </div>
                    </div>

                    {!isLoading && !backups.length ? (
                        <div className="px-5 py-10 text-center text-sm font-semibold text-(--text-muted)">
                            No backups found yet.
                        </div>
                    ) : (
                        <div className="divide-y divide-(--border)">
                            {backups.map((item) => {
                                const isSelected = selectedBackup === item.fileName
                                return (
                                    <div
                                        key={item.fileName}
                                        className="flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <button
                                                type="button"
                                                className={`truncate text-left text-sm font-extrabold ${isSelected ? "text-(--primary)" : "text-(--text)"}`}
                                                onClick={() => setSelectedBackup(item.fileName)}
                                                title={item.fileName}
                                            >
                                                {item.fileName}
                                            </button>

                                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-(--text-muted)">
                                                <span>{formatBytes(item.sizeBytes)}</span>
                                                <span>Created: {formatDate(item.createdAt)}</span>
                                                {item.totalCollections ? <span>Collections: {item.totalCollections}</span> : null}
                                                {typeof item.totalDocuments === "number" ? <span>Docs: {item.totalDocuments}</span> : null}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => setSelectedBackup(item.fileName)}
                                            >
                                                <Info size={14} /> Details
                                            </Button>

                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                onClick={() => onDownloadBackup(item.fileName)}
                                                disabled={isDownloadingSingle}
                                            >
                                                <Download size={14} /> Download
                                            </Button>

                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="danger"
                                                onClick={() => onDeleteBackup(item.fileName)}
                                                disabled={isDeletingSingle}
                                            >
                                                <Trash2 size={14} /> Delete
                                            </Button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </section>

                <section className="xl:col-span-4 rounded-3xl border border-(--border) bg-(--surface) p-4 shadow-sm ring-1 ring-black/5">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <div className="text-sm font-extrabold">Backup details</div>
                            <div className="mt-1 text-xs font-semibold text-(--text-muted)">
                                Select a backup to view import metadata.
                            </div>
                        </div>

                        <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={onCopyImportExample}
                            disabled={!selectedBackupDetails?.metadata?.importGuide?.mongoimportExample}
                        >
                            <Copy size={14} /> Copy
                        </Button>
                    </div>

                    {!selectedBackup ? (
                        <div className="mt-4 rounded-2xl border border-dashed border-(--border) p-4 text-sm font-semibold text-(--text-muted)">
                            No backup selected.
                        </div>
                    ) : isFetchingDetails ? (
                        <div className="mt-4 rounded-2xl border border-(--border) p-4 text-sm font-semibold text-(--text-muted)">
                            Loading details…
                        </div>
                    ) : (
                        <div className="mt-4 space-y-3">
                            <div className="rounded-2xl border border-(--border) bg-(--surface-2) p-3">
                                <div className="truncate text-xs font-semibold text-(--text-muted)">File</div>
                                <div className="mt-1 truncate text-sm font-extrabold">{selectedBackupDetails?.fileName || selectedBackup}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="rounded-2xl border border-(--border) bg-(--surface-2) p-3">
                                    <div className="text-xs font-semibold text-(--text-muted)">Collections</div>
                                    <div className="mt-1 text-sm font-extrabold">{selectedBackupDetails?.metadata?.totalCollections ?? "—"}</div>
                                </div>
                                <div className="rounded-2xl border border-(--border) bg-(--surface-2) p-3">
                                    <div className="text-xs font-semibold text-(--text-muted)">Documents</div>
                                    <div className="mt-1 text-sm font-extrabold">{selectedBackupDetails?.metadata?.totalDocuments ?? "—"}</div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-(--border) bg-(--surface-2) p-3">
                                <div className="text-xs font-semibold text-(--text-muted)">Generated at</div>
                                <div className="mt-1 text-sm font-extrabold">
                                    {formatDate(selectedBackupDetails?.metadata?.generatedAt || selectedBackupDetails?.createdAt)}
                                </div>
                            </div>

                            <div className="rounded-2xl border border-(--border) bg-(--surface-2) p-3">
                                <div className="text-xs font-semibold text-(--text-muted)">Mongo import example</div>
                                <pre className="mt-2 overflow-auto rounded-xl border border-(--border) bg-(--surface) p-2 text-[11px] font-semibold text-(--text-muted)">
                                    {selectedBackupDetails?.metadata?.importGuide?.mongoimportExample || "No metadata found"}
                                </pre>
                            </div>

                            <div>
                                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-(--text-muted)">
                                    <Upload size={14} /> Import notes
                                </div>
                                <ul className="space-y-2 rounded-2xl border border-(--border) bg-(--surface-2) p-3 text-xs font-semibold text-(--text-muted)">
                                    {(selectedBackupDetails?.metadata?.importGuide?.notes || []).map((note) => (
                                        <li key={note}>• {note}</li>
                                    ))}
                                    {!selectedBackupDetails?.metadata?.importGuide?.notes?.length ? (
                                        <li>• No notes available</li>
                                    ) : null}
                                </ul>
                            </div>
                        </div>
                    )}
                </section>
            </div>

            <ConfirmDialog
                open={confirmDelete.open}
                title="Delete backup"
                message={
                    confirmDelete.type === "latest"
                        ? `Are you sure you want to delete latest backup (${confirmDelete.fileName || ""})?`
                        : `Are you sure you want to delete backup (${confirmDelete.fileName || ""})?`
                }
                confirmText="Delete"
                cancelText="Cancel"
                onCancel={closeDeleteDialog}
                onConfirm={onConfirmDelete}
                loading={isDeletingSingle || isDeletingLatest}
            />
        </div>
    )
}
