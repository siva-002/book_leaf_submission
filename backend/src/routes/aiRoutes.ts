import { Router } from 'express';
import { testClassification, regenerateDraft } from '../controllers/aiController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Test classification (available to authenticated users)
router.post('/classify', authenticate, testClassification);

// Regenerate draft response (admin only)
router.post('/tickets/:ticketId/draft', authenticate, requireAdmin, regenerateDraft);

export default router;
