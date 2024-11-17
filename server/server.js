import express, { json } from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import registerRoutes from './routes/index.js';
import { initializeAdmin } from './setup/initializeAdmin.js';
import logger from './utils/logger.js';

// Load environment variables from .env file
config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize default admin user
initializeAdmin().catch((error) => {
    logger.error('Failed to initialize admin:', error);
});

// Middleware
app.use(cors());
app.use(json());

// Add error logging middleware
app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({ message: 'Internal server error' });
});

// Basic route
app.get('/', (req, res) => {
    logger.info('Root endpoint accessed');
    res.json({ message: 'Welcome to the Bills Tracker API!' });
});

// Register all routes
registerRoutes(app);

// Start server
app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
});
