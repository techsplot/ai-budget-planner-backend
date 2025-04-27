import User from '../models/User.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, { password: 0 }); // exclude password
    res.json({ success: true, users });
  } catch (err) {
    next(err);
  }
};
