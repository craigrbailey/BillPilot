import express from 'express';
import billsRouter from './routes/bills.js';

const app = express();

app.use('/bills', billsRouter);

export default app; 