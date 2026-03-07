import { createApi } from "@reduxjs/toolkit/query/react";
import api from "../api";

const getFileNameFromDisposition = (dispositionValue) => {
  if (!dispositionValue || typeof dispositionValue !== "string") return null;

  const utf8Match = dispositionValue.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }

  const asciiMatch = dispositionValue.match(/filename="?([^";]+)"?/i);
  return asciiMatch?.[1] ?? null;
};

export const backupApi = createApi({
  reducerPath: "backupApi",
  baseQuery: api,
  tagTypes: ["Backup"],
  endpoints: (builder) => ({
    getBackupStatus: builder.query({
      query: () => ({
        url: "/api/v1/settings/backup",
        method: "GET",
      }),
      transformResponse: (response) => response?.data ?? null,
      providesTags: (result) => {
        const backups = Array.isArray(result?.backups) ? result.backups : [];
        return backups.length
          ? [
              { type: "Backup", id: "LIST" },
              ...backups
                .map((item) => item?.fileName)
                .filter(Boolean)
                .map((fileName) => ({ type: "Backup", id: fileName })),
            ]
          : [{ type: "Backup", id: "LIST" }];
      },
    }),

    createBackup: builder.mutation({
      query: () => ({
        url: "/api/v1/settings/backup/create",
        method: "POST",
      }),
      invalidatesTags: [{ type: "Backup", id: "LIST" }],
    }),

    getBackupDetails: builder.query({
      query: (backupName) => ({
        url: `/api/v1/settings/backup/${encodeURIComponent(backupName)}`,
        method: "GET",
      }),
      transformResponse: (response) => response?.data ?? null,
      providesTags: (result, error, backupName) =>
        backupName ? [{ type: "Backup", id: backupName }] : [],
    }),

    downloadBackup: builder.mutation({
      query: (backupName) => ({
        url: `/api/v1/settings/backup/download/${encodeURIComponent(backupName)}`,
        method: "GET",
        responseHandler: async (response) => response.blob(),
      }),
      transformResponse: (blob, meta, backupName) => {
        const contentDisposition = meta?.response?.headers?.get(
          "content-disposition",
        );
        const extractedName = getFileNameFromDisposition(contentDisposition);

        return {
          blob,
          fileName: extractedName || backupName || "database-backup.zip",
        };
      },
    }),

    downloadLatestBackup: builder.mutation({
      query: () => ({
        url: "/api/v1/settings/backup/download",
        method: "GET",
        responseHandler: async (response) => response.blob(),
      }),
      transformResponse: (blob, meta) => {
        const contentDisposition = meta?.response?.headers?.get(
          "content-disposition",
        );
        const extractedName = getFileNameFromDisposition(contentDisposition);

        return {
          blob,
          fileName: extractedName || "latest-database-backup.zip",
        };
      },
    }),

    deleteBackup: builder.mutation({
      query: (backupName) => ({
        url: `/api/v1/settings/backup/${encodeURIComponent(backupName)}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, backupName) =>
        error
          ? []
          : [
              { type: "Backup", id: "LIST" },
              ...(backupName ? [{ type: "Backup", id: backupName }] : []),
            ],
    }),

    deleteLatestBackup: builder.mutation({
      query: () => ({
        url: "/api/v1/settings/delete-backup",
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Backup", id: "LIST" }],
    }),
  }),
});

export const {
  useGetBackupStatusQuery,
  useCreateBackupMutation,
  useGetBackupDetailsQuery,
  useDownloadBackupMutation,
  useDownloadLatestBackupMutation,
  useDeleteBackupMutation,
  useDeleteLatestBackupMutation,
} = backupApi;
