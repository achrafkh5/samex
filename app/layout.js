import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./components/LanguageProvider";
import ThemeProvider from "./providers/ThemeProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "DreamCars - Find Your Perfect Vehicle",
  description: "Browse our premium collection of cars and find your dream vehicle today",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('dreamcars-theme');
                  const root = document.documentElement;
                  
                  // Remove both classes first
                  root.classList.remove('light', 'dark');
                  
                  // Apply stored theme or default to light
                  if (theme === 'dark') {
                    root.classList.add('dark');
                  } else {
                    root.classList.add('light');
                    // Force light even if system is dark
                    if (!theme) {
                      localStorage.setItem('dreamcars-theme', 'light');
                    }
                  }
                } catch (e) {
                  // Fallback to light mode
                  document.documentElement.classList.add('light');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
