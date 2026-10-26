import { Router, Request, Response } from 'express';
import { config } from '../config/config';
import authRoutes from './authRoutes';
import authorRoutes from './authorRoutes';
import adminRoutes from './adminRoutes';
import aiRoutes from './aiRoutes';
import uploadRoutes from './uploadRoutes';
import notificationRoutes from './notificationRoutes';

const baseRouter = Router();

// Sub-resource routers
baseRouter.use('/auth', authRoutes);
baseRouter.use('/author', authorRoutes);
baseRouter.use('/admin', adminRoutes);
baseRouter.use('/ai', aiRoutes);
baseRouter.use('/upload', uploadRoutes);
baseRouter.use('/notifications', notificationRoutes);


// Health check endpoint (/api/health)
baseRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'BookLeaf Author Support & Communication API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    aiEngine: config.ai.openrouterApiKey
      ? `OpenRouter (${config.ai.model})`
      : config.ai.openaiApiKey
      ? `OpenAI (${config.ai.model})`
      : 'BookLeaf Built-In Rule Engine (Active)',
  });
});

// API Documentation & Discovery endpoint (/api)
baseRouter.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'BookLeaf Author Support & Communication Portal API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/login': 'Login with email and password',
        'GET /api/auth/me': 'Get authenticated user info',
        'GET /api/auth/demo-accounts': 'Get pre-seeded test accounts for instant evaluation',
      },
      author: {
        'GET /api/author/books': 'View author published books & royalty stats',
        'GET /api/author/tickets': 'View author support tickets & message history',
        'POST /api/author/tickets': 'Submit new support ticket with AI auto-classification',
        'POST /api/author/tickets/:ticketId/reply': 'Send reply to open ticket',
      },
      admin: {
        'GET /api/admin/tickets': 'View unified ticket queue (filterable by status, category, priority)',
        'GET /api/admin/tickets/:ticketId': 'View ticket details with AI draft response and internal notes',
        'PATCH /api/admin/tickets/:ticketId': 'Update ticket status, override AI category/priority, assign agent',
        'POST /api/admin/tickets/:ticketId/notes': 'Add private internal team note (hidden from author)',
        'POST /api/admin/tickets/:ticketId/reply': 'Send official verified response to author',
        'GET /api/admin/analytics': 'Get queue health metrics and category distributions',
      },
      ai: {
        'POST /api/ai/classify': 'Run AI classification & priority scoring on test query',
        'POST /api/ai/tickets/:ticketId/draft': 'Regenerate tailored AI draft response for a ticket',
      },
    },
  });
});

export { baseRouter };
export default baseRouter;
