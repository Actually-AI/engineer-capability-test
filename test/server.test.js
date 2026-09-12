import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'

import { createApp } from '../server.js'

let baseUrl
let server

before(async () => {
  server = createApp()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const { port } = server.address()
  baseUrl = `http://127.0.0.1:${port}`
})

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve())
  })
})

test('GET / returns the demo HTML', async () => {
  const response = await fetch(`${baseUrl}/`)

  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type'), /^text\/html/)
  assert.match(await response.text(), /Hello from AI Actually/)
})

test('GET /health returns the health JSON', async () => {
  const response = await fetch(`${baseUrl}/health`)

  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type'), /^application\/json/)
  assert.deepEqual(await response.json(), { ok: true })
})
