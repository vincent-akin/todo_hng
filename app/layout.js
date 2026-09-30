import './globals.css';

export const metadata = { title: 'AI Todo', description: 'Smarter tasks. Greater focus.' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 text-slate-800 antialiased dark:from-[#070d1f] dark:via-[#0a1230] dark:to-[#0b1433] dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
