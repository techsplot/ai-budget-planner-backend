import SavingsGoal from '../models/SavingsGoal.js';
import Saving from '../models/Saving.js';

export const createGoal = async (req, res, next) => {
  try {
    const { userId, title, targetAmount, deadline } = req.body;

    const goal = new SavingsGoal({
      userId,
      title,
      targetAmount,
      deadline
    });

    await goal.save();

    res.status(201).json({ success: true, goal });
  } catch (err) {
    next(err);
  }
};

export const checkGoalProgress = async (req, res, next) => {
  try {
    const { userId, goalId } = req.body;

    const goal = await SavingsGoal.findById(goalId);
    if (!goal) return res.status(404).json({ success: false, message: 'Goal not found' });

    const saved = await Saving.aggregate([
      { $match: { userId: goal.userId, targetGoal: goal.title, isActive: true } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalSaved = saved[0]?.total || 0;
    const remaining = goal.targetAmount - totalSaved;
    const isCompleted = totalSaved >= goal.targetAmount;

    if (isCompleted && !goal.isCompleted) {
      goal.isCompleted = true;
      await goal.save();
    }

    res.json({
      success: true,
      goal: {
        ...goal.toObject(),
        totalSaved,
        remaining,
        progressPercent: Math.min(100, Math.round((totalSaved / goal.targetAmount) * 100)),
        isCompleted
      }
    });
  } catch (err) {
    next(err);
  }
};
