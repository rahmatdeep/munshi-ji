import { z } from 'zod';

export const requestMagicLinkSchema = z.object({
    email: z.string().email('Invalid email address'),
});

export const verifyMagicLinkSchema = z.object({
    token: z.string().min(1, 'Token is required'),
});

export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    name: z.string().optional(),
    role: z.enum(['ADMIN', 'USER']).optional().default('USER'),
});

export type RequestMagicLinkRequest = z.infer<typeof requestMagicLinkSchema>;
export type VerifyMagicLinkRequest = z.infer<typeof verifyMagicLinkSchema>;
export type RegisterRequest = z.infer<typeof registerSchema>;

export interface UserPayload {
    userId: string;
    email: string;
    name?: string | null;
    role: 'ADMIN' | 'USER';
}
