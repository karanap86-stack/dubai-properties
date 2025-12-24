// server.js - simple wrapper to start the example backend
require('dotenv').config()
const path = require('path')
const backendPath = path.join(__dirname, 'BACKEND_EXAMPLE.js')
try {
  require(backendPath)
  console.log('Started BACKEND_EXAMPLE via server.js')
} catch (e) {
  console.error('Failed to start backend:', e.message)
  process.exit(1)
}
