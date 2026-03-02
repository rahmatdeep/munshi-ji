import { z } from "zod";
import { VALID_CASE_TYPES } from "./phhc";

export const saveCaseSchema = z
  .object({
    caseType: z.enum(VALID_CASE_TYPES).optional(),
    caseNo: z.string().min(1).optional(),
    caseYear: z.number().int().min(1900).max(2100).optional(),
    caseId: z.string().uuid().optional(),
  })
  .refine(
    (data) => {
      // Either (caseType, caseNo, caseYear) OR (caseId) must be provided
      const hasDetails = data.caseType && data.caseNo && data.caseYear;
      const hasId = !!data.caseId;
      return hasDetails || hasId;
    },
    {
      message: "Must provide either case details or a valid case ID",
      path: ["caseId"],
    },
  );

export const shareCaseSchema = z.object({
  caseId: z.string().uuid("Invalid case ID"),
  recipientEmails: z.array(z.string().email("Invalid recipient email")),
});

export const unsaveCaseSchema = z.object({
  caseId: z.string().uuid("Invalid case ID"),
});
