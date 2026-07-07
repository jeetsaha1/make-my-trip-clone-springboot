import { NextApiRequest, NextApiResponse } from 'next';

// Return a simple seat map for flights
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const rows = 20;
  const cols = 6; // ABC DEF
  const seats: any[] = [];
  for (let r = 1; r <= rows; r++) {
    const row: any[] = [];
    for (let c = 0; c < cols; c++) {
      const seatId = `${r}${String.fromCharCode(65 + c)}`;
      row.push({ id: seatId, class: r <= 3 ? 'business' : r <= 8 ? 'premium' : 'economy', available: Math.random() > 0.15 });
    }
    seats.push(row);
  }
  res.json({ id: id || 'unknown', seats });
}
