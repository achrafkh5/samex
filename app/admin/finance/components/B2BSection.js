'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../../../components/LanguageProvider';

export default function B2BSection({ onDataChange }) {
  const { t } = useLanguage();
  const [entries, setEntries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('all');
  
  const [formData, setFormData] = useState({
    buyingCosts: '',
    papersFees: '',
    transportFees: '',
    otherFees: '',
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await fetch('/api/finance?type=B2B');
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const calculateFinancials = (data) => {
    const buyingCosts = parseFloat(data.buyingCosts) || 0;
    const papersFees = parseFloat(data.papersFees) || 0;
    const transportFees = parseFloat(data.transportFees) || 0;
    const otherFees = parseFloat(data.otherFees) || 0;
    
    const paidToBusiness = buyingCosts * 0.044; // 4.4% paid to business
    const alcocaRevenue = buyingCosts * 0.044; // 4.4% revenue from government
    const totalCost = buyingCosts + papersFees + transportFees + otherFees - paidToBusiness;
    const netProfit = alcocaRevenue - (papersFees + transportFees + otherFees);
    
    return {
      paidToBusiness,
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
      type: 'B2B',
      fields: {
        buyingCosts: parseFloat(formData.buyingCosts),
        papersFees: parseFloat(formData.papersFees),
        transportFees: parseFloat(formData.transportFees),
        otherFees: parseFloat(formData.otherFees),
        paidToBusiness: financials.paidToBusiness,
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
      buyingCosts: entry.fields.buyingCosts.toString(),
      papersFees: entry.fields.papersFees.toString(),
      transportFees: entry.fields.transportFees.toString(),
      otherFees: (entry.fields.otherFees || 0).toString(),
    });
    setEditingId(entry._id);
    setShowForm(true);
  };

  const openDeleteConfirm = (entry) => {
    setEntryToDelete(entry);
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setEntryToDelete(null);
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    
    try {
      const response = await fetch(`/api/finance?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchEntries();
        onDataChange();
        closeDeleteConfirm();
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
    } finally {
      setDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      buyingCosts: '',
      papersFees: '',
      transportFees: '',
      otherFees: '',
    });
    setShowForm(false);
    setEditingId(null);
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

  // Filter entries by date
  const filteredEntries = entries?.filter(entry => filterByDate(entry?.createdAt)) || [];

  const totalNetProfit = filteredEntries.reduce((sum, entry) => sum + entry.netProfit, 0);

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400 text-lg">{t('loading') || 'Loading B2B data...'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('b2b_title') || 'B2B - Buying for Business'}
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

      {/* Date Filter Buttons */}
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
            type="button"
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
                  {t('buying_costs') || 'Buying Costs'} (₩)
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
                  {t('other_fees') || 'Other Fees'} (DA)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.otherFees}
                  onChange={(e) => setFormData({ ...formData, otherFees: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
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
                  {t('buying_costs') || 'Buying Costs'}
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('papers_fees') || 'Papers Fees'}
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('transport_fees') || 'Transport Fees'}
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('other_fees') || 'Other Fees'}
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('paid_to_business') || 'Paid to Business (4.4%)'}
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('alkoca_revenue') || 'Alkoca Revenue (4.4%)'}
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
              {filteredEntries.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-gray-500 dark:text-gray-400">
                    {t('no_entries') || 'No entries yet. Add your first car transaction.'}
                  </td>
                </tr>
              ) : (
                filteredEntries.map((entry) => (
                  <tr key={entry._id} className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-4 px-6 text-gray-900 dark:text-white">
                      {entry.fields.buyingCosts.toLocaleString()}DA
                    </td>
                    <td className="py-4 px-6 text-gray-900 dark:text-white">
                      {entry.fields.papersFees.toLocaleString()}DA
                    </td>
                    <td className="py-4 px-6 text-gray-900 dark:text-white">
                      {entry.fields.transportFees.toLocaleString()}DA
                    </td>
                    <td className="py-4 px-6 text-gray-900 dark:text-white">
                      {(entry.fields.otherFees || 0).toLocaleString()}DA
                    </td>
                    <td className="py-4 px-6 text-gray-900 dark:text-white">
                      {entry.fields.paidToBusiness.toLocaleString()}DA
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
                          onClick={() => openDeleteConfirm(entry)}
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
                  <td colSpan="6" className="py-4 px-6 text-right font-bold text-gray-900 dark:text-white">
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

      {/* Delete Confirmation Popup */}
      {deleteConfirmOpen && entryToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
              {t('confirm_delete') || 'Delete Entry?'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
              {t('delete_warning') || 'This action cannot be undone. The entry will be permanently removed.'}
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('buying_costs') || 'Buying Costs'}:</span>
                <span className="font-medium text-gray-900 dark:text-white">{entryToDelete.fields.buyingCosts.toLocaleString()}DA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('papers_fees') || 'Papers Fees'}:</span>
                <span className="font-medium text-gray-900 dark:text-white">{entryToDelete.fields.papersFees.toLocaleString()}DA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('transport_fees') || 'Transport Fees'}:</span>
                <span className="font-medium text-gray-900 dark:text-white">{entryToDelete.fields.transportFees.toLocaleString()}DA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('other_fees') || 'Other Fees'}:</span>
                <span className="font-medium text-gray-900 dark:text-white">{(entryToDelete.fields.otherFees || 0).toLocaleString()}DA</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                <span className="text-gray-600 dark:text-gray-400">{t('net_profit') || 'Net Profit'}:</span>
                <span className={`font-semibold ${entryToDelete.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {entryToDelete.netProfit.toLocaleString()}DA
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeDeleteConfirm}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={() => handleDelete(entryToDelete._id)}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
