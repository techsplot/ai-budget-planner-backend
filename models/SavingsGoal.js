import mongoose from 'mongoose';

const SavingsGoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String, required: true // e.g. "Buy Laptop"
  },
  targetAmount: {
    type: Number, required: true // e.g. 20000
  },
  deadline: {
    type: Date
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model('SavingsGoal', SavingsGoalSchema);
