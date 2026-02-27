import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { fetchPHHCCase, storePHHCCase } from '../services/phhc';
import { fetchCaseSchema } from '../types/phhc';
import { saveCaseSchema, unsaveCaseSchema, shareCaseSchema } from '../types/savedCase';
import prisma from '../lib/prisma';
import { sendShareCaseEmail } from '../lib/mail';

const router = Router();


/**
 * POST /api/cases/fetch
 * Fetches case data from PHHC WITHOUT storing it in the database.
 */
router.post('/fetch', authMiddleware, async (req: AuthRequest, res: Response): Promise<Response | void> => {
    const result = fetchCaseSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ errors: result.error.issues });
    }

    try {
        const caseData = await fetchPHHCCase(result.data);

        if (!caseData) {
            return res.status(404).json({ error: 'Case not found on PHHC' });
        }

        return res.json({
            message: 'Case data fetched successfully',
            case: caseData,
        });
    } catch (error: any) {
        console.error('PHHC fetch error:', error);

        if (error.message?.includes('PHHC API error')) {
            return res.status(502).json({ error: 'Failed to fetch data from PHHC. Please try again later.' });
        }

        return res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/cases/save
 * Fetches fresh data, stores it in DB, and links to the user.
 */
router.post('/save', authMiddleware, async (req: AuthRequest, res: Response): Promise<Response | void> => {
    const result = saveCaseSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ errors: result.error.issues });
    }

    const { caseType, caseNo, caseYear } = result.data;
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        let storedCase;

        if (result.data.caseId) {
            // Option A: Save by ID (Shared case)
            storedCase = await prisma.case.findUnique({
                where: { id: result.data.caseId }
            });

            if (!storedCase) {
                return res.status(404).json({ error: 'Case not found' });
            }
        } else if (result.data.caseType && result.data.caseNo && result.data.caseYear) {
            // Option B: Fetch and Save
            const { caseType, caseNo, caseYear } = result.data;

            // 1. Fetch fresh data from PHHC
            const phhcData = await fetchPHHCCase({
                case_type: caseType,
                case_no: caseNo,
                case_year: caseYear
            });

            if (!phhcData) {
                return res.status(404).json({ error: 'Case not found on PHHC' });
            }

            // 2. Store in DB
            storedCase = await storePHHCCase({
                case_type: caseType,
                case_no: caseNo,
                case_year: caseYear
            }, phhcData);
        }

        if (!storedCase) {
            return res.status(400).json({ error: 'Invalid request parameters' });
        }

        // 3. Link the case to the user (implicit many-to-many handles duplicate connections gracefully)
        await prisma.user.update({
            where: { id: userId },
            data: {
                savedCases: {
                    connect: { id: storedCase.id }
                }
            }
        });

        return res.json({
            message: 'Case saved successfully',
            case: storedCase,
        });
    } catch (error) {
        console.error('Case save error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/cases/unsave
 * Unlinks a case from the user.
 */
router.post('/unsave', authMiddleware, async (req: AuthRequest, res: Response): Promise<Response | void> => {
    const result = unsaveCaseSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ errors: result.error.issues });
    }

    const { caseId } = result.data;
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Use a transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
            // 1. Disconnect the user from the case
            await tx.user.update({
                where: { id: userId },
                data: {
                    savedCases: {
                        disconnect: { id: caseId }
                    }
                }
            });

            // 2. Check if any other users still have this case saved
            const caseWithCount = await tx.case.findUnique({
                where: { id: caseId },
                include: {
                    _count: {
                        select: { savedBy: true }
                    }
                }
            });

            // 3. If no users are linked, delete the case
            // Cascading deletes on the schema level will handle related models
            if (caseWithCount && caseWithCount._count.savedBy === 0) {
                await tx.case.delete({
                    where: { id: caseId }
                });
            }
        });

        return res.json({ message: 'Case unsaved successfully' });
    } catch (error) {
        console.error('Case unsave error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/cases/saved
 * Retrieves all cases saved by the authenticated user.
 */
router.get('/saved', authMiddleware, async (req: AuthRequest, res: Response): Promise<Response | void> => {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const userWithCases = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                savedCases: {
                    include: {
                        parties: true,
                        hearings: true,
                        orders: true,
                        objections: true,
                    },
                    orderBy: {
                        updatedAt: 'desc'
                    }
                }
            }
        });

        return res.json({
            savedCases: userWithCases?.savedCases || []
        });
    } catch (error) {
        console.error('Fetch saved cases error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * GET /api/cases/:id
 * Retrieves a single case by ID with full details.
 */
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<Response | void> => {
    const id = req.params.id as string;

    try {
        const caseDetails = await prisma.case.findUnique({
            where: { id },
            include: {
                parties: true,
                hearings: true,
                orders: true,
                objections: true,
            }
        });

        if (!caseDetails) {
            return res.status(404).json({ error: 'Case not found' });
        }

        return res.json({ case: caseDetails });
    } catch (error) {
        console.error('Fetch case by ID error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * POST /api/cases/share
 * Shares a case with another user via email.
 */
router.post('/share', authMiddleware, async (req: AuthRequest, res: Response): Promise<Response | void> => {
    const result = shareCaseSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ errors: result.error.issues });
    }

    const { caseId, recipientEmail } = result.data;
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // 1. Verify the case exists
        const caseRecord = await prisma.case.findUnique({
            where: { id: caseId }
        });

        if (!caseRecord) {
            return res.status(404).json({ error: 'Case not found' });
        }

        // 2. Get sharer name
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, email: true }
        });

        const sharerName = user?.name || user?.email || 'A user';

        // 3. Send email via Resend
        await sendShareCaseEmail(recipientEmail, caseId, sharerName);

        return res.json({ message: 'Case shared successfully' });
    } catch (error) {
        console.error('Case share error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
