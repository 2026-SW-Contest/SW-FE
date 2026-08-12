const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(
  /\/$/,
  "",
);

export const getPublicFileUrl = (fileId: number) =>
  `${API_BASE_URL}/api/files/${fileId}`;
