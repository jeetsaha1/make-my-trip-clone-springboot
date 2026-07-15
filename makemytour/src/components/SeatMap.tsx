import { useEffect, useState } from 'react';

export default function SeatMap({ flightId, onSelect }: { flightId: string; onSelect?: (seats: string[]) => void }) {
  const [seats, setSeats] = useState<any[][]>([]);
  const storageKey = flightId ? `selectedSeats:${flightId}` : 'selectedSeats';
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setSelected(saved ? JSON.parse(saved) : []);
    } catch {
      setSelected([]);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!flightId) return;
    fetch(`/api/mock/seatmap?id=${flightId}`).then((r) => r.json()).then((data) => {
      setSeats(data.seats || []);
    });
  }, [flightId]);

  const toggle = (id: string, available: boolean) => {
    if (!available) return;
    let next = selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id];
    setSelected(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
    if (onSelect) onSelect(next);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-slate-900">Seat selection</h4>
          <p className="text-sm text-slate-500">Choose standard, premium, or business seats and keep your preference for the next booking.</p>
        </div>
        <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{selected.length} selected</div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
        <span className="rounded-full bg-slate-100 px-3 py-1">Economy</span>
        <span className="rounded-full bg-indigo-100 px-3 py-1">Premium</span>
        <span className="rounded-full bg-amber-100 px-3 py-1">Business</span>
        <span className="rounded-full bg-slate-200 px-3 py-1">Unavailable</span>
      </div>
      <div className="mt-4 max-h-[420px] overflow-y-auto overflow-x-auto pr-1">
        <div className="inline-block min-w-full">
          {seats.map((row, rIdx) => (
            <div key={rIdx} className="flex items-center gap-2 mb-2">
              <div className="w-6 text-sm text-gray-500">{rIdx+1}</div>
              <div className="flex gap-1">
                {row.map((s: any) => (
                  <div key={s.id} onClick={() => toggle(s.id, s.available)} title={s.available ? `${s.class} seat` : 'Unavailable seat'} className={`w-8 h-8 flex items-center justify-center rounded text-xs cursor-pointer transition ${!s.available ? 'bg-gray-200 text-gray-400' : selected.includes(s.id) ? 'bg-blue-600 text-white' : s.class === 'business' ? 'bg-amber-300 text-amber-900' : s.class === 'premium' ? 'bg-indigo-200 text-indigo-900' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                    {s.id.replace(/\d+/, '')}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
        Selected seats are saved in this browser as your preference for the current flight.
      </div>
    </div>
  );
}
