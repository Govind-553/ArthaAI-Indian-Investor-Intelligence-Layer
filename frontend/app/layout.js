import './globals.css';
import { Sora } from 'next/font/google';
import { AppShell } from '../components/AppShell';
import { AuthProvider } from '../components/AuthProvider';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
});

export const metadata = {
  title: 'ArthaAI Indian Investor Intelligence',
  description: 'Frontend workspace for dashboard, portfolio, alerts, and AI chat.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={sora.variable}>
      <body>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}

