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
      
      <div className="flex-1 min-h-screen">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('transactions_title') || 'Currency Transactions'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('transactions_description') || 'Send money between admins in different currencies'}
            </p>
          </div>

        {/* Transaction Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          {t('send_transaction_button') || 'Send Transaction'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sender (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('sender_label') || 'Sender'}
              </label>
              <input
                type="text"
                value={admin?.fullName || ''}
                disabled
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white cursor-not-allowed"
              />
            </div>

            {/* Receiver */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('receiver_label') || 'Receiver'} *
              </label>
              <select
                value={formData.receiver}
                onChange={(e) => setFormData({ ...formData, receiver: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('currency_from_label') || 'Currency From'} *
                </label>
                <select
                  value={formData.currencyFrom}
                  onChange={(e) => setFormData({ ...formData, currencyFrom: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('currency_to_label') || 'Currency To'} *
                </label>
                <select
                  value={formData.currencyTo}
                  onChange={(e) => setFormData({ ...formData, currencyTo: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                  className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-blue-400 disabled:to-indigo-400 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
              >
                {submitting
                  ? t('sending') || 'Sending...'
                  : t('send_transaction_button') || 'Send Transaction'}
              </button>
            </div>
          </form>
        </div>

        {/* Transaction History */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('transaction_history_title') || 'Transaction History'}
            </h2>
            <button
              onClick={fetchTransactions}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
            >
              {t('refresh') || 'Refresh'}
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              {t('loading') || 'Loading...'}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              {t('no_transactions') || 'No transactions yet'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      {t('sender_label') || 'Sender'}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      {t('receiver_label') || 'Receiver'}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      {t('from') || 'From'} → {t('to') || 'To'}
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      {t('amount_sent_label') || 'Amount Sent'}
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      {t('amount_received_label') || 'Amount Received'}
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      {t('conversion_rate_label') || 'Rate'}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      {t('date_label') || 'Date'}
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction._id}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                        {transaction.senderFullName}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-900 dark:text-white">
                        {transaction.receiverFullName}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
                            {transaction.currencyFrom}
                          </span>
                          <svg
                            className="w-4 h-4 text-gray-400"
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
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                            {transaction.currencyTo}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                        {transaction.amountSent.toLocaleString()}{' '}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {getCurrencySymbol(transaction.currencyFrom)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-sm font-semibold text-green-600 dark:text-green-400">
                        {transaction.amountReceived.toLocaleString()}{' '}
                        <span className="text-xs">
                          {getCurrencySymbol(transaction.currencyTo)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {editingId === transaction._id ? (
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="number"
                              step="0.00001"
                              value={editRate}
                              onChange={(e) => setEditRate(e.target.value)}
                              className="w-24 px-2 py-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-center text-gray-900 dark:text-white"
                            />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-mono">
                              {transaction.conversionRate.toFixed(5)}
                            </span>
                            {transaction.isEdited && (
                              <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded text-xs font-medium">
                                Edited
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          {editingId === transaction._id ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(transaction._id)}
                                disabled={updating}
                                className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50"
                                title="Save"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                disabled={updating}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                title="Cancel"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </>
                          ) : (transaction.senderFullName === admin?.fullName || transaction.receiverFullName === admin?.fullName) ? (
                            <button
                              onClick={() => handleEditClick(transaction)}
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Edit Rate"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 dark:text-gray-600">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
