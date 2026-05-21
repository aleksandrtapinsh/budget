import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';

export const getBudgetSummary = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.budgetId);
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    if (budget.userId.toString() !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    const spendingByCategory = await Transaction.aggregate([
      { $match: { budgetId: budget._id, type: 'expense' } },
      { $group: { _id: '$category', totalSpent: { $sum: '$amount' } } },
    ]);

    const spendingMap = Object.fromEntries(spendingByCategory.map((r) => [r._id, r.totalSpent]));

    const summary = budget.categories.map((cat) => {
      const totalSpent = spendingMap[cat.name] ?? 0;
      const remaining = cat.plannedAmount - totalSpent;
      const percentUsed = cat.plannedAmount > 0 ? (totalSpent / cat.plannedAmount) * 100 : 0;
      return { category: cat.name, plannedAmount: cat.plannedAmount, totalSpent, remaining, percentUsed };
    });

    res.status(200).json(summary);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
