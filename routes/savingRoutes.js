import express from 'express';
import { createSaving, checkSavingsHealth, saveFromBudget, savingsSummary } from '../controllers/savingController.js';


const router = express.Router();

router.post('/create', createSaving);
router.post('/check-health', checkSavingsHealth);
router.post('/from-budget', saveFromBudget);
router.post('/summary', savingsSummary);


export default router;
