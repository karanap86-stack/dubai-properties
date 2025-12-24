exports.handler = async (event) => {
  try {
    const BACKEND = process.env.BACKEND_URL || process.env.VITE_BACKEND_URL || 'http://localhost:3000'
    // Expect body to be JSON. If you want to forward a specific path, send { path: '/api/export-to-sheets', body: { ... } }
    const incoming = event.body ? JSON.parse(event.body) : {}
    const targetPath = incoming.path || '/api/export-to-sheets'
    const method = incoming.method || event.httpMethod || 'POST'
    const forwardUrl = BACKEND.replace(/\/$/, '') + targetPath

    const payload = incoming.body || incoming || {}

    const resp = await fetch(forwardUrl, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: method === 'GET' ? undefined : JSON.stringify(payload),
    })

    const text = await resp.text()
    return { statusCode: resp.status, body: text }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
