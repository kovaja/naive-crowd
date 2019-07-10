/**
 * Code inspired by https://developer.mozilla.org/en-US/docs/Learn/Server-side/Node_server_without_framework#Example
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css'
};

const ASSET_PATH = './client/'
const PORT = process.env.PORT || 3000;

function normalizeRequestUrl(requestUrl) {
  if (requestUrl === '/') {
    return '/index.html';
  }

  return requestUrl;
}

function handleRequest (request, response) {
  const filePath = ASSET_PATH + normalizeRequestUrl(request.url);
  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = MIME_TYPES[extname] || 'application/octet-stream';

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