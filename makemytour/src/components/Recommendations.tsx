import { useEffect, useMemo, useState } from 'react';

export default function Recommendations({ userKey }: { userKey?: string }) {
  const [recs, setRecs] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<Record<string, 'helpful' | 'irrelevant'>>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/mock/recommendations?user=${userKey || ''}`).then(r => r.json()).then((d) => setRecs(d.recommendations || []));
  }, [userKey]);

  const visibleRecs = useMemo(() => recs.filter((rec) => feedback[rec.id] !== 'irrelevant'), [recs, feedback]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold">Recommended for you</h4>
          <p className="text-sm text-gray-500">Suggestions improve as you interact with bookings, reviews, and searches.</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Personalized</span>
      </div>
      <div className="mt-3 space-y-3">
        {visibleRecs.map(r => (
          <div key={r.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-medium text-slate-900">{r.title}</div>
                <div className="text-xs text-gray-500">Why this recommendation? {r.reason}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button className="rounded-md border border-blue-200 px-3 py-1 text-sm text-blue-700 hover:bg-blue-50" title={r.reason} onClick={() => setActiveId(activeId === r.id ? null : r.id)}>
                  Why?
                </button>
                <button className="rounded-md bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">View</button>
              </div>
            </div>
            {activeId === r.id && (
              <div className="mt-3 rounded-md bg-white p-3 text-sm text-slate-600">
                This recommendation is generated from your search and booking pattern. Marking it helpful will bias future suggestions toward similar stays or trips.
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <button
                className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700"
                onClick={() => setFeedback((prev) => ({ ...prev, [r.id]: 'helpful' }))}
              >
                Helpful
              </button>
              <button
                className="rounded-full bg-rose-100 px-3 py-1 text-rose-700"
                onClick={() => setFeedback((prev) => ({ ...prev, [r.id]: 'irrelevant' }))}
              >
                Irrelevant
              </button>
              {feedback[r.id] && <span className="text-xs text-gray-500">Marked {feedback[r.id]}</span>}
            </div>
          </div>
        ))}
        {visibleRecs.length === 0 && <div className="text-sm text-gray-500">No recommendations yet.</div>}
      </div>
    </div>
  );
}
