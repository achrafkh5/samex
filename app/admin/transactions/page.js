'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '../../components/AdminSidebar';
import { useLanguage } from '../../components/LanguageProvider';

// Mock admins list (replace with real data later)
const MOCK_ADMINS = [
  { id: 1, fullName: 'Admin User 1' },
  { id: 2, fullName: 'Admin User 2' },
  { id: 3, fullName: 'Admin User 3' },
  { id: 4, fullName: 'Admin User 4' },
];

// Mock current admin (replace with real auth later)
const getCurrentAdmin = () => {
  return { fullName: 'Current Admin' };
};

// Currency options
const CURRENCIES = ['DZD', 'USDT', 'KRW'];

export default function TransactionsPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    receiver: '',
    currencyFrom: '',
    currencyTo: '',
    amount: '',
  });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentAdmin] = useState(getCurrentAdmin());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication
  useEffect(() => {
    const auth = localStorage.getItem('adminAuthenticated') === 'true';
    setIsAuthenticated(auth);
    
    if (!auth) {
      router.push('/admin/login');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  // Fetch transactions on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactions();
    }
  }, [isAuthenticated]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.receiver || !formData.currencyFrom || !formData.currencyTo || !formData.amount) {
      alert('Please fill all fields');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      alert('Amount must be greater than 0');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderFullName: currentAdmin.fullName,
          receiverFullName: formData.receiver,
          currencyFrom: formData.currencyFrom,
          currencyTo: formData.currencyTo,
          amountSent: parseFloat(formData.amount),
        }),
      });

      if (response.ok) {
        alert(t('transaction_sent') || 'Transaction sent successfully!');
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
        alert(error.error || t('transaction_error'));
      }
    } catch (error) {
      console.error('Error sending transaction:', error);
      alert(t('transaction_error') || 'Failed to send transaction');
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

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If not authenticated, return null (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
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
                  value={currentAdmin.fullName}
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
                  {MOCK_ADMINS.map((admin) => (
                    <option key={admin.id} value={admin.fullName}>
                      {admin.fullName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Currency From */}
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
                      <td className="py-4 px-4 text-center">
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-mono">
                          {transaction.conversionRate.toFixed(5)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(transaction.createdAt)}
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
