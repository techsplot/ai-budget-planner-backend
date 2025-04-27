import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';
import User from '../models/User.js';
import { autoCategorize } from '../utils/categorizer.js';
import LearnedKeyword from '../models/LearnedKeyword.js';

export const createTransaction = async (req, res, next) => {
  try {
    const { userId, amount, description } = req.body;

    // Step 1: Make sure user exists
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format.'
      });
    }
    
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please check userId.'
      });
    }
    

    // Step 2: Auto-categorize transaction
    const category = await autoCategorize({ description });

    // Step 3: Save transaction
    const transaction = await Transaction.create({
      userId,
      amount,
      description,
      category,
      isConfirmed: false
    });

    // Step 4: Check against budget (if one exists)
    let overBudget = false;
    const budget = await Budget.findOne({ userId, category });

    if (budget) {
      budget.currentSpend += amount;
      await budget.save();

      if (budget.currentSpend > budget.limit) {
        overBudget = true;
      }
    }

    // Step 5: Return the response
    res.status(201).json({
      success: true,
      transaction,
      overBudget
    });
  } catch (err) {
    next(err); // Pass any errors to your error handler
  }
};



export const confirmCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category, userId } = req.body;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    transaction.category = category;
    transaction.isConfirmed = true;
    await transaction.save();

    // Learn from user feedback
    const keyword = transaction.description.toLowerCase();
    await LearnedKeyword.findOneAndUpdate(
      { userId, keyword },
      { category },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: 'Category confirmed and learned', transaction });
  } catch (err) {
    next(err);
  }
};
