const http = require('http');
const net = require('net');

const PROXY_PORT = 8081;
const BACKEND_PORT = 5000;
const EXPO_PORT = 19006;

console.log('Starting CityTasks Proxy Server...');

const server = http.createServer((req, res) => {
  const isApiRequest = req.url.startsWith('/api');
  const targetPort = isApiRequest ? BACKEND_PORT : EXPO_PORT;
  
  const options = {
    hostname: 'localhost',
    port: targetPort,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      host: `localhost:${targetPort}`
    }
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error(`Proxy error for ${req.url}:`, err.message);
    if (!res.headersSent) {
      res.writeHead(502);
      res.end(`Proxy Error: ${err.message}`);
    }
  });

  req.pipe(proxyReq);
});

// WebSocket proxy using raw TCP sockets (no ws library needed)
server.on('upgrade', (req, socket, head) => {
  const targetSocket = net.connect(EXPO_PORT, 'localhost', () => {
    // Forward the upgrade request
    const upgradeReq = `${req.method} ${req.url} HTTP/1.1\r\n` +
      Object.entries(req.headers)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\r\n') +
      '\r\n\r\n';
    
    targetSocket.write(upgradeReq);
    if (head && head.length) {
      targetSocket.write(head);
    }
    
    // Pipe data bidirectionally
    socket.pipe(targetSocket);
    targetSocket.pipe(socket);
  });
  
  targetSocket.on('error', (err) => {
    console.error('WebSocket proxy error:', err.message);
    socket.end();
  });
  
  socket.on('error', (err) => {
    console.error('Client socket error:', err.message);
    targetSocket.end();
  });
});

server.listen(PROXY_PORT, '0.0.0.0', () => {
  console.log(`Proxy running on http://0.0.0.0:${PROXY_PORT}`);
  console.log(`  /api/* -> localhost:${BACKEND_PORT} (Backend)`);
  console.log(`  /* -> localhost:${EXPO_PORT} (Expo)`);
});
