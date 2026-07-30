import type { ExportFormat } from "./types";

const EXTENSIONS: Record<ExportFormat, string> = {
  csv: "csv",
  excel: "xlsx",
  pdf: "pdf",
};

export function generateFilename(title: string, format: ExportFormat): string {
  const date = new Date().toISOString().split("T")[0];
  return `${title}_${date}.${EXTENSIONS[format]}`;
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
