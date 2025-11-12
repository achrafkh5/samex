'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../../components/AdminSidebar';
import { useLanguage } from '../../components/LanguageProvider';
import { useAdminAuth } from '@/app/context/AdminAuthContext';

// Currency options
const CURRENCIES = ['DZD', 'USDT', 'KRW'];

export default function TransactionsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const { admin, loading: authLoading } = useAdminAuth();
  const [formData, setFormData] = useState({
    receiver: '',
    currencyFrom: '',
    currencyTo: '',
    amount: '',
  });
  const [transactions, setTransactions] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editRate, setEditRate] = useState('');
  const [updating, setUpdating] = useState(false);
  const [popup, setPopup] = useState({ show: false, type: '', message: '' });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmReceiptOpen, setConfirmReceiptOpen] = useState(false);
  const [transactionToConfirm, setTransactionToConfirm] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !admin) {
      router.push('/admin/login');
    }
  }, [admin, authLoading, router]);

  // Fetch admins and transactions on mount
  useEffect(() => {
    if (admin && !authLoading) {
      fetchAdmins();
      fetchTransactions();
    }
  }, [admin, authLoading]);

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admins');
      if (response.ok) {
        const data = await response.json();
        setAdmins(data);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => {
      setPopup({ show: false, type: '', message: '' });
    }, 3000);
  };

  // Date filtering function
  const filterByDate = (date) => {
    if (!date) return true;
    
    const itemDate = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateFilter) {
      case 'today':
        return itemDate >= today;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return itemDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return itemDate >= monthAgo;
      case 'year':
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return itemDate >= yearAgo;
      case 'all':
      default:
        return true;
    }
  };

  // Filter transactions by date
  const filteredTransactions = transactions?.filter(transaction => filterByDate(transaction?.createdAt)) || [];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.receiver || !formData.currencyFrom || !formData.currencyTo || !formData.amount) {
      showPopup('error', 'Please fill all fields');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      showPopup('error', 'Amount must be greater than 0');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderFullName: admin.fullName,
          receiverFullName: formData.receiver,
          currencyFrom: formData.currencyFrom,
          currencyTo: formData.currencyTo,
          amountSent: parseFloat(formData.amount),
        }),
      });

      if (response.ok) {
        showPopup('success', t('transaction_sent') || 'Transaction sent successfully!');
        // Reset form
        setFormData({
          receiver: '',
          currencyFrom: '',
          currencyTo: '',
          amount: '',
        });
        // Refresh transactions
        fetchTransactions();
      } else {
        const error = await response.json();
        showPopup('error', error.error || t('transaction_error'));
      }
    } catch (error) {
      console.error('Error sending transaction:', error);
      showPopup('error', t('transaction_error') || 'Failed to send transaction');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCurrencySymbol = (currency) => {
    const symbols = {
      DZD: 'دج',
      USDT: '₮',
      KRW: '₩',
  };
  return symbols[currency] || currency;
};

  const handleEditClick = (transaction) => {
    setEditingId(transaction._id);
    setEditRate(transaction.conversionRate.toString());
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditRate('');
  };

  const handleSaveEdit = async (transactionId) => {
    if (!editRate || parseFloat(editRate) <= 0) {
      showPopup('error', 'Please enter a valid conversion rate');
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch('/api/transactions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: transactionId,
          conversionRate: parseFloat(editRate),
        }),
      });

      if (response.ok) {
        showPopup('success', 'Transaction updated successfully!');
        setEditingId(null);
        setEditRate('');
        fetchTransactions();
      } else {
        const error = await response.json();
        showPopup('error', error.error || 'Failed to update transaction');
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      showPopup('error', 'Failed to update transaction');
    } finally {
      setUpdating(false);
    }
  };

  const openDeleteConfirm = (transaction) => {
    setTransactionToDelete(transaction);
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setTransactionToDelete(null);
  };

  const handleDelete = async (transactionId) => {
    setDeleting(true);
    try {
      const response = await fetch('/api/transactions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: transactionId }),
      });

      if (response.ok) {
        showPopup('success', 'Transaction deleted successfully!');
        fetchTransactions();
      } else {
        const error = await response.json();
        showPopup('error', error.error || 'Failed to delete transaction');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      showPopup('error', 'Failed to delete transaction');
    } finally {
      setDeleting(false);
      setDeleteConfirmOpen(false);
      setTransactionToDelete(null);
    }
  };

  const openConfirmReceipt = (transaction) => {
    setTransactionToConfirm(transaction);
    setConfirmReceiptOpen(true);
  };

  const closeConfirmReceipt = () => {
    setConfirmReceiptOpen(false);
    setTransactionToConfirm(null);
  };

  const handleConfirmReceipt = async (transactionId) => {
    setConfirming(true);
    try {
      const response = await fetch('/api/transactions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: transactionId }),
      });

      if (response.ok) {
        showPopup('success', 'Transaction confirmed successfully!');
        fetchTransactions();
        closeConfirmReceipt();
      } else {
        const error = await response.json();
        showPopup('error', error.error || 'Failed to confirm transaction');
      }
    } catch (error) {
      console.error('Error confirming transaction:', error);
      showPopup('error', 'Failed to confirm transaction');
    } finally {
      setConfirming(false);
    }
  };

