export function SignalsPanel({ overview, answer }) {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <article className="rounded-[1.75rem] border border-slate-200 bg-white/80 p-6 shadow-glow">
        <h3 className="text-2xl font-semibold">Watchlist signals</h3>
        <div className="mt-5 space-y-4">
          {overview.watchlistSignals.map((signal) => (
            <div key={signal.symbol} className="rounded-2xl bg-mist p-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">{signal.symbol}</span>
                <span className="rounded-full bg-saffron px-3 py-1 text-xs font-semibold text-white">{signal.confidence} confidence</span>
              </div>
              <p className="mt-2 text-sm text-slate-600">Theme: {signal.type.replace('_', ' ')}</p>
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-[1.75rem] border border-slate-200 bg-white/80 p-6 shadow-glow">
        <h3 className="text-2xl font-semibold">AI market brief</h3>
        <p className="mt-4 text-base leading-7 text-slate-700">{answer.answer}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {answer.citations.map((citation, index) => (
            <span key={index} className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-600">
              {typeof citation === 'string' ? citation : citation.source}
            </span>
          ))}
        </div>
      </article>
    </section>
  );
}

