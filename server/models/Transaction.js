import mongoose from 'mongoose';

// TODO: define transactionSchema with fields:
//   userId      – ObjectId, ref: 'User', required
//   budgetId    – ObjectId, ref: 'Budget', required
//   category    – String, required (will be normalized to lowercase)
//   amount      – Number, required, min: 0
//   date        – Date, required
//   description – String, trimmed
//   type        – String, enum: ['income', 'expense'], required
//   createdAt   – Date, default: Date.now

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  budgetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Budget', required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  date: { type: Date, required: true },
  description: { type: String, trim: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  createdAt: { type: Date, default: Date.now },
});

transactionSchema.pre('save', function (next) {
  this.category = this.category.toLowerCase();
  next();
});

transactionSchema.index({ userId: 1, budgetId: 1 });
transactionSchema.index({ userId: 1, date: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