// Show loading spinner while checking authentication
if (authLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

// If not authenticated, return null (will redirect)
if (!admin) {
  return null;
}  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Popup Notification */}
      {popup.show && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl border ${
              popup.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
            }`}
          >
            {popup.type === 'success' ? (
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <p className={`font-medium ${
              popup.type === 'success'
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'
            }`}>
              {popup.message}
            </p>
            <button
              onClick={() => setPopup({ show: false, type: '', message: '' })}
              className={`ml-2 ${
                popup.type === 'success'
                  ? 'text-green-600 hover:text-green-800 dark:text-green-400'
                  : 'text-red-600 hover:text-red-800 dark:text-red-400'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <AdminSidebar 
        currentPage="transactions" 
        onNavigate={(page) => {
          // Navigate to dashboard for module pages, or separate routes for finance/transactions
          if (page === 'finance' || page === 'transactions') {
            router.push(`/admin/${page}`);
          } else {
            router.push(`/admin/dashboard?page=${page}`);
          }
        }} 
      />
      
      <div className="flex-1 min-h-screen lg:pl-64">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('transactions_title') || 'Currency Transactions'}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {t('transactions_description') || 'Send money between admins in different currencies'}
            </p>
          </div>

        {/* Transaction Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
          {t('send_transaction_button') || 'Send Transaction'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Sender (Read-only) */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('sender_label') || 'Sender'}
              </label>
              <input
                type="text"
                value={admin?.fullName || ''}
                disabled
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white cursor-not-allowed"
              />
            </div>

            {/* Receiver */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('receiver_label') || 'Receiver'} *
              </label>
              <select
                value={formData.receiver}
                onChange={(e) => setFormData({ ...formData, receiver: e.target.value })}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t('select_receiver') || 'Select Receiver'}</option>
                {admins.map((adminUser) => (
                  <option key={adminUser._id} value={adminUser.fullName}>
                    {adminUser.fullName} {adminUser._id === admin?._id ? '(You)' : ''}
                  </option>
                ))}
              </select>
            </div>              {/* Currency From */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('currency_from_label') || 'Currency From'} *
                </label>
                <select
                  value={formData.currencyFrom}
                  onChange={(e) => setFormData({ ...formData, currencyFrom: e.target.value })}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('select_currency') || 'Select Currency'}</option>
                  {CURRENCIES.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency} ({getCurrencySymbol(currency)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Currency To */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('currency_to_label') || 'Currency To'} *
                </label>
                <select
                  value={formData.currencyTo}
                  onChange={(e) => setFormData({ ...formData, currencyTo: e.target.value })}
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('select_currency') || 'Select Currency'}</option>
                  {CURRENCIES.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency} ({getCurrencySymbol(currency)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div className="md:col-span-2">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('amount_label') || 'Amount'} *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                  placeholder="0.00"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
              >
                {submitting
                  ? t('sending') || 'Sending...'
                  : t('send_transaction_button') || 'Send Transaction'}
              </button>
            </div>
          </form>
        </div>

        {/* Transaction History */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {t('transaction_history_title') || 'Transaction History'}
            </h2>
            <button
              onClick={fetchTransactions}
              className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
            >
              {t('refresh') || 'Refresh'}
            </button>
          </div>

          {/* Date Filter Buttons */}
          <div className="mb-6 flex flex-wrap gap-2">
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
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  dateFilter === filter.value
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12 text-sm sm:text-base text-gray-500 dark:text-gray-400">
              {t('loading') || 'Loading...'}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-sm sm:text-base text-gray-500 dark:text-gray-400">
              {t('no_transactions') || 'No transactions yet'}
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                  >
                    {/* Transaction Header */}
                    <div className="flex items-start justify-between mb-3 pb-3 border-b border-gray-200 dark:border-gray-600">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {t('sender_label') || 'From'}:
                          </span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {transaction.senderFullName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            {t('receiver_label') || 'To'}:
                          </span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {transaction.receiverFullName}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          {new Date(transaction.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Currency Exchange */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {t('sent') || 'Sent'}
                          </p>
                          <div className="flex items-center gap-1">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
                              {transaction.currencyFrom}
                            </span>
                            <span className="text-base font-bold text-gray-900 dark:text-white">
                              {transaction.amountSent.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <svg
                          className="w-5 h-5 text-gray-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                        <div className="flex-1 text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {t('received') || 'Received'}
                          </p>
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-base font-bold text-green-600 dark:text-green-400">
                              {transaction.amountReceived.toLocaleString()}
                            </span>
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                              {transaction.currencyTo}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rate & Actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                      <div>
                        {editingId === transaction._id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              step="0.00001"
                              value={editRate}
                              onChange={(e) => setEditRate(e.target.value)}
                              className="w-24 px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded font-mono text-center text-gray-900 dark:text-white"
                            />
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                              {t('conversion_rate_label') || 'Rate'}
                            </p>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-mono">
                                  {transaction.conversionRate.toFixed(5)}
                                </span>
                                {transaction.isEdited && (
                                  <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded text-[10px] font-medium">
                                    ✎ {t('edited') || 'Edited'}
                                  </span>
                                )}
                                {transaction.confirmedByReceiver && (
                                  <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-[10px] font-medium">
                                    ✓ {t('confirmed') || 'Confirmed'}
                                  </span>
                                )}
                              </div>
                              {transaction.isEdited && transaction.editedBy && transaction.editedAt && (
                                <div className="text-[11px] text-gray-600 dark:text-gray-300 font-medium">
                                  👤 {t('edited_by') || 'Edited by'} <span className="font-semibold">{transaction.editedBy}</span>
                                  <br />
                                  📅 {t('on') || 'On'} {formatDate(transaction.editedAt)}
                                </div>
                              )}
                              {transaction.isEdited && (!transaction.editedBy || !transaction.editedAt) && (
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 italic">
                                  (Edited before tracking was enabled)
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {editingId === transaction._id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(transaction._id)}
                              disabled={updating}
                              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                              title={t('save') || 'Save'}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              disabled={updating}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                              title={t('cancel') || 'Cancel'}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        ) : !transaction.confirmedByReceiver ? (
                          <>
                            {transaction.receiverFullName === admin?.fullName && (
                              <button
                                onClick={() => openConfirmReceipt(transaction)}
                                className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title={t('confirm_receipt_button') || 'Confirm Receipt'}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                            )}
                            {(transaction.senderFullName === admin?.fullName || transaction.receiverFullName === admin?.fullName) && (
                              <>
                                <button
                                  onClick={() => handleEditClick(transaction)}
                                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                  title="Edit Rate"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => openDeleteConfirm(transaction)}
                                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </>
                            )}
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                      <th className="text-left py-3 px-3 text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        {t('sender_label') || 'From'}
                      </th>
                      <th className="text-left py-3 px-3 text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        {t('receiver_label') || 'To'}
                      </th>
                      <th className="text-center py-3 px-3 text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        {t('currencies') || 'Currencies'}
                      </th>
                      <th className="text-right py-3 px-3 text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        {t('sent') || 'Sent'}
                      </th>
                      <th className="text-right py-3 px-3 text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        {t('received') || 'Received'}
                      </th>
                      <th className="text-center py-3 px-3 text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        {t('rate') || 'Rate'}
                      </th>
                      <th className="text-left py-3 px-3 text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        {t('date') || 'Date'}
                      </th>
                      <th className="text-center py-3 px-3 text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        {t('actions') || 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr
                        key={transaction._id}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="py-3 px-3 text-gray-900 dark:text-white">
                          {transaction.senderFullName}
                        </td>
                        <td className="py-3 px-3 text-gray-900 dark:text-white">
                          {transaction.receiverFullName}
                        </td>
                        <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1">
                          <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
                            {transaction.currencyFrom}
                          </span>
                          <svg
                            className="w-3 h-3 text-gray-400 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14 5l7 7m0 0l-7 7m7-7H3"
                            />
                          </svg>
                          <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                            {transaction.currencyTo}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                        {transaction.amountSent.toLocaleString()}{' '}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {getCurrencySymbol(transaction.currencyFrom)}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-green-600 dark:text-green-400 whitespace-nowrap">
                        {transaction.amountReceived.toLocaleString()}{' '}
                        <span className="text-xs">
                          {getCurrencySymbol(transaction.currencyTo)}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {editingId === transaction._id ? (
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="number"
                              step="0.00001"
                              value={editRate}
                              onChange={(e) => setEditRate(e.target.value)}
                              className="w-24 px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded font-mono text-center text-gray-900 dark:text-white"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-mono">
                              {transaction.conversionRate.toFixed(5)}
                            </span>
                            {transaction.isEdited && (
                              <div className="flex flex-col items-center gap-1 mt-1">
                                <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded text-xs font-medium">
                                  ✎ {t('edited') || 'Edited'}
                                </span>
                                {transaction.editedBy && transaction.editedAt ? (
                                  <div className="text-[11px] text-gray-600 dark:text-gray-300 text-center font-medium">
                                    <div>👤 {transaction.editedBy}</div>
                                    <div>📅 {formatDate(transaction.editedAt)}</div>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-gray-400 dark:text-gray-500 italic">
                                    (before tracking)
                                  </span>
                                )}
                              </div>
                            )}
                            {transaction.confirmedByReceiver && (
                              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                                ✓ {t('confirmed') || 'Confirmed'}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-gray-500 dark:text-gray-400">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-center gap-1">
                          {editingId === transaction._id ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(transaction._id)}
                                disabled={updating}
                                className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                                title="Save"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                disabled={updating}
                                className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                title={t('cancel') || 'Cancel'}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </>
                          ) : !transaction.confirmedByReceiver ? (
                            <>
                              {transaction.receiverFullName === admin?.fullName && (
                                <button
                                  onClick={() => openConfirmReceipt(transaction)}
                                  className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                  title={t('confirm_receipt_button') || 'Confirm Receipt'}
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </button>
                              )}
                              {(transaction.senderFullName === admin?.fullName || transaction.receiverFullName === admin?.fullName) && (
                                <>
                                  <button
                                    onClick={() => handleEditClick(transaction)}
                                    className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    title={t('edit_rate') || 'Edit Rate'}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => openDeleteConfirm(transaction)}
                                    className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    title={t('delete') || 'Delete'}
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                  </button>
                                </>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-gray-600">{t('locked') || 'Locked'}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confirm Receipt Popup */}
      {confirmReceiptOpen && transactionToConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
              {t('confirm_receipt_of_transaction') || 'Confirm Receipt of Transaction'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
              {t('confirm_receipt_message') || 'Please review the transaction details below and confirm that you have received the funds.'}
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('sender') || 'Sender'}:</span>
                <span className="font-medium text-gray-900 dark:text-white">{transactionToConfirm.senderFullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('receiver_label') || 'Receiver'}:</span>
                <span className="font-medium text-gray-900 dark:text-white">{transactionToConfirm.receiverFullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('amount_sent') || 'Amount Sent'}:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {transactionToConfirm.amountSent.toLocaleString()} {transactionToConfirm.currencyFrom}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('amount_received') || 'Amount Received'}:</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {transactionToConfirm.amountReceived.toLocaleString()} {transactionToConfirm.currencyTo}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('rate') || 'Rate'}:</span>
                <span className="font-medium text-gray-900 dark:text-white font-mono">{transactionToConfirm.conversionRate.toFixed(5)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeConfirmReceipt}
                disabled={confirming}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={() => handleConfirmReceipt(transactionToConfirm._id)}
                disabled={confirming}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {confirming ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('confirming') || 'Confirming'}...
                  </>
                ) : (
                  t('confirm_receipt') || 'Confirm Receipt'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {deleteConfirmOpen && transactionToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">{t('delete_transaction') || 'Delete Transaction?'}</h3>
            <p className="text-sm text-gray-600 text-center mb-4">
              {t('delete_transaction_warning') || 'This action cannot be undone. The transaction will be permanently removed.'}
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('sender') || 'Sender'}:</span>
                <span className="font-medium text-gray-900">{transactionToDelete.senderFullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('receiver_label') || 'Receiver'}:</span>
                <span className="font-medium text-gray-900">{transactionToDelete.receiverFullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('amount') || 'Amount'}:</span>
                <span className="font-medium text-gray-900">
                  {transactionToDelete.currencyFrom} {transactionToDelete.amountSent} → {transactionToDelete.currencyTo} {transactionToDelete.amountReceived}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('rate') || 'Rate'}:</span>
                <span className="font-medium text-gray-900">{transactionToDelete.conversionRate.toFixed(4)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeDeleteConfirm}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={() => handleDelete(transactionToDelete._id)}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('deleting') || 'Deleting'}...
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
    </div>
  );
}
