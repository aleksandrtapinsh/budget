import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';

export const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id }).sort({ year: -1, month: -1 });
    res.status(200).json(budgets);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createBudget = async (req, res) => {
  try {
    const { name, month, year, categories, income } = req.body;
    const existing = await Budget.findOne({ userId: req.user.id, month, year });
    if (existing) return res.status(409).json({ message: 'A budget for that month already exists' });
    const budget = await Budget.create({ userId: req.user.id, name, month, year, categories, income });
    res.status(201).json(budget);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    if (budget.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    if (req.body.name !== undefined) budget.name = req.body.name;
    if (req.body.categories !== undefined) budget.categories = req.body.categories;
    if (req.body.income !== undefined) budget.income = req.body.income;
    await budget.save();
    res.status(200).json(budget);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    if (budget.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    await Transaction.deleteMany({ budgetId: budget._id });
    await budget.deleteOne();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
