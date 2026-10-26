import { Router } from 'express';
import {
  getAllTickets,
  getTicketById,
  updateTicket,
  addInternalNote,
  sendOfficialResponse,
  getQueueAnalytics,
} from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/authMiddleware';

const router = Router();

// Protect all admin routes with JWT auth and admin role check
router.use(authenticate, requireAdmin);

router.get('/tickets', getAllTickets);
router.get('/tickets/:ticketId', getTicketById);
router.patch('/tickets/:ticketId', updateTicket);
router.post('/tickets/:ticketId/notes', addInternalNote);
router.post('/tickets/:ticketId/reply', sendOfficialResponse);
router.get('/analytics', getQueueAnalytics);

export default router;
