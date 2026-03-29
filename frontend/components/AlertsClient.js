'use client';

import { startTransition, useState } from 'react';
import { getAlerts, subscribeToAlerts } from '../lib/api';
import { EmptyState, ErrorState, LoadingState } from './ResourceStates';
import { SectionHeader } from './SectionHeader';
import { useRealtimeResource } from './useRealtimeResource';

export function AlertsClient() {
  const { data, lastUpdated, loading, error, reload } = useRealtimeResource(getAlerts, [], 20000);
  const [threshold, setThreshold] = useState('75');
  const [channels, setChannels] = useState('in_app');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubscribe(event) {
    event.preventDefault();
    setMessage('');
    setFormError('');

    const parsedThreshold = Number(threshold);
    const parsedChannels = channels.split(',').map((value) => value.trim()).filter(Boolean);

    if (!Number.isFinite(parsedThreshold) || parsedThreshold < 0 || parsedThreshold > 100) {
      setFormError('Threshold must be a number between 0 and 100.');
      return;
    }

    if (!parsedChannels.length) {
      setFormError('Add at least one delivery channel, such as in_app.');
      return;
    }

    setSaving(true);
    try {
      const response = await subscribeToAlerts({ threshold: parsedThreshold, channels: parsedChannels });
      startTransition(() => {
        setMessage(`Subscription saved at threshold ${response.threshold}.`);
        setSaving(false);
      });
      reload();
    } catch (caughtError) {
      setSaving(false);
      setFormError(caughtError.message || 'Unable to save alert subscription.');
    }
  }

  if (loading) {
    return <LoadingState title="Loading alerts..." subtitle="Fetching your active alert subscriptions and recent notifications." />;
  }

  if (error) {
    return <ErrorState title="Alerts unavailable" message={error} onRetry={reload} />;
  }

  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Alerts"
        title="Signal-triggered notifications"
        subtitle="Manage threshold subscriptions and review alert history as new signal scores stream through the platform."
        lastUpdated={lastUpdated}
      />

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={handleSubscribe} className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-6 shadow-glow">
          <h3 className="text-xl font-semibold text-slate-950">Subscribe</h3>
          <label className="mt-5 block text-sm text-slate-600">Threshold</label>
          <input value={threshold} onChange={(event) => setThreshold(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-950" />
          <label className="mt-5 block text-sm text-slate-600">Channels</label>
          <input value={channels} onChange={(event) => setChannels(event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-950" />
          <button disabled={saving} className="mt-5 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Saving...' : 'Save Alert Rules'}</button>
          {message ? <p className="mt-4 text-sm text-emerald-600">{message}</p> : null}
          {formError ? <p className="mt-4 text-sm text-rose-600">{formError}</p> : null}
        </form>

        <article className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-6 shadow-glow">
          <h3 className="text-xl font-semibold text-slate-950">Recent Alerts</h3>
          <div className="mt-5 space-y-4">
            {data.length ? data.map((alert) => (
              <div key={alert.id} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-950">{alert.symbol}</span>
                  <span className="rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white">{alert.score}</span>
                </div>
                <p className="mt-2 text-sm text-slate-700">{alert.reason}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">{alert.signalType}</p>
              </div>
            )) : <EmptyState title="No alerts yet" message="Your triggered alerts will appear here once a subscribed signal crosses the threshold." />}
          </div>
        </article>
      </div>
    </section>
  );
}

