import { useEffect, useMemo, useState } from 'react';

interface StatusUpdate {
  flightId: string;
  status: string;
  delayMinutes?: number;
  reason?: string | null;
  revisedDeparture?: string | null;
  estimatedArrival?: string | null;
  timestamp: string;
}

export default function LiveFlightStatus({ flightId }: { flightId: string | string[] }) {
  const [updates, setUpdates] = useState<StatusUpdate[]>([]);
  const flightIds = useMemo(() => (Array.isArray(flightId) ? flightId : [flightId]).map((value) => String(value).trim()).filter(Boolean), [flightId]);

  useEffect(() => {
    if (flightIds.length === 0) return;
    const src = new EventSource(`/api/mock/flight-status?flights=${encodeURIComponent(flightIds.join(','))}`);
    src.addEventListener('update', (e: any) => {
      try {
        const data: StatusUpdate = JSON.parse(e.data);
        setUpdates((u) => [data, ...u].slice(0, 10));
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
  }, [flightIds]);

  const groupedUpdates = useMemo(() => {
    const map = new Map<string, StatusUpdate[]>();
    updates.forEach((update) => {
      const existing = map.get(update.flightId) || [];
      existing.push(update);
      map.set(update.flightId, existing);
    });
    return Array.from(map.entries()).map(([id, items]) => ({ id, latest: items[0], history: items.slice(0, 3) }));
  }, [updates]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-slate-900">Live Flight Status</h4>
          <p className="text-sm text-slate-500">Tracking {flightIds.length} flight{flightIds.length === 1 ? "" : "s"} with live notifications and ETA updates.</p>
        </div>
        <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          {updates.length} update{updates.length === 1 ? "" : "s"}
        </div>
      </div>
      <div className="mt-4 space-y-4">
        {updates.length === 0 && <div className="text-sm text-gray-500">No recent updates.</div>}
        {groupedUpdates.map((flight) => (
          <div key={flight.id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Flight {flight.id}</p>
                <p className="text-xs text-slate-500">Latest update: {new Date(flight.latest.timestamp).toLocaleString()}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-white px-3 py-1 text-slate-700 shadow-sm">{flight.latest.status}</span>
                {typeof flight.latest.delayMinutes === 'number' && flight.latest.delayMinutes > 0 && (
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">Delayed by {flight.latest.delayMinutes}m</span>
                )}
              </div>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <div className="rounded-lg bg-white p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Reason</p>
                <p className="mt-1 text-sm text-gray-800">{flight.latest.reason || 'No disruption reported'}</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Revised departure</p>
                <p className="mt-1 text-sm text-gray-800">{flight.latest.revisedDeparture ? new Date(flight.latest.revisedDeparture).toLocaleString() : 'On schedule'}</p>
              </div>
              <div className="rounded-lg bg-white p-3">
                <p className="text-xs uppercase tracking-wide text-gray-500">Estimated arrival</p>
                <p className="mt-1 text-sm text-gray-800">{flight.latest.estimatedArrival ? new Date(flight.latest.estimatedArrival).toLocaleString() : 'Updating in real time'}</p>
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {flight.history.map((entry, index) => (
                <div key={`${entry.flightId}-${index}`} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm">
                  <span className="font-medium text-slate-700">{entry.status}</span>
                  <span className="text-xs text-slate-500">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
