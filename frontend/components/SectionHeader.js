'use client';

export function SectionHeader({ eyebrow, title, subtitle, lastUpdated }) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-[11px] uppercase tracking-[0.34em] text-emerald-300/80">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">{subtitle}</p>
      </div>
      <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300 backdrop-blur-xl">
        {lastUpdated ? `Live refresh: ${lastUpdated.toLocaleTimeString()}` : 'Loading live feed...'}
      </div>
    </div>
  );
}

