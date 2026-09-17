import http from 'node:http';
import { pathToFileURL } from 'node:url';

const page = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Maya acceptance demo</title>
  <link rel="icon" href="data:,">
  <style>
    body { font: 1rem/1.5 system-ui, sans-serif; margin: 3rem auto; max-width: 34rem; padding: 0 1rem; }
    form { display: flex; align-items: end; gap: 0.75rem; flex-wrap: wrap; }
    label { display: grid; gap: 0.25rem; }
    input, button { font: inherit; padding: 0.5rem; }
    #result { min-height: 1.5rem; }
  </style>
</head>
<body>
  <main>
    <h1>Maya acceptance demo</h1>
    <form id="double-form">
      <label for="number">Number to double
        <input id="number" name="n" inputmode="decimal" required>
      </label>
      <button type="submit">Double number</button>
    </form>
    <p id="result" role="status" aria-live="polite"></p>
  </main>
  <script>
    const form = document.querySelector('#double-form');
    const result = document.querySelector('#result');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      result.textContent = 'Calculating…';
      try {
        const response = await fetch('/double?n=' + encodeURIComponent(form.elements.n.value));
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || 'Request failed');
        result.textContent = 'Result: ' + body.value;
      } catch (error) {
        result.textContent = 'Error: ' + error.message;
      }
    });
  </script>
</body>
</html>`;

function sendJson(response, status, body) {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

export function createServer() {
  return http.createServer((request, response) => {
    const url = new URL(request.url, 'http://localhost');

    if (request.method === 'GET' && url.pathname === '/') {
      response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      response.end(page);
      return;
    }

    if (request.method === 'GET' && url.pathname === '/health') {
      sendJson(response, 200, { ok: true, employee: 'Maya' });
      return;
    }

    if (request.method === 'GET' && url.pathname === '/double') {
      const rawNumber = url.searchParams.get('n');
      const value = rawNumber === null || rawNumber.trim() === '' ? NaN : Number(rawNumber);
      if (!Number.isFinite(value)) {
        sendJson(response, 400, { error: 'n must be a finite number' });
        return;
      }
      sendJson(response, 200, { value: value * 2 });
      return;
    }

    sendJson(response, 404, { error: 'Not found' });
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT || 3000);
  createServer().listen(port, '127.0.0.1', () => {
    console.log(`Maya acceptance demo listening on http://127.0.0.1:${port}`);
  });
}
