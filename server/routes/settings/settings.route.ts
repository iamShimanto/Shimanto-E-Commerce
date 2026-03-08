import { Router } from "express";
import { roleChecker } from "../../middleware/roleChecker.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import * as settings from "../../controllers/settings/backups.controller";

const router = Router();

// store
// router.post("/store", roleChecker("admin"), createStoreSettings);
// router.get("/store", getStoreSettings);

// backup
router.get(
  "/backup",
  roleChecker("admin"),
  asyncHandler(settings.backupDatabase),
);
router.post(
  "/backup/create",
  roleChecker("admin"),
  asyncHandler(settings.createBackup),
);
router.get(
  "/backup/:id",
  roleChecker("admin"),
  asyncHandler(settings.getSingleBackup),
);
router.get(
  "/backup/download/:id",
  roleChecker("admin"),
  asyncHandler(settings.downloadSingleBackup),
);
router.get(
  "/backup/download",
  roleChecker("admin"),
  asyncHandler(settings.downloadLatestBackup),
);
router.delete(
  "/backup/:id",
  roleChecker("admin"),
  asyncHandler(settings.deleteSingleBackup),
);
router.delete(
  "/delete-backup",
  roleChecker("admin"),
  asyncHandler(settings.deleteLatestBackup),
);

export default router;
