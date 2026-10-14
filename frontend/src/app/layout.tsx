import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { AuthProvider } from '@/lib/auth-context';
import { ThemeProvider } from '@/lib/theme-context';

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
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 antialiased selection:bg-blue-100 selection:text-blue-900 transition-colors duration-150">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
