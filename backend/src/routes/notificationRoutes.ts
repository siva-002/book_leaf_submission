import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearNotifications,
} from '../controllers/notificationController';

const router = Router();

router.use(authenticate);


router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/clear', clearNotifications);

export default router;
