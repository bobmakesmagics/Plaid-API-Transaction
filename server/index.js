const express = require('express');
const app = express();
const PORT = 4090;

const {
  createLinkToken,
  exchangePublicToken,
  getTransactions,
} = require('./controllers/controller');
app.use(express.json());
// Get the public token and exchange it for an access token
app.post('/api/create_link_token', createLinkToken);
app.post('/api/exchange_public_token', exchangePublicToken);
// Get Transactions
app.get('/api/transactions', getTransactions);

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
