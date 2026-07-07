import { useEffect, useState } from 'react';

export default function Recommendations({ userKey }: { userKey?: string }) {
  const [recs, setRecs] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/mock/recommendations?user=${userKey || ''}`).then(r => r.json()).then((d) => setRecs(d.recommendations || []));
  }, [userKey]);

  return (
    <div className="rounded-xl border p-4">
      <h4 className="font-semibold">Recommended for you</h4>
      <div className="mt-3 space-y-2">
        {recs.map(r => (
          <div key={r.id} className="flex items-center justify-between">
            <div>
              <div className="font-medium">{r.title}</div>
              <div className="text-xs text-gray-500">{r.reason}</div>
            </div>
            <div className="text-sm text-gray-600"> <button className="text-blue-600">View</button> </div>
          </div>
        ))}
        {recs.length === 0 && <div className="text-sm text-gray-500">No recommendations yet.</div>}
      </div>
    </div>
  );
}
