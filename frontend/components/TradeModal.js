'use client';

import { useState } from 'react';
import { addHolding } from '../lib/api';

export function TradeModal({ isOpen, onClose, symbol, action, onRefresh }) {
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!price || isNaN(price) || price <= 0) {
      setError('Please enter a valid price');
      return;
    }
    if (!quantity || isNaN(quantity) || quantity <= 0) {
      setError('Please enter a valid quantity');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addHolding({
        symbol,
        quantity: Number(quantity),
        avg_price: Number(price),
      });
      setLoading(false);
      onRefresh();
      onClose();
    } catch (caughtError) {
      setLoading(false);
      setError(caughtError.message || 'Failed to complete the trade');
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-md">
      <div 
        className="fixed inset-0 bg-slate-950/40" 
        onClick={onClose}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/90 p-8 shadow-2xl shadow-indigo-500/10 transition-all">
        <div className="absolute -left-20 -top-20 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -right-20 -bottom-20 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative">
          <header className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">{action} Position</p>
              <h3 className="mt-1 text-2xl font-semibold text-white">{symbol}</h3>
            </div>
            <button 
              onClick={onClose}
              className="rounded-full bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">Quantity</label>
              <input 
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full rounded-[1.2rem] border border-white/10 bg-white/5 px-5 py-4 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none transition"
                placeholder="Shares to buy/sell..."
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">Average Price</label>
              <input 
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-[1.2rem] border border-white/10 bg-white/5 px-5 py-4 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none transition"
                placeholder="Execution price..."
              />
            </div>

            {error && <p className="text-sm font-medium text-rose-400 animate-pulse">{error}</p>}

            <div className="pt-2">
              <button 
                type="submit"
                disabled={loading}
                className={`w-full rounded-[1.3rem] py-4 text-sm font-bold uppercase tracking-[0.15em] transition-all
                  ${action === 'Buy' 
                    ? 'bg-emerald-400 text-slate-950 hover:bg-emerald-300 hover:shadow-lg hover:shadow-emerald-400/20' 
                    : 'bg-rose-400 text-slate-950 hover:bg-rose-300 hover:shadow-lg hover:shadow-rose-400/20'}
                  ${loading && 'opacity-50 pointer-events-none'}`}
              >
                {loading ? 'Processing...' : `Confirm ${action}`}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-xs leading-5 text-slate-500">
            Confirming this will update your real portfolio on the backend. This is not a simulation.
          </p>
        </div>
      </div>
    </div>
  );
}
