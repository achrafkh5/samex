"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect } from "react";

export default function ThemeProvider({ children }) {
  useEffect(() => {
    // Force remove dark class on mount if theme is light
    const theme = localStorage.getItem('dreamcars-theme');
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      enableColorScheme={false}
      storageKey="dreamcars-theme"
      themes={['light', 'dark']}
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
