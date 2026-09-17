'use strict';

const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const { createServer } = require('./server');

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

test('GET / serves the acceptance page and form', async () => {
  const response = await fetch(baseUrl + '/');
  const body = await response.text();

  assert.equal(response.status, 200);
  assert.match(body, /<h1>Theo acceptance demo<\/h1>/);
  assert.match(body, /<form id="double-form">/);
});

test('GET /health identifies Theo', async () => {
  const response = await fetch(baseUrl + '/health');

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, employee: 'Theo' });
});

test('GET /double doubles a finite number', async () => {
  const response = await fetch(baseUrl + '/double?n=3');

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { value: 6 });
});

for (const [name, query] of [
  ['missing', ''],
  ['empty', '?n='],
  ['nonnumeric', '?n=hello'],
  ['non-finite', '?n=Infinity'],
]) {
  test(`GET /double rejects ${name} n`, async () => {
    const response = await fetch(baseUrl + '/double' + query);

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: 'n must be a finite number' });
  });
}
