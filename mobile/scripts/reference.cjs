const { execFileSync } = require('node:child_process');
const { mkdirSync } = require('node:fs');
const path = require('node:path');

const destination = path.join(__dirname, '..', '.test-data');
mkdirSync(destination, { recursive: true });
execFileSync(process.execPath, [
  path.join(__dirname, '..', '..', 'Tests', 'reference.cjs'),
  path.join(__dirname, '..', '..', 'Tests', 'Reference.html'),
  path.join(destination, 'reference.json'),
], { stdio: 'inherit' });
