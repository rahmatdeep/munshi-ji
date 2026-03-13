import { z } from "zod";

export const attachmentTypeEnum = z.enum(["UPLOAD", "LINK"]);

export const createAttachmentSchema = z.object({
  type: attachmentTypeEnum,
  title: z.string().min(1),
  description: z.string().optional(),
  // For uploads
  file: z.any().optional(), // Will be validated in middleware
  // For links
  url: z.string().url().optional(),
});

export const editAttachmentSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
});
