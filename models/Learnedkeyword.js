import mongoose from 'mongoose';

const LearnedKeywordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  keyword: {
    type: String,
    required: true,
    lowercase: true, // normalize text
    trim: true
  },
  category: {
    type: String,
    required: true
  }
}, { timestamps: true });

export default mongoose.model('LearnedKeyword', LearnedKeywordSchema);
