'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../../../components/LanguageProvider';

export default function ExtraExpensesSection({ onDataChange }) {
  const { t } = useLanguage();
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');
  
  const [formData, setFormData] = useState({
    expenseName: '',
    amount: '',
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/finance?type=EXTRA_EXPENSES');
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      type: 'EXTRA_EXPENSES',
      fields: {
        expenseName: formData.expenseName,
        amount: parseFloat(formData.amount),
      },
      totalCost: parseFloat(formData.amount),
      netProfit: -parseFloat(formData.amount), // Expenses are negative
    };

    try {
      if (editingId) {
        const response = await fetch(`/api/finance?id=${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          await fetchExpenses();
          resetForm();
          onDataChange();
        }
      } else {
        const response = await fetch('/api/finance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          await fetchExpenses();
          resetForm();
          onDataChange();
        }
      }
    } catch (error) {
      console.error('Error saving expense:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingId(expense._id);
    setFormData({
      expenseName: expense.fields.expenseName,
      amount: expense.fields.amount.toString(),
    });
    setShowForm(true);
  };

  const openDeleteConfirm = (expense) => {
    setExpenseToDelete(expense);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!expenseToDelete) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/api/finance?id=${expenseToDelete._id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchExpenses();
        onDataChange();
        setDeleteConfirmOpen(false);
        setExpenseToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    } finally {
      setDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      expenseName: '',
      amount: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filterByDate = (date) => {
    if (!date) return true;
    const expenseDate = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateFilter) {
      case 'today':
        return expenseDate >= today;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return expenseDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return expenseDate >= monthAgo;
      case 'year':
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return expenseDate >= yearAgo;
      case 'all':
      default:
        return true;
    }
  };

  const filteredExpenses = expenses.filter(expense => filterByDate(expense.createdAt));
  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + (expense.fields.amount || 0), 0);

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {t('extra_expenses_title') || 'Extra Expenses'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('extra_expenses_description') || 'Track additional business expenses'}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('add_expense') || 'Add Expense'}
        </button>
      </div>

      {/* Date Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: 'all', label: t('all') || 'All' },
          { value: 'today', label: t('today') || 'Today' },
          { value: 'week', label: t('this_week') || 'This Week' },
          { value: 'month', label: t('this_month') || 'This Month' },
          { value: 'year', label: t('this_year') || 'This Year' },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setDateFilter(filter.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              dateFilter === filter.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Total Summary Card */}
      <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
        <h3 className="text-sm font-medium opacity-90 mb-1">
          {t('total_extra_expenses') || 'Total Extra Expenses'}
        </h3>
        <p className="text-3xl font-bold">
          {totalExpenses.toLocaleString()} {t('dzd') || 'DZD'}
        </p>
        <p className="text-sm opacity-75 mt-2">
          {filteredExpenses.length} {t('expense_items') || 'expense(s)'}
        </p>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingId ? (t('edit_expense') || 'Edit Expense') : (t('add_new_expense') || 'Add New Expense')}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('expense_name') || 'Expense Name'} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.expenseName}
                  onChange={(e) => setFormData({ ...formData, expenseName: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder={t('enter_expense_name') || 'Enter expense name'}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('amount') || 'Amount'} (DZD) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder={t('enter_amount') || 'Enter amount'}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('saving') || 'Saving...'}
                  </>
                ) : (
                  editingId ? (t('update') || 'Update') : (t('add') || 'Add')
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expenses Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              {t('no_expenses_found') || 'No expenses found'}
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
              {t('add_first_expense') || 'Add your first expense to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('expense_name') || 'Expense Name'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('amount') || 'Amount'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('date') || 'Date'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('actions') || 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredExpenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {expense.fields.expenseName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-red-600 dark:text-red-400">
                        {expense.fields.amount.toLocaleString()} DZD
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(expense.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(expense)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && expenseToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {t('confirm_delete') || 'Delete Expense?'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t('delete_expense_warning') || 'Are you sure you want to delete this expense? This action cannot be undone.'}
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <p className="font-medium text-gray-900 dark:text-white">{expenseToDelete.fields.expenseName}</p>
                  <p className="text-sm text-red-600 dark:text-red-400 font-semibold">
                    {expenseToDelete.fields.amount.toLocaleString()} DZD
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setExpenseToDelete(null);
                }}
                disabled={deleting}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('deleting') || 'Deleting...'}
                  </>
                ) : (
                  t('delete') || 'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
