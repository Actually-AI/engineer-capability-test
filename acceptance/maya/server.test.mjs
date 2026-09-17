import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';

import { createServer } from './server.mjs';

let baseUrl;
let server;

before(async () => {
  server = createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test('serves the acceptance page', async () => {
  const response = await fetch(baseUrl + '/');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^text\/html/);
  assert.match(await response.text(), /<h1>Maya acceptance demo<\/h1>/);
});

test('reports Maya health', async () => {
  const response = await fetch(baseUrl + '/health');
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, employee: 'Maya' });
});

test('doubles a finite number', async () => {
  const response = await fetch(baseUrl + '/double?n=3');
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { value: 6 });
});

for (const query of ['', '?n=', '?n=hello', '?n=Infinity', '?n=NaN']) {
  test(`rejects invalid input ${query || '(missing)'}`, async () => {
    const response = await fetch(baseUrl + '/double' + query);
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: 'n must be a finite number' });
  });
}
