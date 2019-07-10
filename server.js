const http = require('http');
const fs = require('fs');
const path = require('path');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css'
  // '.json': 'application/json',
  // '.png': 'image/png',
  // '.jpg': 'image/jpg',
  // '.gif': 'image/gif',
  // '.wav': 'audio/wav',
  // '.mp4': 'video/mp4',
  // '.woff': 'application/font-woff',
  // '.ttf': 'application/font-ttf',
  // '.eot': 'application/vnd.ms-fontobject',
  // '.otf': 'application/font-otf',
  // '.svg': 'application/image/svg+xml',
  // '.wasm': 'application/wasm'
};

const ASSET_PATH = './client/'
const PORT = 3000 || 5000;

function handleRequest (request, response) {
  console.log('request ', request.url);

  let requestUrl = request.url;
  if (requestUrl === '/') {
    requestUrl = '/index.html';
  }

  const filePath = ASSET_PATH + requestUrl;

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  function onFileRead(error, content) {
    if (error) {
      response.writeHead(500);
      response.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
      console.error(error);
      return;
    }

    response.writeHead(200, { 'Content-Type': contentType });
    response.end(content, 'utf-8');
  }

  fs.readFile(filePath, onFileRead);
};

http.createServer(handleRequest).listen(PORT);
console.log('Server running at ' + PORT);