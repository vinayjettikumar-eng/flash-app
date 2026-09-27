const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg'
};

// Request handler for both local server and Vercel serverless functions
function requestHandler(req, res) {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/' || reqPath === '') reqPath = '/index.html';

  const filePath = path.join(__dirname, reqPath);

  fs.readFile(filePath, (err, content) => {
    if (err) {
      // Fallback to index.html for SPA-style routing
      const indexPath = path.join(__dirname, 'index.html');
      fs.readFile(indexPath, (indexErr, indexContent) => {
        if (indexErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('File Not Found');
          return;
        }
        res.writeHead(200, {
          'Content-Type': 'text/html',
          'Access-Control-Allow-Origin': '*'
        });
        res.end(indexContent);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    res.end(content);
  });
}

// Only listen on port if executed directly (e.g., node server.js locally)
if (require.main === module) {
  let PORT = parseInt(process.env.PORT || '5173', 10);
  const server = http.createServer(requestHandler);

  function startServer(portToTry) {
    server.listen(portToTry, () => {
      console.log(`\n===========================================`);
      console.log(`🎉 Flash Prank Web Server is LIVE!`);
      console.log(`👉 Open: http://localhost:${portToTry}`);
      console.log(`===========================================\n`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️ Port ${portToTry} is in use, trying port ${portToTry + 1}...`);
        startServer(portToTry + 1);
      } else {
        console.error('Server error:', err);
      }
    });
  }

  startServer(PORT);
}

// Export handler so Vercel can run it as a serverless function without crashing!
module.exports = requestHandler;
