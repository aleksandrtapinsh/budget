import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, lowercase: true },
  plannedAmount: { type: Number, required: true, min: 0 },
  color: { type: String, default: '#6366f1' },
});

const incomeSchema = new mongoose.Schema({
  payType: { type: String, enum: ['hourly', 'salary'], required: true },
  schedule: { type: String, enum: ['fullTime', 'partTime'], required: true },
  rate: { type: Number, required: true, min: 0 },
  hoursPerWeek: { type: Number, min: 1, max: 168 },
  monthlyIncome: { type: Number, required: true, min: 0 },
}, { _id: false });

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
  income: incomeSchema,
  categories: [categorySchema],
  createdAt: { type: Date, default: Date.now },
});

budgetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;
