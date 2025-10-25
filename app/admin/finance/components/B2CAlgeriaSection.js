'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../../../components/LanguageProvider';

export default function B2CAlgeriaSection({ onDataChange }) {
  const { t } = useLanguage();
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    auctionFees: '',
    transportFees: '',
    buyingCosts: '',
    transactionFees: '',
    papersFees: '',
    sellingPrice: '',
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/finance?type=B2C_Algeria');
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const calculateFinancials = (data) => {
    const auctionFees = parseFloat(data.auctionFees) || 0;
    const transportFees = parseFloat(data.transportFees) || 0;
    const buyingCosts = parseFloat(data.buyingCosts) || 0;
    const transactionFees = parseFloat(data.transactionFees) || 0;
    const papersFees = parseFloat(data.papersFees) || 0;
    const sellingPrice = parseFloat(data.sellingPrice) || 0;
    
    const alcocaRevenue = buyingCosts * 0.088; // 8.8% revenue from government
    const totalCost = auctionFees + transportFees + buyingCosts + transactionFees + papersFees;
    const netProfit = sellingPrice - totalCost + alcocaRevenue;
    
    return {
      alcocaRevenue,
      totalCost,
      netProfit,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const financials = calculateFinancials(formData);
    
    const payload = {
      type: 'B2C_Algeria',
      fields: {
        auctionFees: parseFloat(formData.auctionFees),
        transportFees: parseFloat(formData.transportFees),
        buyingCosts: parseFloat(formData.buyingCosts),
        transactionFees: parseFloat(formData.transactionFees),
        papersFees: parseFloat(formData.papersFees),
        sellingPrice: parseFloat(formData.sellingPrice),
        alcocaRevenue: financials.alcocaRevenue,
      },
      totalCost: financials.totalCost,
      netProfit: financials.netProfit,
    };

    try {
      if (editingId) {
        const response = await fetch(`/api/finance?id=${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          await fetchEntries();
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
          await fetchEntries();
          resetForm();
          onDataChange();
        }
      }
    } catch (error) {
      console.error('Error saving entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entry) => {
    setFormData({
      auctionFees: entry.fields.auctionFees.toString(),
      transportFees: entry.fields.transportFees.toString(),
      buyingCosts: entry.fields.buyingCosts.toString(),
      transactionFees: entry.fields.transactionFees.toString(),
      papersFees: entry.fields.papersFees.toString(),
      sellingPrice: entry.fields.sellingPrice.toString(),
    });
    setEditingId(entry._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm(t('confirm_delete') || 'Are you sure you want to delete this entry?')) return;
    
    try {
      const response = await fetch(`/api/finance?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchEntries();
        onDataChange();
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      auctionFees: '',
      transportFees: '',
      buyingCosts: '',
      transactionFees: '',
      papersFees: '',
      sellingPrice: '',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const totalNetProfit = entries.reduce((sum, entry) => sum + entry.netProfit, 0);

  return (
    <div className="space-y-6">
      {/* Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('b2c_algeria_title') || 'B2C Algeria - Selling to Algerian Client'}
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('add_car_button') || 'Add Car'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {editingId ? (t('edit_entry') || 'Edit Entry') : (t('add_new_entry') || 'Add New Entry')}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('auction_fees') || 'Auction Fees'} (DA)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.auctionFees}
                  onChange={(e) => setFormData({ ...formData, auctionFees: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('transport_fees') || 'Transportation Fees'} (DA)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.transportFees}
                  onChange={(e) => setFormData({ ...formData, transportFees: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('buying_costs') || 'Buying Costs'} (DA)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.buyingCosts}
                  onChange={(e) => setFormData({ ...formData, buyingCosts: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('transaction_fees') || 'Transaction Fees (Exchange)'} (DA)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.transactionFees}
                  onChange={(e) => setFormData({ ...formData, transactionFees: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('papers_fees') || 'Papers Fees'} (DA)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.papersFees}
                  onChange={(e) => setFormData({ ...formData, papersFees: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('selling_price') || 'Selling Price'} (DA)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
              >
                {loading ? (t('saving') || 'Saving...') : (editingId ? (t('update') || 'Update') : (t('save') || 'Save'))}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
              >
                {t('cancel') || 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Entries Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('auction_fees') || 'Auction Fees'}
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('transport_fees') || 'Transport'}
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('buying_costs') || 'Buying Costs'}
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('transaction_fees') || 'Transaction'}
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('papers_fees') || 'Papers'}
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('selling_price') || 'Selling Price'}
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('alkoca_revenue') || 'Revenue (8.8%)'}
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('net_profit') || 'Net Profit'}
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('actions') || 'Actions'}
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-8 text-center text-gray-500 dark:text-gray-400">
                    {t('no_entries') || 'No entries yet. Add your first car transaction.'}
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry._id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-4 px-6 text-gray-900 dark:text-white">
                      {entry.fields.auctionFees.toLocaleString()}DA
                    </td>
                    <td className="py-4 px-6 text-gray-900 dark:text-white">
                      {entry.fields.transportFees.toLocaleString()}DA
                    </td>
                    <td className="py-4 px-6 text-gray-900 dark:text-white">
                      {entry.fields.buyingCosts.toLocaleString()}DA
                    </td>
                    <td className="py-4 px-6 text-gray-900 dark:text-white">
                      {entry.fields.transactionFees.toLocaleString()}DA
                    </td>
                    <td className="py-4 px-6 text-gray-900 dark:text-white">
                      {entry.fields.papersFees.toLocaleString()}DA
                    </td>
                    <td className="py-4 px-6 text-blue-600 dark:text-blue-400 font-semibold">
                      {entry.fields.sellingPrice.toLocaleString()}DA
                    </td>
                    <td className="py-4 px-6 text-green-600 dark:text-green-400 font-semibold">
                      {entry.fields.alcocaRevenue.toLocaleString()}DA
                    </td>
                    <td className={`py-4 px-6 font-semibold ${entry.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {entry.netProfit.toLocaleString()}DA
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                        >
                          {t('edit') || 'Edit'}
                        </button>
                        <button
                          onClick={() => handleDelete(entry._id)}
                          className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                          {t('delete') || 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {entries.length > 0 && (
              <tfoot className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <td colSpan="7" className="py-4 px-6 text-right font-bold text-gray-900 dark:text-white">
                    {t('total_net_profit') || 'Total Net Profit:'}
                  </td>
                  <td className={`py-4 px-6 font-bold text-lg ${totalNetProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {totalNetProfit.toLocaleString()}DA
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
