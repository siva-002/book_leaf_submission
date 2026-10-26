import { Router } from 'express';
import {
  getMyBooks,
  getMyTickets,
  submitTicket,
  replyToTicket,
} from '../controllers/authorController';
import { authenticate, requireAuthor } from '../middleware/authMiddleware';

const router = Router();

// Protect all author routes with JWT auth and role check
router.use(authenticate, requireAuthor);

router.get('/books', getMyBooks);
router.get('/tickets', getMyTickets);
router.post('/tickets', submitTicket);
router.post('/tickets/:ticketId/reply', replyToTicket);

export default router;
