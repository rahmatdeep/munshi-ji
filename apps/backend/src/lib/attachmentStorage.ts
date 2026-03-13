import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOADS_BASE = path.join(process.cwd(), "uploads", "case-attachments");

export function ensureCaseAttachmentDir(caseId: string) {
  const dir = path.join(UPLOADS_BASE, caseId);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getAttachmentFilePath(caseId: string, filename: string) {
  return path.join(UPLOADS_BASE, caseId, filename);
}

export function generateStoredFilename(originalName: string) {
  const unique = uuidv4();
  return `${unique}_${originalName}`;
}

export function deleteAttachmentFile(caseId: string, filename: string) {
  const filePath = getAttachmentFilePath(caseId, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}
