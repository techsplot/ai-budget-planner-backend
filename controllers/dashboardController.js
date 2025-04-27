import Transaction from '../models/Transaction.js';
import Saving from '../models/Saving.js';
import SavingsGoal from '../models/SavingsGoal.js';

export const getDashboardData = async (req, res, next) => {
  try {
    const { userId, bankBalance, manualSpending } = req.body;

    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    // Get transactions this month
    const monthlyTransactions = await Transaction.find({
      userId,
      createdAt: { $gte: monthStart },
      amount: { $gt: 0 }
    });

    const monthlySpend = monthlyTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    // Calculate total savings
    const activeSavings = await Saving.aggregate([
      { $match: { userId: userId, isActive: true } },
      { $group: { _id: null, totalSaved: { $sum: "$amount" } } }
    ]);

    const totalSaved = activeSavings[0]?.totalSaved || 0;

    // Cash Flow Prediction (using same fallback logic)
    let dailyAvg;
    let periodUsed = 'manual input';

    if (manualSpending && manualSpending.length >= 3) {
      const totalManualSpent = manualSpending.reduce((sum, val) => sum + val, 0);
      dailyAvg = totalManualSpent / manualSpending.length;
    } else {
      const past7Days = new Date();
      past7Days.setDate(today.getDate() - 7);

      const past30Days = new Date();
      past30Days.setDate(today.getDate() - 30);

      let transactions = await Transaction.find({
        userId,
        createdAt: { $gte: past7Days },
        amount: { $gt: 0 }
      });

      let period = 7;

      if (transactions.length < 3) {
        transactions = await Transaction.find({
          userId,
          createdAt: { $gte: past30Days },
          amount: { $gt: 0 }
        });
        period = 30;
      }

      if (transactions.length > 0) {
        const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
        dailyAvg = totalSpent / period;
        periodUsed = `${period} days transaction history`;
      } else {
        dailyAvg = null;
      }
    }

    let prediction = null;

    if (dailyAvg) {
        const daysLeft = Math.floor(bankBalance / dailyAvg);
        const predictedTotalSpend = Math.round(dailyAvg * daysLeft);
        const predictedBalance = Math.round(bankBalance - predictedTotalSpend);
      
        const predictedExhaustDate = new Date();
        predictedExhaustDate.setDate(today.getDate() + daysLeft);
      
        // 📢 Warning system
        let predictionStatus = {
          level: 'safe',
          message: 'You are financially healthy at your current spending rate.'
        };
      
        if (predictedBalance <= 0) {
          predictionStatus = {
            level: 'critical',
            message: `⚠️ You will run out of money by ${predictedExhaustDate.toDateString()} if your spending continues.`
          };
        } else if (predictedBalance <= 0.2 * bankBalance) {
          predictionStatus = {
            level: 'warning',
            message: `⚠️ Warning: You will have less than 20% of your current balance left in ${daysLeft} days.`
          };
        }
      
        prediction = {
          dailyAvg: Math.round(dailyAvg),
          basedOn: periodUsed,
          daysLeft,
          predictedTotalSpend,
          predictedBalance,
          predictedExhaustDate: predictedExhaustDate.toDateString(),
          predictionStatus // 🧠 Add the warning
        };
      }
      
      

    res.json({
      success: true,
      dashboard: {
        balance: bankBalance,
        totalMonthlySpend: monthlySpend,
        totalSaved,
        prediction
      }
    });

  } catch (err) {
    next(err);
  }
};
