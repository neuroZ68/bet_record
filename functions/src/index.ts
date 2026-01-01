import { onRequest } from 'firebase-functions/v2/https';

export const health = onRequest((req, res) => {
  res.json({ ok: true, service: 'bet-record-functions' });
});
