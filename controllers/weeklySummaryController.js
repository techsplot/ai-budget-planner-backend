import Transaction from '../models/Transaction.js';
import Saving from '../models/Saving.js';

export const getWeeklySummary = async (req, res, next) => {
  try {
    const { userId } = req.body;

    const today = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);

    // Fetch transactions from past 7 days
    const transactions = await Transaction.find({
      userId,
      createdAt: { $gte: weekAgo }
    });

    const totalSpentThisWeek = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    // Spending per category
    const categorySpending = {};
    transactions.forEach(tx => {
      const cat = tx.category || 'Uncategorized';
      if (!categorySpending[cat]) {
        categorySpending[cat] = 0;
      }
      categorySpending[cat] += tx.amount;
    });

    // Fetch savings from past 7 days
    const savings = await Saving.find({
      userId,
      createdAt: { $gte: weekAgo }
    });

    let totalSavedThisWeek = 0;
    let fromIncome = 0;
    let fromBudget = 0;

    savings.forEach(save => {
      totalSavedThisWeek += save.amount;
      if (save.source.toLowerCase().includes('surplus from')) {
        fromBudget += save.amount;
      } else {
        fromIncome += save.amount;
      }
    });

    // Motivational message generator
    let motivationalMessage = 'Keep it up! 🎯';
    if (totalSavedThisWeek > totalSpentThisWeek) {
      motivationalMessage = 'You saved more than you spent this week! 🏆';
    } else if (totalSavedThisWeek > 0) {
      motivationalMessage = 'Nice savings this week! 🌟 Try to save even more next week!';
    } else {
      motivationalMessage = 'Let\'s try to save something next week! 🚀';
    }

    res.json({
      success: true,
      weeklySummary: {
        totalSpentThisWeek,
        totalSavedThisWeek,
        categorySpending,
        savingsSources: {
          fromIncome,
          fromBudget
        },
        motivationalMessage
      }
    });

  } catch (err) {
    next(err);
  }
};

