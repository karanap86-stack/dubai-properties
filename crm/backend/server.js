// CRM backend server
const app = require('./app');
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`CRM backend running on port ${PORT}`));
