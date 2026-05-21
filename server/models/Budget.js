import mongoose from 'mongoose';

// TODO: define categorySchema with fields:
//   name          – String, required, lowercase
//   plannedAmount – Number, required, min: 0

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, lowercase: true },
  plannedAmount: { type: Number, required: true, min: 0 },
});

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
  categories: [categorySchema],
  createdAt: { type: Date, default: Date.now },
});

budgetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);
export default Budget;
