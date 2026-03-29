'use client';

import { useMemo, useState } from 'react';
import { getSignals } from '../lib/api';
import { EmptyState, ErrorState, LoadingState } from './ResourceStates';
import { SectionHeader } from './SectionHeader';
import { useRealtimeResource } from './useRealtimeResource';

const sectorOptions = ['All', 'Banking', 'Energy', 'IT', 'Auto', 'Pharma', 'Market'];
const riskOptions = ['All', 'low', 'medium', 'high'];
const timeframeOptions = ['All', 'short-term', 'swing', 'position'];

function scoreTone(value) {
  if (value >= 80) return 'border-emerald-400/20 bg-emerald-400/12 text-emerald-300';
  if (value >= 65) return 'border-amber-400/20 bg-amber-400/12 text-amber-300';
  return 'border-rose-400/20 bg-rose-400/12 text-rose-300';
}

function riskTone(level) {
  if (level === 'low') return 'border-emerald-400/20 bg-emerald-400/12 text-emerald-300';
  if (level === 'medium') return 'border-amber-400/20 bg-amber-400/12 text-amber-300';
  return 'border-rose-400/20 bg-rose-400/12 text-rose-300';
}

export function SignalDiscoveryClient() {
  const { data, lastUpdated, loading, error, reload } = useRealtimeResource(getSignals, [], 20000);
  const [sector, setSector] = useState('All');
  const [riskLevel, setRiskLevel] = useState('All');
  const [timeframe, setTimeframe] = useState('All');

  const filteredSignals = useMemo(() => {
    return data.filter((signal) => {
      const sectorMatch = sector === 'All' || signal.sector === sector;
      const riskMatch = riskLevel === 'All' || signal.riskLevel === riskLevel;
      const timeframeMatch = timeframe === 'All' || signal.timeframe === timeframe;
      return sectorMatch && riskMatch && timeframeMatch;
    });
  }, [data, sector, riskLevel, timeframe]);

  if (loading) {
    return <LoadingState title="Loading signals..." subtitle="Fetching the live signal feed from the backend." />;
  }

  if (error) {
    return <ErrorState title="Signals unavailable" message={error} onRetry={reload} />;
  }

  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Signals"
        title="Signal discovery screen"
        subtitle="Scan candidate ideas in a list-first workflow with fast filters, confidence scoring, risk labels, and live backend explanations."
        lastUpdated={lastUpdated}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4 backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Sector</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {sectorOptions.map((option) => (
              <button key={option} onClick={() => setSector(option)} className={`rounded-full px-3 py-2 text-xs font-semibold ${sector === option ? 'bg-white text-slate-950' : 'bg-white/5 text-slate-300'}`}>
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4 backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Risk level</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {riskOptions.map((option) => (
              <button key={option} onClick={() => setRiskLevel(option)} className={`rounded-full px-3 py-2 text-xs font-semibold ${riskLevel === option ? 'bg-white text-slate-950' : 'bg-white/5 text-slate-300'}`}>
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4 backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Timeframe</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {timeframeOptions.map((option) => (
              <button key={option} onClick={() => setTimeframe(option)} className={`rounded-full px-3 py-2 text-xs font-semibold ${timeframe === option ? 'bg-white text-slate-950' : 'bg-white/5 text-slate-300'}`}>
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[1.8rem] border border-white/10 bg-white/6 p-4 backdrop-blur-2xl md:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">List View</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Curated signal feed</h3>
          </div>
          <div className="rounded-full bg-white/5 px-4 py-2 text-xs text-slate-300">{filteredSignals.length} results</div>
        </div>

        <div className="space-y-4">
          {filteredSignals.length ? filteredSignals.map((signal) => (
            <article key={signal.id} className="rounded-[1.4rem] border border-white/8 bg-slate-950/35 p-4 md:p-5">
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.9fr_1.5fr_0.9fr] lg:items-start">
                <div>
                  <p className="text-lg font-semibold text-white">{signal.stockName}</p>
                  <p className="mt-1 text-sm text-slate-400">{signal.symbol}</p>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Signal type</p>
                  <p className="mt-2 text-sm font-medium text-slate-200">{signal.signalType.replace('_', ' ')}</p>
                  <p className="mt-2 text-xs text-slate-500">{signal.sector} · {signal.timeframe}</p>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Explanation</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{signal.explanation}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${scoreTone(signal.confidence)}`}>{signal.confidence} / 100</span>
                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${riskTone(signal.riskLevel)}`}>{signal.riskLevel} risk</span>
                  </div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{signal.status}</p>
                </div>
              </div>
            </article>
          )) : <EmptyState title="No signals available" message="Signals will populate here once the backend has recent triggered signal records." />}
        </div>
      </div>
    </section>
  );
}

