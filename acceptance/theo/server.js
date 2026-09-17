'use strict';

const http = require('node:http');

const page = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" href="data:,">
    <title>Theo acceptance demo</title>
  </head>
  <body>
    <main>
      <h1>Theo acceptance demo</h1>
      <form id="double-form">
        <label for="number">Number to double</label>
        <input id="number" name="n" inputmode="decimal" required>
        <button type="submit">Double</button>
      </form>
      <p id="result" role="status">Enter a number.</p>
    </main>
    <script>
      const form = document.querySelector('#double-form');
      const result = document.querySelector('#result');

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const n = new FormData(form).get('n');
        const response = await fetch('/double?n=' + encodeURIComponent(n));
        const body = await response.json();
        result.textContent = response.ok ? 'Result: ' + body.value : 'Error: ' + body.error;
      });
    </script>
  </body>
</html>`;

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

function createServer() {
  return http.createServer((request, response) => {
    const url = new URL(request.url, 'http://localhost');

    if (request.method === 'GET' && url.pathname === '/') {
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      response.end(page);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/health') {
      sendJson(response, 200, { ok: true, employee: 'Theo' });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/double') {
      const input = url.searchParams.get('n');
      const value = input === null || input.trim() === '' ? Number.NaN : Number(input);

      if (!Number.isFinite(value)) {
        sendJson(response, 400, { error: 'n must be a finite number' });
        return;
      }

      sendJson(response, 200, { value: value * 2 });
      return;
    }

    sendJson(response, 404, { error: 'not found' });
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  createServer().listen(port, '127.0.0.1', () => {
    console.log(`Theo acceptance demo listening on http://127.0.0.1:${port}`);
  });
}

module.exports = { createServer };
