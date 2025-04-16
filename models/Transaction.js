import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  isConfirmed: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Transaction', TransactionSchema);
