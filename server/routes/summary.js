import express from 'express';
import { getBudgetSummary } from '../controllers/summaryController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/:budgetId', getBudgetSummary);

export default router;
