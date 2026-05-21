import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';

export const getTransactions = async (req, res) => {
  try {
    const filter = { userId: req.user.id };
    const { budgetId, category, type, startDate, endDate } = req.query;
    if (budgetId) filter.budgetId = budgetId;
    if (category) filter.category = category.toLowerCase();
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    const transactions = await Transaction.find(filter).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createTransaction = async (req, res) => {
  try {
    const { budgetId, category, amount, date, description, type } = req.body;
    const budget = await Budget.findById(budgetId);
    if (!budget || budget.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Budget not found or access denied' });
    }
    const transaction = await Transaction.create({
      userId: req.user.id, budgetId, category, amount, date, description, type,
    });
    res.status(201).json(transaction);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    const allowed = ['category', 'amount', 'date', 'description', 'type'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) transaction[field] = req.body[field];
    });
    await transaction.save();
    res.status(200).json(transaction);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    if (transaction.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });
    await transaction.deleteOne();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
