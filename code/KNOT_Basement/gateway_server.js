const http = require('http');
const path = require('path');
const net = require('net');
const { spawn } = require('child_process');

const GATEWAY_PORT = 3000;
const SERVICES = [
  { name: 'Student Backend', port: 5001, dir: 'Student_Portal/backend', cmd: 'npm', args: ['start'] },
  { name: 'Student Frontend', port: 5173, dir: 'Student_Portal/frontend', cmd: 'npm', args: ['run', 'dev'] },
  { name: 'Maintenance Backend', port: 5003, dir: 'maintenance_system/server', cmd: 'npm', args: ['start'] },
  { name: 'Maintenance Frontend', port: 5174, dir: 'maintenance_system/client', cmd: 'npm', args: ['run', 'dev'] }
];

const children = [];

// Helper to check if a local port is open/active
function checkPort(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    const onError = () => {
      socket.destroy();
      resolve(false);
    };
    socket.setTimeout(400);
    socket.once('error', onError);
    socket.once('timeout', onError);
    socket.connect(port, '127.0.0.1', () => {
      socket.end();
      resolve(true);
    });
  });
}

// Start all child services
function startServices() {
  console.log('\n🚀 Starting KNOT Campus Unified Services Hub...\n');
  
  for (const service of SERVICES) {
    const fullPath = path.join(__dirname, service.dir);
    console.log(`[Gateway] Spawning child process: ${service.name} in ${service.dir}...`);
    
    const child = spawn(service.cmd, service.args, {
      cwd: fullPath,
      shell: true,
      stdio: 'pipe'
    });

    child.stdout.on('data', (data) => {
      const msg = data.toString().trim();
      if (msg) console.log(`[${service.name}] ${msg}`);
    });

    child.stderr.on('data', (data) => {
      const msg = data.toString().trim();
      if (msg) console.error(`[${service.name}] [STDERR] ${msg}`);
    });

    child.on('close', (code) => {
      console.log(`[Gateway] ${service.name} child process exited with code ${code}`);
    });

    children.push(child);
  }
}

// Safe termination on exit / SIGINT
function cleanExit() {
  console.log('\n🛑 Shutting down all KNOT services and processes...');
  for (const child of children) {
    if (!child.killed) {
      try {
        child.kill('SIGINT');
      } catch (e) {
        console.error('Error killing child process:', e.message);
      }
    }
  }
  process.exit(0);
}

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);

// Start Gateway Proxy Server
const server = http.createServer((req, res) => {
  // Proxy all requests to the Student Frontend (port 5173)
  const proxyReq = http.request({
    host: 'localhost',
    port: 5173,
    path: req.url,
    method: req.method,
    headers: req.headers
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Bad Gateway: Student Portal frontend is starting or offline. Please refresh in a moment.');
  });

  req.pipe(proxyReq, { end: true });
});

server.listen(GATEWAY_PORT, () => {
  console.log(`\n======================================================`);
  console.log(`📡 Gateway Hub online at http://localhost:${GATEWAY_PORT}`);
  console.log(`======================================================\n`);
  
  // Start services after gateway server is running
  startServices();
});
