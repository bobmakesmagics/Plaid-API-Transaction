const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
var moment = require('moment');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

var ACCESS_TOKEN = null;
var ITEM_ID = null;

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET_KEY,
    },
  },
});

const client = new PlaidApi(configuration);

const createLinkToken = async (req, res) => {
  // Get the client_user_id by searching for the current user
  // const user = await User.find(...);
  // const clientUserId = user.id;
  const user = 'demoUser';
  const clientUserId = '12345';
  const request = {
    user: {
      client_user_id: clientUserId,
    },
    client_name: 'Plaid Test App',
    products: ['transactions'],
    language: 'en',
    country_codes: ['US'],
  };
  try {
    const createTokenResponse = await client.linkTokenCreate(request);
    res.json(createTokenResponse.data);
  } catch (error) {
    console.log(error);
  }
};

const exchangePublicToken = async (req, res, next) => {
  const publicToken = req.body.public_token;

  try {
    const response = await client.itemPublicTokenExchange({
      public_token: publicToken,
    });

    ACCESS_TOKEN = response.data.access_token;
    ITEM_ID = response.data.item_id;
    res.json({
      public_token_exchange: 'complete',
      access_token: response.data.access_token,
    });
  } catch (error) {
    console.log(error);
  }
};

const getTransactions = async (req, res) => {
  const { access_token } = req.query;
  let startDate = moment().subtract(30, 'days').format('YYYY-MM-DD');
  let endDate = moment().format('YYYY-MM-DD');

  const request = {
    access_token: access_token,
    start_date: startDate,
    end_date: endDate,
    options: {
      include_personal_finance_category: true,
    },
  };
  try {
    const response = await client.transactionsGet(request);
    let transactions = response.data.transactions;
    const total_transactions = response.data.total_transactions;

    while (transactions.length < total_transactions) {
      const paginatedRequest = {
        access_token: access_token,
        start_date: startDate,
        end_date: endDate,
        options: {
          offset: transactions.length,
          include_personal_finance_category: true,
        },
      };
      const paginatedResponse = await client.transactionsGet(paginatedRequest);
      transactions = transactions.concat(paginatedResponse.data.transactions);
    }
    res.json({ transactions });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  createLinkToken,
  exchangePublicToken,
  getTransactions,
};
