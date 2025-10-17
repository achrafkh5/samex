'use client';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeDebug() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // ✅ avoids stale theme mismatch

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border-2 border-red-500 z-[9999]">
      <h3 className="font-bold text-gray-900 dark:text-white mb-2">Theme Debug</h3>
      <div className="text-sm space-y-1">
        <p className="text-gray-900 dark:text-white">Current theme: {theme}</p>
        <p className="text-gray-900 dark:text-white">Resolved: {resolvedTheme}</p>
        <p className="text-gray-900 dark:text-white">System: {systemTheme}</p>
        <p className="text-gray-900 dark:text-white">
          HTML class: {typeof document !== 'undefined' ? document.documentElement.className : 'N/A'}
        </p>

        <div className="flex gap-2 mt-2">
          <button
            onClick={() => setTheme('light')}
            className="px-2 py-1 bg-yellow-200 text-gray-900 rounded text-xs"
          >
            Light
          </button>
          <button
            onClick={() => setTheme('dark')}
            className="px-2 py-1 bg-gray-900 text-white rounded text-xs"
          >
            Dark
          </button>
          <button
            onClick={() => setTheme('system')}
            className="px-2 py-1 bg-blue-200 text-gray-900 rounded text-xs"
          >
            System
          </button>
        </div>
      </div>
    </div>
  );
}
