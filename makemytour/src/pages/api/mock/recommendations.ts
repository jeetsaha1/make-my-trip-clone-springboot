import { NextApiRequest, NextApiResponse } from 'next';

// Simple demo recommendations based on provided `user` param
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { user } = req.query;
  // Simple heuristics: if user contains 'beach' provide beach packages
  const prefs = String(user || '').toLowerCase();
  const recs = [];
  if (prefs.includes('beach')) {
    recs.push({ id: 'hd-1', title: 'Goa Escape', reason: 'Based on your beach trips' });
    recs.push({ id: 'hs-1', title: 'Beachside Homestay', reason: 'You like beachfront stays' });
  } else {
    recs.push({ id: 'fl-1', title: 'Popular Domestic Flight', reason: 'Frequent short-haul bookings' });
    recs.push({ id: 'ht-1', title: 'Top Rated Hotel', reason: 'Highly rated for comfort' });
  }

  res.json({ recommendations: recs });
}
