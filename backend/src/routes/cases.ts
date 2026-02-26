import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { fetchAndStorePHHCCase } from '../services/phhc';
import { fetchCaseSchema } from '../types/phhc';

const router = Router();


/**
 * POST /api/cases/fetch
 * Fetches case data from PHHC and stores it in the database.
 */
router.post('/fetch', authMiddleware, async (req: AuthRequest, res: Response): Promise<Response | void> => {
    const result = fetchCaseSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({ errors: result.error.issues });
    }

    try {
        const caseData = await fetchAndStorePHHCCase(result.data);

        if (!caseData) {
            return res.status(404).json({ error: 'Case not found on PHHC' });
        }

        return res.json({
            message: 'Case data fetched and stored successfully',
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

export default router;
