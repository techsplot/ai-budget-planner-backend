import Transaction from '../models/Transaction.js';

export const cashFlowPrediction = async (req, res, next) => {
  try {
    const { userId, bankBalance, manualSpending } = req.body;

    const today = new Date();

    let dailyAvg;
    let periodUsed = 'manual input';

    if (manualSpending && manualSpending.length >= 3) {
      // User provided manual spending data
      const totalManualSpent = manualSpending.reduce((sum, val) => sum + val, 0);
      dailyAvg = totalManualSpent / manualSpending.length;
    } else {
      // Fallback to real transaction history
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

      if (transactions.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Not enough transaction data to predict. Please add more transactions or use manual input.'
        });
      }

      const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
      dailyAvg = totalSpent / period;
      periodUsed = `${period} days transaction history`;
    }

    const daysLeft = Math.floor(bankBalance / dailyAvg);
    const predictedExhaustDate = new Date();
    predictedExhaustDate.setDate(today.getDate() + daysLeft);

    res.json({
      success: true,
      prediction: {
        dailyAvg: Math.round(dailyAvg),
        basedOn: periodUsed,
        balance: bankBalance,
        daysLeft,
        predictedExhaustDate: predictedExhaustDate.toDateString()
      }
    });
  } catch (err) {
    next(err);
  }
};
