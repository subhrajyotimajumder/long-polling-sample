'use strict';

const http = require('http');
const url = require('url');
const nodeStatic = require('node-static');
const uuidv1 = require('uuid/v1');

const fileServer = new nodeStatic.Server('.');
const port = 3000;
const subscribers = Object.create(null);

http.createServer(accept).listen(port);
console.log(`Server running on port ${ port }`);

function onSubscribe(req, res) {
  const id = uuidv1();
  res.setHeader('Content-Type', 'text/plain;charset=utf-8');
  res.setHeader("Cache-Control", "no-cache, must-revalidate");
  subscribers[id] = res;
  req.on('close', () => delete subscribers[id]);
}

/**
 * Publishes the message to all subscribers.
 * @param {string} message
 * @returns {undefined}
 */
function publish(message) {
  for (const id in subscribers) {
    subscribers[id].end(message); // End of response.
  }
}

/**
 * Accepts a new http requests.
 * @param {Request} req
 * @param {Response} res
 * @returns {undefined}
 */
function accept(req, res) {
  let urlParsed = url.parse(req.url, true);

  // A new client would like to subscribe.
  if (urlParsed.pathname === '/subscribe') {
    onSubscribe(req, res);
    return;
  }

  // Sending the message.
  if (urlParsed.pathname === '/publish' && req.method === 'POST') {
    // Accept POST.
    req.setEncoding('utf8');
    let message = '';

    req
    .on('data', chunk => {
      message += chunk;
    })
    .on('end', () => {
      publish(message); // Publish for all clients.
      res.end('ok');
    });
  }

  // Rest of requests serve static files from current directory.
  fileServer.serve(req, res);
}
