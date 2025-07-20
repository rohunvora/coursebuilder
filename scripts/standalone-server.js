#!/usr/bin/env node

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const path = require('path');

const dev = false;
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Configure Next.js
const app = next({ 
  dev,
  dir: __dirname,
  conf: {
    distDir: '.next',
    generateBuildId: () => 'standalone-build',
    compress: true,
    poweredByHeader: false
  }
});

const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`
🚀 Course Builder v1.2 - Standalone Server
📍 Ready on http://${hostname}:${port}
📚 Open your browser to start learning!

⚠️  Note: This is a standalone build that doesn't require npm.
    `);
  });
});