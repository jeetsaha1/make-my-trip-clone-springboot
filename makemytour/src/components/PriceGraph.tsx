import { useEffect, useState } from 'react';

export default function PriceGraph({ id }: { id: string }) {
  const [history, setHistory] = useState<{ ts: number; price: number }[]>([]);
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/mock/dynamic-pricing?id=${id}`).then(r => r.json()).then((data) => {
      setPrice(data.price);
      setHistory(data.history || []);
    });
  }, [id]);

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
    <div className="rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Price history</h4>
        <div className="text-sm text-gray-600">Now: {price ? `₹${price}` : '—'}</div>
      </div>
      <div className="mt-2">
        {history.length === 0 ? (
          <div className="text-sm text-gray-500">No history</div>
        ) : (
          <svg width={width} height={height}>
            <polyline fill="none" stroke="#2563EB" strokeWidth={2} points={points.join(' ')} />
          </svg>
        )}
      </div>
    </div>
  );
}
