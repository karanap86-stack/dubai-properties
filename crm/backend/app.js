// Express backend entry for CRM
const express = require('express');
const app = express();
app.use(express.json());

app.get('/', (req, res) => res.send('CRM Backend API running'));

module.exports = app;
