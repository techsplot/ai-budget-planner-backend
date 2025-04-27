// File: backend/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import transactionRoutes from './routes/transactionRoutes.js';
import savingRoutes from './routes/savingRoutes.js'; // ✅ Add this line
import savingsGoalRoutes from './routes/savingsGoalRoutes.js';
import userRoutes from './routes/userRoutes.js';
import predictionRoutes from './routes/predictionRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import weeklySummaryRoutes from './routes/weeklySummaryRoutes.js';




dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection failed:', err));

app.get('/', (req, res) => {
  res.send('🎉 Budget Planner API is live!');
});

// Register your auth route
app.use('/api/auth', authRoutes);

// Register your transaction route
app.use('/api/transactions', transactionRoutes);

// Register your saving route
app.use('/api/savings', savingRoutes);

app.use('/api/savings-goals', savingsGoalRoutes);

// Register your user route
app.use('/api/users', userRoutes);

// Register your prediction route
app.use('/api/predict', predictionRoutes);

// Register your dashboard route
app.use('/api/dashboard', dashboardRoutes);


// Add other routes here as needed
app.use('/api/weekly-summary', weeklySummaryRoutes);



// Error handler middleware (should be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));




