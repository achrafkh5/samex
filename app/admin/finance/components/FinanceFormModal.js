'use client';

import { useState } from 'react';
import { useLanguage } from '../../../components/LanguageProvider';

export default function FinanceFormModal({ order, onClose, onSave }) {
  const { t } = useLanguage();
  const [selectedType, setSelectedType] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // B2B fields
    buyingCosts: '',
    papersFees: '',
    transportFees: '',
    // B2C Algeria fields
    auctionFees: '',
    transactionFees: '',
    // B2C Korea fields (shares some with Algeria)
  });

  const sellingPrice = order.paymentAmount || 0;

  const calculateFinancials = () => {
    const buyingCosts = parseFloat(formData.buyingCosts) || 0;
    const papersFees = parseFloat(formData.papersFees) || 0;
    const transportFees = parseFloat(formData.transportFees) || 0;
    const auctionFees = parseFloat(formData.auctionFees) || 0;
    const transactionFees = parseFloat(formData.transactionFees) || 0;

    let alcocaRevenue = 0;
    let totalCost = 0;
    let netProfit = 0;
    let paidToBusiness = 0;
    let fields = {};

    if (selectedType === 'B2B') {
      paidToBusiness = buyingCosts * 0.044; // 4.4%
      alcocaRevenue = buyingCosts * 0.044; // 4.4%
      totalCost = buyingCosts + papersFees + transportFees - paidToBusiness;
      netProfit = sellingPrice - totalCost + alcocaRevenue;
      
      fields = {
        buyingCosts,
        papersFees,
        transportFees,
        paidToBusiness,
        alcocaRevenue,
        sellingPrice,
      };
    } else if (selectedType === 'B2C_Algeria') {
      alcocaRevenue = buyingCosts * 0.088; // 8.8%
      totalCost = auctionFees + transportFees + buyingCosts + transactionFees + papersFees;
      netProfit = sellingPrice - totalCost + alcocaRevenue;
      
      fields = {
        auctionFees,
        transportFees,
        buyingCosts,
        transactionFees,
        papersFees,
        sellingPrice,
        alcocaRevenue,
      };
    } else if (selectedType === 'B2C_Korea') {
      alcocaRevenue = buyingCosts * 0.088; // 8.8%
      totalCost = auctionFees + transportFees + buyingCosts + papersFees;
      netProfit = sellingPrice - totalCost + alcocaRevenue;
      
      fields = {
        auctionFees,
        transportFees,
        buyingCosts,
        papersFees,
        sellingPrice,
        alcocaRevenue,
      };
    }

    return { fields, totalCost, netProfit };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedType) {
      alert(t('select_sale_type') || 'Please select a sale type');
      return;
    }

    setLoading(true);
    const { fields, totalCost, netProfit } = calculateFinancials();

    const payload = {
      type: selectedType,
      fields,
      totalCost,
      netProfit,
      linkedOrderId: order._id,
    };

    try {
      const response = await fetch('/api/finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSave();
      } else {
        alert(t('save_error') || 'Failed to save finance data');
      }
    } catch (error) {
      console.error('Error saving finance:', error);
      alert(t('save_error') || 'Failed to save finance data');
    } finally {
      setLoading(false);
    }
  };

  const renderFormFields = () => {
    if (!selectedType) return null;

    return (
      <div className="space-y-4">
        {/* Common Fields */}
        {(selectedType === 'B2B' || selectedType === 'B2C_Algeria' || selectedType === 'B2C_Korea') && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('buying_costs') || 'Buying Costs'} (DA) *
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
                {t('papers_fees') || 'Papers Fees'} (DA) *
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
                {t('transport_fees') || 'Transportation Fees'} (DA) *
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
          </>
        )}

        {/* B2C Specific Fields */}
        {(selectedType === 'B2C_Algeria' || selectedType === 'B2C_Korea') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('auction_fees') || 'Auction Fees'} (DA) *
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
        )}

        {/* Algeria Specific Field */}
        {selectedType === 'B2C_Algeria' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('transaction_fees') || 'Transaction Fees (Exchange)'} (DA) *
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
        )}

        {/* Selling Price Display (Read-only from order) */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
            {t('selling_price') || 'Selling Price'} ({t('from_order') || 'from order'})
          </label>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {sellingPrice.toLocaleString()}DA
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('add_finance') || 'Add Finance'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {order.carName || order.car?.name} - {order.clientName || order.client?.fullName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Sale Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('select_sale_type') || 'Select Sale Type'} *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedType('B2B')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedType === 'B2B'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="font-semibold text-gray-900 dark:text-white">
                  {t('b2b_title') || 'B2B'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('b2b_subtitle') || 'Buying for business'}
                </div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('B2C_Algeria')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedType === 'B2C_Algeria'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="font-semibold text-gray-900 dark:text-white">
                  {t('b2c_algeria_title') || 'B2C Algeria'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('b2c_algeria_subtitle') || 'Algerian client'}
                </div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('B2C_Korea')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedType === 'B2C_Korea'
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="font-semibold text-gray-900 dark:text-white">
                  {t('b2c_korea_title') || 'B2C Korea'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {t('b2c_korea_subtitle') || 'Korean business'}
                </div>
              </button>
            </div>
          </div>

          {/* Dynamic Form Fields */}
          {renderFormFields()}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={loading || !selectedType}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? (t('saving') || 'Saving...') : (t('save') || 'Save')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
            >
              {t('cancel') || 'Cancel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
