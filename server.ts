import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

interface SessionData {
  config: any;
  lastUpdated: number;
}

const app = express();
const PORT = 3000;

// Enable CORS for all incoming connections (including OBS Studio Browser Source CEF)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '15mb' }));

// In-memory session store & SSE client registry
const sessions = new Map<string, SessionData>();
const sseClients = new Map<string, Set<express.Response>>();

function sanitizeCode(rawCode: string): string {
  if (!rawCode) return 'DEFAULT';
  return rawCode.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 32) || 'DEFAULT';
}

function broadcastToSession(code: string, data: any, excludeRes?: express.Response) {
  const clients = sseClients.get(code);
  if (!clients || clients.size === 0) return;

  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    if (client !== excludeRes) {
      try {
        client.write(payload);
      } catch (err) {
        console.error('Error broadcasting to client:', err);
      }
    }
  }
}

// 1. Health check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 2. GET current session configuration
app.get('/api/session/:code', (req, res) => {
  const code = sanitizeCode(req.params.code);
  const session = sessions.get(code);

  res.json({
    success: true,
    code,
    config: session ? session.config : null,
    lastUpdated: session ? session.lastUpdated : 0,
    activeSubscribers: sseClients.get(code)?.size || 0,
  });
});

// 3. POST / update session configuration
app.post('/api/session/:code', (req, res) => {
  const code = sanitizeCode(req.params.code);
  const { config } = req.body;

  if (!config) {
    return res.status(400).json({ success: false, error: 'Config payload is required' });
  }

  const now = Date.now();
  sessions.set(code, {
    config,
    lastUpdated: now,
  });

  // Broadcast updated configuration to all listening OBS & Operator windows in this room
  broadcastToSession(code, {
    type: 'sync',
    code,
    config,
    timestamp: now,
  });

  res.json({
    success: true,
    code,
    timestamp: now,
    activeSubscribers: sseClients.get(code)?.size || 0,
  });
});

// 4. GET Server-Sent Events (SSE) Stream for real-time instant push
app.get('/api/session/:code/events', (req, res) => {
  const code = sanitizeCode(req.params.code);

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  // Register client
  if (!sseClients.has(code)) {
    sseClients.set(code, new Set());
  }
  const clientSet = sseClients.get(code)!;
  clientSet.add(res);

  // Send initial handshake + current room configuration if exists
  const currentSession = sessions.get(code);
  res.write(
    `data: ${JSON.stringify({
      type: 'connected',
      code,
      config: currentSession?.config || null,
      timestamp: currentSession?.lastUpdated || Date.now(),
      subscribers: clientSet.size,
    })}\n\n`
  );

  // Keep-alive heartbeat every 15 seconds to prevent proxy / cloud timeout
  const pingInterval = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      clearInterval(pingInterval);
    }
  }, 15000);

  // Clean up on disconnect
  req.on('close', () => {
    clearInterval(pingInterval);
    clientSet.delete(res);
    if (clientSet.size === 0) {
      sseClients.delete(code);
    }
  });
});

async function startServer() {
  // Vite dev middleware vs static production files
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Campus Ministry OBS Overlay Server running on port ${PORT}`);
  });
}

startServer();
