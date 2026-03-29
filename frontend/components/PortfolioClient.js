'use client';

import { getPortfolio, summarizePortfolio } from '../lib/api';
import { EmptyState, ErrorState, LoadingState } from './ResourceStates';
import { SectionHeader } from './SectionHeader';
import { useRealtimeResource } from './useRealtimeResource';

export function PortfolioClient() {
  const { data, lastUpdated, loading, error, reload } = useRealtimeResource(getPortfolio, [], 20000);
  const holdings = Array.isArray(data) ? data : (data?.holdings || []);
  const summary = summarizePortfolio(data);

  if (loading) {
    return <LoadingState title="Loading portfolio..." subtitle="Fetching your holdings and calculating live P&L." />;
  }

  if (error) {
    return <ErrorState title="Portfolio unavailable" message={error} onRetry={reload} />;
  }

  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Portfolio"
        title="Live P&L and position health"
        subtitle="Track how your current holdings are evolving, with rolling P&L updates and a clear view of allocation-level outcomes."
        lastUpdated={lastUpdated}
      />

      <div className="grid gap-5 md:grid-cols-4">
        {[
          ['Invested', summary.investedValue],
          ['Current', summary.currentValue],
          ['P&L', summary.pnl],
          ['P&L %', `${summary.pnlPercentage}%`],
        ].map(([label, value]) => (
          <article key={label} className="rounded-[1.4rem] border border-slate-200 bg-white/80 p-5 shadow-glow">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{label}</p>
            <h3 className="mt-4 text-2xl font-semibold text-slate-950">{value}</h3>
          </article>
        ))}
      </div>

      <article className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-6 shadow-glow">
        <h3 className="text-xl font-semibold text-slate-950">Holdings</h3>
        {holdings.length ? (
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-800">
              <thead className="text-slate-500">
                <tr>
                  <th className="pb-3">Symbol</th>
                  <th className="pb-3">Qty</th>
                  <th className="pb-3">Avg</th>
                  <th className="pb-3">Live</th>
                  <th className="pb-3">Invested</th>
                  <th className="pb-3">Current</th>
                  <th className="pb-3">P&L</th>
                  <th className="pb-3">P&L %</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding) => (
                  <tr key={holding.symbol} className="border-t border-slate-100">
                    <td className="py-4 font-semibold">{holding.symbol}</td>
                    <td className="py-4">{holding.quantity}</td>
                    <td className="py-4">{holding.avgPrice}</td>
                    <td className="py-4">{holding.livePrice}</td>
                    <td className="py-4">{holding.investedValue}</td>
                    <td className="py-4">{holding.currentValue}</td>
                    <td className={`py-4 ${holding.pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{holding.pnl}</td>
                    <td className={`py-4 ${holding.pnlPercentage >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{holding.pnlPercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState title="No holdings found" message="Add a portfolio holding through the backend flow before expecting this page to populate." />
          </div>
        )}
      </article>
    </section>
  );
}

