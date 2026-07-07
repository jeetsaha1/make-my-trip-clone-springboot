import { useEffect, useState } from 'react';

export default function RoomSelection({ hotelId, images = [] }: { hotelId?: string; images?: string[] }) {
  const [rooms] = useState(() => [
    { id: 'r-std', title: 'Standard Room', price: 4999, img: images[0] || '/placeholder.png' },
    { id: 'r-del', title: 'Deluxe Room', price: 6999, img: images[1] || '/placeholder.png' },
    { id: 'r-suite', title: 'Suite', price: 11999, img: images[2] || '/placeholder.png' },
  ]);
  const [selected, setSelected] = useState<string | null>(() => localStorage.getItem('selectedRoom'));

  useEffect(() => {
    try { if (selected) localStorage.setItem('selectedRoom', selected); } catch {}
  }, [selected]);

  return (
    <div className="rounded-xl border p-4">
      <h4 className="font-semibold">Choose a room</h4>
      <div className="mt-3 grid gap-3">
        {rooms.map(r => (
          <div key={r.id} className={`rounded-lg p-3 flex gap-3 items-center ${selected === r.id ? 'border-2 border-blue-400' : 'border'}`}>
            <img src={r.img} alt={r.title} className="w-24 h-16 object-cover rounded"/>
            <div className="flex-1">
              <div className="font-medium">{r.title}</div>
              <div className="text-sm text-gray-500">₹{r.price}</div>
            </div>
            <button onClick={() => setSelected(r.id)} className="bg-blue-600 text-white px-3 py-1 rounded">Select</button>
          </div>
        ))}
      </div>
    </div>
  );
}
