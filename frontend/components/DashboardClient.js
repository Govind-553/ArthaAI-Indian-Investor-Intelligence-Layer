'use client';

import { getAlerts, getPortfolio, getSignals, summarizePortfolio } from '../lib/api';
import { EmptyState, ErrorState, LoadingState } from './ResourceStates';
import { SectionHeader } from './SectionHeader';
import { useRealtimeResource } from './useRealtimeResource';

function scoreTone(value) {
  if (value >= 80) return 'border-emerald-400/20 bg-emerald-400/12 text-emerald-300';
  if (value >= 65) return 'border-amber-400/20 bg-amber-400/12 text-amber-300';
  return 'border-rose-400/20 bg-rose-400/12 text-rose-300';
}

function actionButton(label, tone = 'default') {
  const tones = {
    default: 'bg-white text-slate-950 hover:bg-slate-200',
    buy: 'bg-emerald-400 text-slate-950 hover:bg-emerald-300',
    sell: 'bg-rose-400 text-slate-950 hover:bg-rose-300',
    analyze: 'bg-amber-300 text-slate-950 hover:bg-amber-200',
  };

  return `rounded-full px-4 py-2 text-xs font-semibold transition ${tones[tone]}`;
}

export function DashboardClient() {
  const portfolioResource = useRealtimeResource(getPortfolio, [], 20000);
  const signalsResource = useRealtimeResource(getSignals, [], 20000);
  const alertsResource = useRealtimeResource(getAlerts, [], 20000);

  const summary = summarizePortfolio(portfolioResource.data);
  const topSignals = signalsResource.data.slice(0, 5);
  const recentAlerts = alertsResource.data.slice(0, 5);
  const topHoldings = [...portfolioResource.data].sort((left, right) => right.pnl - left.pnl).slice(0, 3);
  const firstError = portfolioResource.error || signalsResource.error || alertsResource.error;
  const lastUpdated = [portfolioResource.lastUpdated, signalsResource.lastUpdated, alertsResource.lastUpdated].filter(Boolean).sort().pop() || null;

  if (portfolioResource.loading && signalsResource.loading && alertsResource.loading) {
    return <LoadingState title="Loading your dashboard..." subtitle="Fetching your live portfolio, signals, and alerts." />;
  }

  if (firstError) {
    return <ErrorState title="Dashboard unavailable" message={firstError} onRetry={() => { portfolioResource.reload(); signalsResource.reload(); alertsResource.reload(); }} />;
  }

  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Dashboard"
        title="Action-first investor dashboard"
        subtitle="A live view of portfolio value, signal flow, and alert activity so you can make decisions without relying on placeholder data."
        lastUpdated={lastUpdated}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[1.7rem] border border-white/10 bg-white/6 p-6 backdrop-blur-2xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Portfolio Value</p>
          <h3 className="mt-4 text-4xl font-semibold text-white">{summary.currentValue}</h3>
          <p className="mt-3 text-sm text-slate-300">Invested capital: {summary.investedValue}. This total is computed from your real portfolio API response.</p>
          <div className="mt-5 flex items-center justify-between rounded-[1.2rem] bg-slate-950/35 px-4 py-3">
            <span className="text-sm text-slate-300">Open holdings</span>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/12 px-3 py-1 text-xs font-semibold text-emerald-300">{portfolioResource.data.length}</span>
          </div>
          <button className={`mt-5 ${actionButton('Review holdings', 'analyze')}`}>Review holdings</button>
        </article>

        <article className="rounded-[1.7rem] border border-white/10 bg-white/6 p-6 backdrop-blur-2xl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Total P&amp;L</p>
          <h3 className={`mt-4 text-4xl font-semibold ${summary.pnl >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{summary.pnl}</h3>
          <p className="mt-3 text-sm text-slate-300">Performance is recalculated from the real portfolio holdings response each refresh cycle.</p>
          <div className="mt-5 flex items-center justify-between rounded-[1.2rem] bg-slate-950/35 px-4 py-3">
            <span className="text-sm text-slate-300">P&amp;L %</span>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${scoreTone(Math.min(95, 70 + Math.round(Math.abs(summary.pnlPercentage))))}`}>{summary.pnlPercentage}%</span>
          </div>
          <button className={`mt-5 ${actionButton(summary.pnl >= 0 ? 'Hold' : 'Reduce risk', summary.pnl >= 0 ? 'default' : 'sell')}`}>{summary.pnl >= 0 ? 'Hold' : 'Reduce risk'}</button>
        </article>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[1.8rem] border border-white/10 bg-white/6 p-6 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">Signals</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Recent signal feed</h3>
            </div>
            <div className="rounded-full bg-emerald-400/12 px-3 py-1 text-xs font-medium text-emerald-300">{topSignals.length} live</div>
          </div>
          <div className="mt-5 space-y-4">
            {topSignals.length ? topSignals.map((signal, index) => (
              <div key={signal.id} className="rounded-[1.35rem] border border-white/8 bg-slate-950/35 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-white">{index + 1}. {signal.symbol}</p>
                    <p className="mt-1 text-sm text-slate-300">{signal.signalType.replace('_', ' ')}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{signal.explanation}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${scoreTone(signal.confidence)}`}>{signal.confidence} / 100</span>
                </div>
              </div>
            )) : <EmptyState title="No signals yet" message="Signals will appear here as the backend generates and persists new items." />}
          </div>
        </article>

        <article className="rounded-[1.8rem] border border-white/10 bg-white/6 p-6 backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">Alerts</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Triggered notifications</h3>
            </div>
            <div className="rounded-full bg-rose-400/12 px-3 py-1 text-xs font-medium text-rose-300">{recentAlerts.length} active</div>
          </div>
          <div className="mt-5 space-y-4">
            {recentAlerts.length ? recentAlerts.map((alert) => (
              <div key={alert.id} className="rounded-[1.25rem] border border-white/8 bg-slate-950/35 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{alert.symbol}</p>
                    <p className="mt-1 text-sm text-slate-300">{alert.signalType.replace('_', ' ')}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{alert.reason}</p>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${scoreTone(alert.score)}`}>{alert.score}</span>
                </div>
              </div>
            )) : <EmptyState title="No alerts yet" message="Subscribe to alert rules and trigger a signal to populate this feed." />}
          </div>
        </article>
      </div>

      <article className="rounded-[1.8rem] border border-white/10 bg-white/6 p-6 backdrop-blur-2xl">
        <div>
          <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">Top Holdings</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Position health snapshot</h3>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {topHoldings.length ? topHoldings.map((holding) => (
            <div key={holding.symbol} className="rounded-[1.25rem] border border-white/8 bg-slate-950/35 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-white">{holding.symbol}</p>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${scoreTone(Math.min(95, 70 + Math.round(Math.abs(holding.pnlPercentage))))}`}>{holding.pnlPercentage}%</span>
              </div>
              <p className={`mt-3 text-lg font-semibold ${holding.pnl >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{holding.pnl}</p>
              <p className="mt-3 text-sm leading-6 text-slate-400">Live price {holding.livePrice} across {holding.quantity} shares with avg cost {holding.avgPrice}.</p>
            </div>
          )) : <EmptyState title="No holdings yet" message="Add portfolio holdings after signing in to populate your dashboard." />}
        </div>
      </article>
    </section>
  );
}

