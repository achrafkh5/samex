'use client';

import { useLanguage } from './LanguageProvider';

export default function ProgressStepper({ currentStatus }) {
  const { t } = useLanguage();

  const steps = [
    { id: 1, status: 'pending', label: t('pending'), icon: '📋' },
    { id: 2, status: 'processing', label: t('processing'), icon: '⚙️' },
    { id: 3, status: 'inTransit', label: t('inTransit'), icon: '🚚' },
    { id: 4, status: 'delivered', label: t('delivered'), icon: '✅' }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.status === currentStatus);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="w-full py-8">
      {/* Desktop View */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <div key={step.id} className="flex-1 flex items-center">
              {/* Step Circle */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-green-500 text-white shadow-lg shadow-green-500/50'
                      : isCurrent
                      ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-110'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {isCompleted ? '✓' : step.icon}
                </div>
                <p
                  className={`mt-3 text-sm font-semibold text-center ${
                    isCompleted || isCurrent
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-2 rounded transition-all duration-300 ${
                    index < currentStepIndex
                      ? 'bg-green-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  style={{ marginTop: '-2rem' }}
                ></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          return (
            <div key={step.id} className="flex items-center space-x-4">
              {/* Step Circle */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 flex-shrink-0 ${
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : isCurrent
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}
              >
                {isCompleted ? '✓' : step.icon}
              </div>

              {/* Step Info */}
              <div className="flex-1">
                <p
                  className={`font-semibold ${
                    isCompleted || isCurrent
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {t('currentLocation')}
                  </p>
                )}
              </div>

              {/* Status Badge */}
              {isCompleted && (
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                  ✓ {t('delivered')}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
