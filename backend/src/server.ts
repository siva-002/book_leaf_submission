import http from 'http';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/config';
import { connectDatabase } from './config/database';
import { seedDatabase } from './services/seedService';
import { initializeSocket } from './socket/socketHandler';
import path from 'path';
import fs from 'fs';
import { errorHandler } from './middleware/errorHandler';
import baseRouter from './routes';

const app = express();
const server = http.createServer(app);

// Initialize WebSockets
initializeSocket(server);

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploads
const uploadDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Request logger
app.use((req: Request, _res: Response, next) => {
  if (config.nodeEnv === 'development') {
    console.log(`[API] ${req.method} ${req.url}`);
  }
  next();
});

// Mount Base API Router (/api/*)
app.use('/api', baseRouter);

// Global Centralized Error Handler
app.use(errorHandler);

// Server bootstrap with database initialization
const startServer = async () => {
  try {
    await connectDatabase();
    await seedDatabase(false); // Seed sample data if not already present

    server.listen(config.port, () => {
      console.log('==================================================================');
      console.log(`BookLeaf Support API Server is running on http://localhost:${config.port}`);
      console.log(`WebSocket server initialized`);
      const aiStatus = config.ai.openrouterApiKey
        ? `OpenRouter (${config.ai.model})`
        : config.ai.openaiApiKey
        ? `OpenAI (${config.ai.model})`
        : 'BookLeaf Built-In Rule Engine (Zero external dependencies)';
      console.log(`AI Engine: ${aiStatus}`);
      console.log(`API Documentation: http://localhost:${config.port}/api`);
      console.log('==================================================================');
    });
  } catch (error) {
    console.error('Fatal error starting server:', error);
    process.exit(1);
  }
};

startServer();
