import fetch from 'node-fetch';

const BASE = 'http://localhost:5173';
const ROUTES = [
  '/login',
  '/home',
  '/calendar',
  '/appointments',
  '/history',
  '/waiting-room-issues',
  '/settings',
  '/privacy-policy',
  '/admin/calendars',
  '/admin/professional-calendar',
  '/admin/assign-user',
  '/admin/appointments',
  '/admin/users',
];

async function check(route) {
  const url = `${BASE}${route}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${route} → ${res.status} ${res.statusText}`);
  }
  console.log(`🟢 ${route} OK`);
}

(async () => {
  for (const route of ROUTES) {
    await check(route);
  }
  // server.close();
  process.exit(0);
})().catch(err => {
  console.error('🚫 Healthcheck failed:', err);
  process.exit(1);
});