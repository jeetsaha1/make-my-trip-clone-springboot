import { NextApiRequest, NextApiResponse } from 'next';

// In-memory store for price state (demo only)
const basePrices: Record<string, number> = {
  'fl-1': 5000,
  'ht-1': 7800,
  'cb-1': 14,
};

const freezeMap: Map<string, { price: number; expiresAt: number }> = new Map();

function computePrice(id: string, factor = 1) {
  const base = basePrices[id] ?? 1000;
  const seasonal = (Math.sin(Date.now() / (1000 * 60 * 60 * 24)) + 1) * 0.1; // small daily variation
  const demand = Math.random() * 0.2; // random demand
  const price = Math.round(base * (1 + seasonal + demand) * factor);
  return price;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, action } = req.query;
  if (!id) {
    res.status(400).json({ error: 'Provide ?id=<itemId>' });
    return;
  }
  const key = String(id);

  if (action === 'freeze' && req.method === 'POST') {
    const duration = Number(req.body?.duration) || 15; // minutes
    const price = computePrice(key);
    freezeMap.set(key, { price, expiresAt: Date.now() + duration * 60 * 1000 });
    res.json({ frozen: true, price, expiresAt: freezeMap.get(key)?.expiresAt });
    return;
  }

  // If frozen and not expired, return frozen price
  const frozen = freezeMap.get(key);
  if (frozen && frozen.expiresAt > Date.now()) {
    res.json({ id: key, price: frozen.price, frozen: true, expiresAt: frozen.expiresAt });
    return;
  }

  // Default: return current computed price plus simple history
  const nowPrice = computePrice(key);
  const history = Array.from({ length: 12 }).map((_, i) => ({
    ts: Date.now() - (11 - i) * 60 * 60 * 1000,
    price: computePrice(key, 1 - (11 - i) * 0.01),
  }));

  res.json({ id: key, price: nowPrice, frozen: false, history });
}
