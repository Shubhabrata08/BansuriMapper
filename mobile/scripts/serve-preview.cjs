const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', 'dist');
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.ttf': 'font/ttf' };
http.createServer((request, response) => {
  let file;
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    file = path.resolve(root, '.' + pathname);
    if (file !== root && !file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
    if (file === root || !path.extname(file)) file = path.join(root, 'index.html');
  } catch { response.writeHead(400).end(); return; }
  fs.readFile(file, (error, data) => {
    if (error) { response.writeHead(404).end(); return; }
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    response.end(data);
  });
}).listen(4173, '127.0.0.1', () => console.log('Preview ready at http://127.0.0.1:4173'));
