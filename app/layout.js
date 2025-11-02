import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "./components/LanguageProvider";
import ThemeProvider from "./providers/ThemeProvider";
import { AuthProvider } from "./context/AuthContext";
import { AdminAuthProvider } from "./context/AdminAuthContext";
import { SpeedInsights } from "@vercel/speed-insights/next"
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  title: "ALKO Cars - Find Your Perfect Vehicle",
  description: "Browse our premium collection of cars and find your dream vehicle today",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <SpeedInsights/>
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <AdminAuthProvider>
                {children}
              </AdminAuthProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
