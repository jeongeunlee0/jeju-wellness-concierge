import http from 'node:http';
import { createServer, loadEnv } from 'vite';

Object.assign(process.env, loadEnv('development', process.cwd(), ''));
const handlers = Object.fromEntries(await Promise.all(['hello', 'tour', 'weather', 'heritage', 'agent'].map(async name => [name, (await import(`../api/${name}.js`)).default])));
const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (!url.pathname.startsWith('/api/')) return vite.middlewares(req, res);
  res.status = code => { res.statusCode = code; return res; };
  res.json = data => { res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(data)); };
  const handler = handlers[url.pathname.slice(5)];
  if (!handler) return res.status(404).json({ error: 'API not found' });
  req.query = Object.fromEntries(url.searchParams);
  try {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
      if (body.length > 32000) return res.status(413).json({ error: '요청이 너무 큽니다.' });
    }
    req.body = body ? JSON.parse(body) : undefined;
    await handler(req, res);
  } catch { res.status(400).json({ error: '요청을 처리하지 못했습니다.' }); }
}).listen(5173, '127.0.0.1', () => console.log('JEJU WELLNESS: http://127.0.0.1:5173 (UI + API)'));
