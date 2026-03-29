'use client';

export function LoadingState({ title = 'Loading data...', subtitle = 'Please wait while we fetch the latest information.' }) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-white/6 p-6 text-slate-200 backdrop-blur-2xl">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <div className="rounded-[1.6rem] border border-rose-400/20 bg-rose-400/10 p-6 text-rose-100 backdrop-blur-2xl">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-2 text-sm text-rose-100/80">{message}</p>
      {onRetry ? (
        <button onClick={onRetry} className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200">
          Retry
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, message }) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-white/6 p-6 text-slate-200 backdrop-blur-2xl">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm text-slate-400">{message}</p>
    </div>
  );
}

