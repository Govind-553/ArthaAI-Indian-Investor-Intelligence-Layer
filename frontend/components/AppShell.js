'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { LoadingState } from './ResourceStates';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/signals', label: 'Signals' },
  { href: '/portfolio', label: 'Portfolio' },
  { href: '/alerts', label: 'Alerts' },
  { href: '/ai-chat', label: 'AI Chat' },
];

const publicRoutes = new Set(['/login', '/register']);

export function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, isAuthenticated, logout } = useAuth();
  const isPublicRoute = publicRoutes.has(pathname);

  useEffect(() => {
    if (!loading && !isAuthenticated && !isPublicRoute) {
      router.replace('/login');
    }
  }, [isAuthenticated, isPublicRoute, loading, router]);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-screen max-w-3xl items-center px-6">
        <LoadingState title="Restoring your workspace..." subtitle="Checking your session and preparing your investor dashboard." />
      </div>
    );
  }

  if (isPublicRoute) {
    return <div className="min-h-screen">{children}</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-8 md:py-8">
        <header className="mb-7 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl">
          <div className="bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(250,204,21,0.1),transparent_28%)] px-5 py-5 md:px-7 md:py-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.38em] text-emerald-300/80">ArthaAI Fintech OS</p>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white md:text-4xl">Retail investor platform for daily market decisions</h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">Signal-first intelligence for Indian markets, designed to reduce cognitive load and keep action, risk, and context visible at a glance.</p>
              </div>
              <div className="flex flex-col items-end gap-3 rounded-[1.4rem] border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-right">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.26em] text-emerald-200/70">Signed In</p>
                  <p className="mt-2 text-lg font-semibold text-white">{user?.name || user?.email}</p>
                  <p className="mt-1 text-sm text-emerald-100/80">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    router.replace('/login');
                  }}
                  className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
          <nav className="flex flex-wrap gap-2 border-t border-white/10 px-4 py-4 md:px-6">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${active ? 'bg-white text-slate-950 shadow-[0_8px_30px_rgba(255,255,255,0.18)]' : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        {children}
      </div>
    </div>
  );
}

