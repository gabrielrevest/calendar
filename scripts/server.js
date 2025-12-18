const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');
const fs = require('fs');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Configuration de la base de données
if (!process.env.DATABASE_URL) {
  const dbPath = path.join(process.cwd(), 'prisma', 'database.db');
  process.env.DATABASE_URL = `file:${dbPath}`;
}

console.log('Database:', process.env.DATABASE_URL);
console.log('Port:', port);
console.log('Dev:', dev);
console.log('CWD:', process.cwd());

const app = next({
  dev,
  hostname,
  port,
  dir: process.cwd(),
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error:', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, hostname, (err) => {
    if (err) {
      console.error('Failed to start:', err);
      process.exit(1);
    }
    console.log(`> Ready on http://${hostname}:${port}`);
  });
}).catch((err) => {
  console.error('Failed to prepare:', err);
  process.exit(1);
});




