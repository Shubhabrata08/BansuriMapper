const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const directory = process.env.BANSURI_PREVIEW_DIR || 'dist';
if (!['dist', 'dist-pages'].includes(directory)) throw new Error('Preview only serves an exported website directory.');
const root = path.resolve(__dirname, '..', directory);
const basePath = process.env.BANSURI_PREVIEW_BASE_PATH || '';
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.woff': 'font/woff', '.woff2': 'font/woff2' };
http.createServer((request, response) => {
  let file;
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (basePath && pathname === basePath) { response.writeHead(301, { Location: basePath + '/' }).end(); return; }
    if (basePath && !pathname.startsWith(basePath + '/')) { response.writeHead(404).end(); return; }
    file = path.resolve(root, '.' + pathname.slice(basePath.length));
    if (file !== root && !file.startsWith(root + path.sep)) { response.writeHead(403).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    else if (!path.extname(file) && fs.existsSync(file + '.html')) file += '.html';
  } catch { response.writeHead(400).end(); return; }
  fs.readFile(file, (error, data) => {
    if (error) { response.writeHead(404).end(); return; }
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    response.end(data);
  });
}).listen(4173, '127.0.0.1', () => console.log(`Preview ready at http://127.0.0.1:4173${basePath}/`));
