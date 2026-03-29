'use client';

import { startTransition, useCallback, useEffect, useState } from 'react';

export function useRealtimeResource(loader, initialValue, intervalMs = 15000) {
  const [data, setData] = useState(initialValue);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await loader();
      startTransition(() => {
        setData(result);
        setLastUpdated(new Date());
        setError(null);
        setLoading(false);
      });
    } catch (caughtError) {
      startTransition(() => {
        setError(caughtError?.message || 'Failed to load data.');
        setLoading(false);
      });
    }
  }, [loader]);

  useEffect(() => {
    let cancelled = false;

    async function execute() {
      if (cancelled) {
        return;
      }

      await load();
    }

    execute();
    const timer = setInterval(execute, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [intervalMs, load]);

  return { data, lastUpdated, loading, error, reload: load };
}

