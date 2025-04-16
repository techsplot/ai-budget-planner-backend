import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  matricNumber: {
    type: String,
    required: true,
    unique: true,
    match: [/^[A-Za-z0-9/]+$/, 'Matric number format is invalid']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/.+\@.+\..+/, 'Email format is invalid']
  },
  password: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('User', UserSchema);
