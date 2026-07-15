import { useEffect, useState } from 'react';

export default function RoomSelection({ hotelId, images = [] }: { hotelId?: string; images?: string[] }) {
  const storageKey = hotelId ? `selectedRoom:${hotelId}` : 'selectedRoom';
  const [rooms] = useState(() => [
    { id: 'r-std', title: 'Standard Room', price: 4999, img: images[0] || '/placeholder.png', description: 'Best for solo travelers and short stays.' },
    { id: 'r-del', title: 'Deluxe Room', price: 6999, img: images[1] || '/placeholder.png', description: 'More space, better views, and a strong upsell option.' },
    { id: 'r-suite', title: 'Suite', price: 11999, img: images[2] || '/placeholder.png', description: 'Premium stay with upgraded comfort and privacy.' },
  ]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    try {
      setSelected(localStorage.getItem(storageKey));
    } catch {
      setSelected(null);
    }
  }, [storageKey]);

  useEffect(() => {
    try { if (selected) localStorage.setItem(storageKey, selected); } catch {}
  }, [selected, storageKey]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-slate-900">Choose a room</h4>
          <p className="text-sm text-slate-500">Compare room types, view pricing, and save your preference for the next booking.</p>
        </div>
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {selected ? 'Saved preference' : 'No preference saved'}
        </div>
      </div>
      <div className="mt-3 grid gap-3">
        {rooms.map(r => (
          <div key={r.id} className={`rounded-xl p-3 flex gap-3 items-center border transition ${selected === r.id ? 'border-blue-400 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>
            <img src={r.img} alt={r.title} className="w-24 h-16 object-cover rounded"/>
            <div className="flex-1">
              <div className="font-medium">{r.title}</div>
              <div className="text-sm text-gray-500">₹{r.price}</div>
              <div className="text-xs text-slate-500 mt-1">{r.description}</div>
            </div>
            <button onClick={() => setSelected(r.id)} className="bg-blue-600 text-white px-3 py-1 rounded">Select</button>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-lg border border-dashed border-slate-200 p-3 text-sm text-slate-600">
        Premium room photos act as a lightweight preview for users comparing upgrade paths.
      </div>
    </div>
  );
}
