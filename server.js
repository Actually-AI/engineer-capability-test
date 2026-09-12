import { createServer } from 'node:http'

export function handleRequest(request, response) {
  if (request.method === 'GET' && request.url === '/') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    response.end('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>AI Actually</title></head><body><main><h1>Hello from AI Actually</h1></main></body></html>')
    return
  }

  if (request.method === 'GET' && request.url === '/health') {
    response.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
    response.end(JSON.stringify({ ok: true }))
    return
  }

  response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
  response.end('Not found')
}

export function createApp() {
  return createServer(handleRequest)
}

export function startServer(port = process.env.PORT || 3000) {
  const server = createApp()
  server.listen(port, () => {
    console.log(`Server listening on http://localhost:${server.address().port}`)
  })
  return server
}

if (import.meta.url === `file://${process.argv[1]}`) {
  startServer()
}
