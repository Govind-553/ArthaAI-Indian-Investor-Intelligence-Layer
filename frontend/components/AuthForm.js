'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function AuthForm({ mode }) {
  const router = useRouter();
  const { login, register, isAuthenticated, loading } = useAuth();
  const isRegister = mode === 'register';
  const [values, setValues] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, loading, router]);

  function setField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
    setServerError('');
  }

  function validate() {
    const nextErrors = {};

    if (isRegister && values.name.trim().length < 2) {
      nextErrors.name = 'Name must be at least 2 characters.';
    }

    if (!validateEmail(values.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (values.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    setServerError('');

    try {
      if (isRegister) {
        await register({
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password,
        });
      } else {
        await login({
          email: values.email.trim().toLowerCase(),
          password: values.password,
        });
      }

      router.replace('/');
    } catch (error) {
      setServerError(error?.message || 'Unable to complete authentication right now.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl items-center px-4 py-10 md:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/6 shadow-[0_24px_90px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
          <div className="bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.22),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.12),transparent_32%)] px-6 py-8 md:px-10 md:py-12">
            <p className="text-[11px] uppercase tracking-[0.4em] text-emerald-200/80">ArthaAI Access</p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
              {isRegister ? 'Create your investor command center.' : 'Sign in to your investor dashboard.'}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              {isRegister
                ? 'Create an account to unlock your live portfolio, alerts, market signals, and AI-assisted decision support.'
                : 'Access your live portfolio, signal feed, alerts, and AI market assistant from one secure workspace.'}
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <article className="rounded-[1.4rem] border border-white/10 bg-slate-950/30 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Portfolio</p>
                <p className="mt-3 text-sm leading-6 text-slate-200">Track live holdings, invested capital, and performance without switching tools.</p>
              </article>
              <article className="rounded-[1.4rem] border border-white/10 bg-slate-950/30 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Signals</p>
                <p className="mt-3 text-sm leading-6 text-slate-200">Surface action-ready market signals with confidence and context.</p>
              </article>
              <article className="rounded-[1.4rem] border border-white/10 bg-slate-950/30 p-4">
                <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">AI Assist</p>
                <p className="mt-3 text-sm leading-6 text-slate-200">Ask portfolio-aware questions and get grounded market guidance fast.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="rounded-[2.2rem] border border-white/10 bg-slate-950/55 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl md:p-8">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">{isRegister ? 'Register' : 'Login'}</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">{isRegister ? 'Open your account' : 'Welcome back'}</h2>
            </div>
            <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
              Secure JWT session
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {isRegister ? (
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-200">Full name</label>
                <input
                  id="name"
                  type="text"
                  value={values.name}
                  onChange={(event) => setField('name', event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/60 focus:bg-white/8"
                  placeholder="Riya Sharma"
                />
                {errors.name ? <p className="mt-2 text-sm text-rose-300">{errors.name}</p> : null}
              </div>
            ) : null}

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">Email</label>
              <input
                id="email"
                type="email"
                value={values.email}
                onChange={(event) => setField('email', event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/60 focus:bg-white/8"
                placeholder="investor@example.com"
              />
              {errors.email ? <p className="mt-2 text-sm text-rose-300">{errors.email}</p> : null}
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">Password</label>
              <input
                id="password"
                type="password"
                value={values.password}
                onChange={(event) => setField('password', event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-300/60 focus:bg-white/8"
                placeholder="At least 8 characters"
              />
              {errors.password ? <p className="mt-2 text-sm text-rose-300">{errors.password}</p> : null}
            </div>

            {serverError ? (
              <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
                {serverError}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-300">
            {isRegister ? 'Already have an account?' : 'New to ArthaAI?'}{' '}
            <Link href={isRegister ? '/login' : '/register'} className="font-semibold text-emerald-300 hover:text-emerald-200">
              {isRegister ? 'Sign in instead' : 'Create an account'}
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}

