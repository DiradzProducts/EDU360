import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EDU360 | K–12 Outcomes & Intelligence Platform',
  description: 'Next-generation Action & Intelligence platform for school leadership, teachers, parents, and students.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`h-full ${inter.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-[#0F172A] dark:bg-[#0B0F19] dark:text-[#F8FAFC] font-sans antialiased selection:bg-blue-600/20 selection:text-blue-700 dark:selection:bg-blue-500/30 dark:selection:text-blue-200 transition-colors duration-150">
        <ThemeProvider>
          <AuthProvider>
            <Suspense fallback={<div className="h-16 w-full bg-white border-b border-slate-200 dark:bg-[#0B0F19] dark:border-slate-800" />}>
              <Navbar />
            </Suspense>
            <main className="flex-1">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
