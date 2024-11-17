import express, { json } from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import registerRoutes from './routes/index.js';
import { initializeAdmin } from './setup/initializeAdmin.js';

// Load environment variables from .env file
config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize default admin user
initializeAdmin().catch(console.error);

// Middleware
app.use(cors());
app.use(json());

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Bills Tracker API!' });
});

// Register all routes
registerRoutes(app);

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
