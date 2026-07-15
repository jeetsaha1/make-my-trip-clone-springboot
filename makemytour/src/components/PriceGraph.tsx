import { useEffect, useMemo, useState } from 'react';

export default function PriceGraph({ id }: { id: string }) {
  const [history, setHistory] = useState<{ ts: number; price: number }[]>([]);
  const [price, setPrice] = useState<number | null>(null);
  const [freezeMinutes, setFreezeMinutes] = useState(15);
  const [frozenUntil, setFrozenUntil] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const response = await fetch(`/api/mock/dynamic-pricing?id=${id}`);
      const data = await response.json();
      setPrice(data.price);
      setHistory(data.history || []);
      setFrozenUntil(data.frozen ? data.expiresAt : null);
    };

    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    if (!frozenUntil) return;
    const interval = setInterval(() => {
      if (frozenUntil <= Date.now()) {
        setFrozenUntil(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [frozenUntil]);

  const handleFreeze = async () => {
    if (!id) return;
    setStatusMessage('Freezing price...');
    const response = await fetch(`/api/mock/dynamic-pricing?id=${id}&action=freeze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ duration: freezeMinutes }),
    });
    const data = await response.json();
    setPrice(data.price);
    setFrozenUntil(data.expiresAt || null);
    setStatusMessage(`Price frozen for ${freezeMinutes} minutes.`);
  };

  const frozenLabel = useMemo(() => {
    if (!frozenUntil) return '';
    const remaining = Math.max(0, Math.ceil((frozenUntil - Date.now()) / 60000));
    return `${remaining} minute${remaining === 1 ? '' : 's'} remaining`;
  }, [frozenUntil]);

  const width = 300;
  const height = 80;
  const padding = 8;
  const points = history.map((h, i) => {
    const x = padding + (i / Math.max(1, history.length - 1)) * (width - padding * 2);
    const min = Math.min(...history.map(h => h.price));
    const max = Math.max(...history.map(h => h.price));
    const y = height - padding - ((h.price - min) / Math.max(1, max - min)) * (height - padding * 2 || 1);
    return `${x},${y}`;
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h4 className="font-semibold">Price history</h4>
          <p className="text-sm text-gray-500">Real-time pricing adjusts for seasonality and demand.</p>
        </div>
        <div className="text-sm text-gray-600">Now: {price ? `₹${price}` : '—'} {frozenUntil ? `• frozen (${frozenLabel})` : ''}</div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        <label className="text-gray-600">
          Freeze for
          <select value={freezeMinutes} onChange={(e) => setFreezeMinutes(Number(e.target.value))} className="ml-2 rounded-md border px-2 py-1">
            <option value={15}>15 min</option>
            <option value={30}>30 min</option>
            <option value={60}>60 min</option>
          </select>
        </label>
        <button onClick={handleFreeze} className="rounded-md bg-blue-600 px-3 py-1.5 text-white hover:bg-blue-700">
          Price freeze
        </button>
        {statusMessage && <span className="text-xs text-blue-600">{statusMessage}</span>}
      </div>
      <div className="mt-3">
        {history.length === 0 ? (
          <div className="text-sm text-gray-500">No history</div>
        ) : (
          <svg width={width} height={height}>
            <polyline fill="none" stroke="#2563EB" strokeWidth={2} points={points.join(' ')} />
          </svg>
        )}
      </div>
      <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
        Price freeze locks the current fare for a limited time so users can decide without sudden jumps.
      </div>
    </div>
  );
}
