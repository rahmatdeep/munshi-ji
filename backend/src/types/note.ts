import { z } from 'zod';

export const personalNoteSchema = z.object({
    content: z.string().min(1, 'Note content cannot be empty').max(5000, 'Note content is too long'),
});

export const sharedNoteSchema = z.object({
    content: z.string().min(1, 'Note content cannot be empty').max(5000, 'Note content is too long'),
});

export type PersonalNoteInput = z.infer<typeof personalNoteSchema>;
export type SharedNoteInput = z.infer<typeof sharedNoteSchema>;
