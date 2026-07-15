import { NextApiRequest, NextApiResponse } from 'next';

// Simple in-memory state for demo
const statusOptions = ['On Time', 'Delayed', 'Boarding', 'Departed', 'Landed'];

function randomStatus() {
  const idx = Math.floor(Math.random() * statusOptions.length);
  return statusOptions[idx];
}

function computeEstimatedArrival(status: string, delayMinutes: number) {
  const baseArrival = new Date(Date.now() + 90 * 60000);
  if (status === 'Delayed') {
    return new Date(baseArrival.getTime() + delayMinutes * 60000).toISOString();
  }
  if (status === 'Boarding') {
    return new Date(baseArrival.getTime() - 20 * 60000).toISOString();
  }
  return baseArrival.toISOString();
}

// SSE endpoint that streams status updates for requested flight ids
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { flights } = req.query; // comma separated ids
  if (!flights) {
    res.status(400).json({ error: 'Provide ?flights=id1,id2' });
    return;
  }

  const ids = String(flights).split(',').map((s) => s.trim()).filter(Boolean);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let counter = 0;

  const sendUpdate = () => {
    ids.forEach((id) => {
      const status = randomStatus();
      const delayMinutes = status === 'Delayed' ? Math.floor(Math.random() * 120) + 5 : 0;
      const now = new Date();
      const departureDelta = status === 'Delayed' ? delayMinutes : 0;
      const payload = {
        flightId: id,
        status,
        delayMinutes,
        reason: status === 'Delayed' ? 'Air traffic congestion' : null,
        revisedDeparture: new Date(now.getTime() + departureDelta * 60000).toISOString(),
        estimatedArrival: computeEstimatedArrival(status, delayMinutes),
        timestamp: new Date().toISOString(),
      };
      res.write(`event: update\n`);
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    });
    counter += 1;
  };

  // initial send
  sendUpdate();
  const iv = setInterval(sendUpdate, 8000);

  req.on('close', () => {
    clearInterval(iv);
    res.end();
  });
}
