import mongoose from 'mongoose';
import Budget from '../models/Budget.js';
import Saving from '../models/Saving.js';
import SavingsGoal from '../models/SavingsGoal.js';

export const createSaving = async (req, res, next) => {
  try {
    const { userId, amount, percentage, source, targetGoal, linkedTransactionId } = req.body;

    if (!userId || !amount || !percentage) {
      return res.status(400).json({ success: false, message: 'userId, amount, and percentage are required' });
    }

    const savedAmount = (percentage / 100) * amount;

    let assignedGoalTitle = null;

    // ✅ Try matching the title with an active goal
    if (targetGoal) {
      const goal = await SavingsGoal.findOne({ userId, title: targetGoal, isCompleted: false });

      if (goal) {
        assignedGoalTitle = goal.title; // valid goal title
      } else {
        return res.status(404).json({
          success: false,
          message: `No active goal found with the name "${targetGoal}"`
        });
      }
    }

    const saving = new Saving({
      userId,
      amount: savedAmount,
      source: source || `${percentage}% of ₦${amount}`,
      targetGoal: assignedGoalTitle,
      linkedTransactionId
    });

    await saving.save();

    res.status(201).json({ success: true, message: 'Saving recorded', saving });
  } catch (err) {
    next(err);
  }
};


export const checkSavingsHealth = async (req, res, next) => {
    try {
      const { userId, bankBalance } = req.body;
  
      const totalActiveSavings = await Saving.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), isActive: true } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
  
      const total = totalActiveSavings[0]?.total || 0;
  
      let message = 'Your savings are safe ✅';
      let status = 'healthy';
  
      if (bankBalance < total) {
        message = '⚠️ Warning: You may have spent part of your saved funds!';
        status = 'overspent';
      }
  
      res.json({ success: true, status, totalSaved: total, bankBalance, message });
    } catch (err) {
      next(err);
    }
  };


export const saveFromBudget = async (req, res, next) => {
  try {
    const { userId, category, amount, targetGoal } = req.body;

    if (!userId || !category || !amount) {
      return res.status(400).json({ success: false, message: 'userId, category, and amount are required' });
    }

    const budget = await Budget.findOne({ userId, category });
    if (!budget) return res.status(404).json({ success: false, message: 'No budget found for this category' });

    const surplus = budget.limit - budget.currentSpend;
    if (surplus < amount) {
      return res.status(400).json({ success: false, message: `Only ₦${surplus} is available as surplus` });
    }

    // Optionally link to goal
    let assignedGoalTitle = null;
    if (targetGoal) {
      const goal = await SavingsGoal.findOne({ userId, title: targetGoal, isCompleted: false });
      if (goal) assignedGoalTitle = goal.title;
      else return res.status(404).json({ success: false, message: 'Target goal not found' });
    }

    const saving = new Saving({
      userId,
      amount,
      source: `Surplus from ${category}`,
      targetGoal: assignedGoalTitle
    });

    await saving.save();

    // Optionally adjust currentSpend (or not — depends on your design)
    // Or mark the surplus as "used"

    res.status(201).json({ success: true, message: 'Saved from budget surplus', saving });
  } catch (err) {
    next(err);
  }
};

export const savingsSummary = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const allSavings = await Saving.find({ userId });

    const summary = {
      totalSaved: 0,
      fromIncome: 0,
      fromBudget: 0
    };

    for (const saving of allSavings) {
      summary.totalSaved += saving.amount;

      if (saving.source.toLowerCase().includes('surplus from')) {
        summary.fromBudget += saving.amount;
      } else {
        summary.fromIncome += saving.amount;
      }
    }

    res.json({ success: true, summary });
  } catch (err) {
    next(err);
  }
};

