import express from 'express';
import { createTransaction, confirmCategory } from '../controllers/transactionController.js';

const router = express.Router();

// Route: POST /api/transactions
router.post('/', createTransaction);

router.post('/', createTransaction);

// ✅ Add new route to confirm and learn category
router.patch('/:id/confirm', confirmCategory);

export default router;
