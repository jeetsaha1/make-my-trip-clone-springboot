import { useEffect, useState } from 'react';

export default function SeatMap({ flightId, onSelect }: { flightId: string; onSelect?: (seats: string[]) => void }) {
  const [seats, setSeats] = useState<any[][]>([]);
  const [selected, setSelected] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('selectedSeats') || '[]'); } catch { return []; }
  });

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
    try { localStorage.setItem('selectedSeats', JSON.stringify(next)); } catch {}
    if (onSelect) onSelect(next);
  };

  return (
    <div className="rounded-xl border p-4">
      <h4 className="font-semibold">Seat selection</h4>
      <div className="mt-3 overflow-auto">
        <div className="inline-block">
          {seats.map((row, rIdx) => (
            <div key={rIdx} className="flex items-center gap-2 mb-2">
              <div className="w-6 text-sm text-gray-500">{rIdx+1}</div>
              <div className="flex gap-1">
                {row.map((s: any) => (
                  <div key={s.id} onClick={() => toggle(s.id, s.available)} className={`w-8 h-8 flex items-center justify-center rounded text-xs cursor-pointer ${!s.available ? 'bg-gray-200 text-gray-400' : selected.includes(s.id) ? 'bg-blue-600 text-white' : s.class === 'business' ? 'bg-yellow-300' : s.class === 'premium' ? 'bg-indigo-200' : 'bg-slate-100'}`}>
                    {s.id.replace(/\d+/, '')}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
