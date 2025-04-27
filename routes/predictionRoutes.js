import express from 'express';
import { cashFlowPrediction } from '../controllers/predictionController.js';

const router = express.Router();

router.post('/cashflow', cashFlowPrediction);

export default router;
