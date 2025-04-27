import mongoose from 'mongoose';

const SavingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  source: {
    type: String, // e.g. "10% of allowance", "Round-up from Airtime"
    default: "Manual"
  },
  targetGoal: {
    type: String, // e.g. "Laptop", "School Fees"
    required: false
  },
  linkedTransactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('Saving', SavingSchema);
