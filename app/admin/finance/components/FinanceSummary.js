'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '../../../components/LanguageProvider';

export default function FinanceSummary({ refreshTrigger }) {
  const { t } = useLanguage();
  const [summary, setSummary] = useState({
    totalB2B: 0,
    totalB2CAlgeria: 0,
    totalB2CKorea: 0,
    totalExtraExpenses: 0,
    totalProfit: 0,
    totalEntries: 0,
  });

  useEffect(() => {
    fetchSummary();
  }, [refreshTrigger]);

  const fetchSummary = async () => {
    try {
      const [b2bRes, algeriaRes, koreaRes, expensesRes] = await Promise.all([
        fetch('/api/finance?type=B2B'),
        fetch('/api/finance?type=B2C_Algeria'),
        fetch('/api/finance?type=B2C_Korea'),
        fetch('/api/finance?type=EXTRA_EXPENSES'),
      ]);

      const b2bData = b2bRes.ok ? await b2bRes.json() : [];
      const algeriaData = algeriaRes.ok ? await algeriaRes.json() : [];
      const koreaData = koreaRes.ok ? await koreaRes.json() : [];
      const expensesData = expensesRes.ok ? await expensesRes.json() : [];

      const totalB2B = b2bData.reduce((sum, entry) => sum + entry.netProfit, 0);
      const totalB2CAlgeria = algeriaData.reduce((sum, entry) => sum + entry.netProfit, 0);
      const totalB2CKorea = koreaData.reduce((sum, entry) => sum + entry.netProfit, 0);
      const totalExtraExpenses = expensesData.reduce((sum, entry) => sum + (entry.fields.amount || 0), 0);

      setSummary({
        totalB2B,
        totalB2CAlgeria,
        totalB2CKorea,
        totalExtraExpenses,
        totalProfit: totalB2B + totalB2CAlgeria + totalB2CKorea,
        totalEntries: b2bData.length + algeriaData.length + koreaData.length + expensesData.length,
      });
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const profitCards = [
    {
      title: t('b2b_profit') || 'B2B Profit',
      value: summary.totalB2B,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: t('b2c_algeria_profit') || 'B2C Algeria Profit',
      value: summary.totalB2CAlgeria,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
    },
    {
      title: t('b2c_korea_profit') || 'B2C Korea Profit',
      value: summary.totalB2CKorea,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: t('total_profit') || 'Total Net Profit',
      value: summary.totalProfit,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400',
      highlight: true,
    },
  ];

  return (
    <div className="space-y-6 mb-8">
      {/* Profit Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {profitCards.map((card, index) => (
          <div
            key={index}
            className={`${card.bgColor} rounded-xl p-6 border-2 ${
              card.highlight
                ? 'border-orange-200 dark:border-orange-800 shadow-lg'
                : 'border-transparent'
            } transition-all hover:shadow-xl hover:scale-105 duration-300`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-lg`}>
                {card.icon}
              </div>
              {card.highlight && (
                <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-full">
                  {t('total') || 'TOTAL'}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{card.title}</p>
              <p
                className={`text-2xl font-bold ${
                  card.value >= 0
                    ? card.textColor
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {card.value.toLocaleString()}DA
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Extra Expenses Row */}
      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border-2 border-transparent transition-all hover:shadow-xl hover:scale-[1.02] duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-lg">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {t('total_extra_expenses') || 'Total Extra Expenses'}
              </p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {summary.totalExtraExpenses.toLocaleString()}DA
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
