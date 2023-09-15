import { useCallback, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';

const Link = ({ linkToken }) => {
  const [transactions, setTransactions] = useState([]);
  const onSuccess = useCallback(async (public_token, metadata) => {
    const response = await fetch('/api/exchange_public_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_token,
        institution: metadata.institution?.institution_id,
        accounts: metadata.accounts,
      }),
    }).then((response) => response.json());
    const { public_token_exchange, access_token } = response;
    if (public_token_exchange === 'complete' && access_token) {
      localStorage.setItem('access_token', access_token);
    }
  }, []);
  const config = {
    token: linkToken,
    // receivedRedirectUri: window.location.href,
    onSuccess,
  };

  console.log(transactions);

  const handleClick = async () => {
    const access_token = localStorage.getItem('access_token');
    const response = await fetch(
      '/api/transactions?access_token=' + access_token
    ).then((response) => response.json());
    setTransactions(response.transactions);
  };

  const { open, ready } = usePlaidLink(config);

  return (
    <div>
      <button onClick={open} disabled={!ready}>
        Open Link and connect your bank!
      </button>
      <div>
        <button onClick={handleClick}>Get Transactions</button>
      </div>
    </div>
  );
};
export default Link;
