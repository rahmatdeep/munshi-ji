import { z } from 'zod';
import { VALID_CASE_TYPES } from './phhc';

export const saveCaseSchema = z.object({
    caseType: z.enum(VALID_CASE_TYPES, {
        message: 'Invalid case type',
    }),
    caseNo: z.string().min(1, 'Case number is required'),
    caseYear: z.number().int().min(1900).max(2100),
});

export const unsaveCaseSchema = z.object({
    caseId: z.string().uuid('Invalid case ID'),
});
