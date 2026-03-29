export function OverviewCards({ overview }) {
  return (
    <section className="grid gap-5 lg:grid-cols-3">
      {overview.indices.map((item) => (
        <article key={item.symbol} className="rounded-[1.75rem] bg-ink p-6 text-white shadow-glow">
          <p className="text-sm uppercase tracking-[0.2em] text-white/60">{item.symbol}</p>
          <h2 className="mt-5 text-3xl font-semibold">{item.value}</h2>
          <p className="mt-2 text-base text-emerald-300">{item.change}% today</p>
        </article>
      ))}
    </section>
  );
}

