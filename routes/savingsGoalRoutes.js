import express from 'express';
import { createGoal, checkGoalProgress } from '../controllers/savingsGoalController.js';

const router = express.Router();

router.post('/create', createGoal);
router.post('/progress', checkGoalProgress);

export default router;
