import { useEffect, useState } from 'react';

interface StatusUpdate {
  flightId: string;
  status: string;
  delayMinutes?: number;
  reason?: string | null;
  revisedDeparture?: string | null;
  timestamp: string;
}

export default function LiveFlightStatus({ flightId }: { flightId: string }) {
  const [updates, setUpdates] = useState<StatusUpdate[]>([]);
  useEffect(() => {
    if (!flightId) return;
    const src = new EventSource(`/api/mock/flight-status?flights=${flightId}`);
    src.addEventListener('update', (e: any) => {
      try {
        const data: StatusUpdate = JSON.parse(e.data);
        setUpdates((u) => [data, ...u].slice(0, 10));
        // Show browser notification for important updates
        if (typeof window !== 'undefined' && (data.status === 'Delayed' || data.status === 'Boarding')) {
          if (Notification.permission === 'granted') {
            new Notification(`Flight ${data.flightId} - ${data.status}`, { body: data.reason || 'Update available' });
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then((perm) => {
              if (perm === 'granted') new Notification(`Flight ${data.flightId} - ${data.status}`, { body: data.reason || 'Update available' });
            });
          }
        }
      } catch (err) {
        console.error('Invalid SSE payload', err);
      }
    });
    src.onerror = (err) => {
      console.error('SSE error', err);
      src.close();
    };
    return () => src.close();
  }, [flightId]);

  return (
    <div className="rounded-xl border p-4">
      <h4 className="font-semibold">Live Flight Status</h4>
      <div className="mt-2 space-y-2">
        {updates.length === 0 && <div className="text-sm text-gray-500">No recent updates.</div>}
        {updates.map((u, i) => (
          <div key={i} className="text-sm">
            <div className="font-medium">{u.status} {u.delayMinutes ? `• ${u.delayMinutes}m` : ''}</div>
            <div className="text-xs text-gray-500">{u.reason || ''} • {new Date(u.timestamp).toLocaleString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
