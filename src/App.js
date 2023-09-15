import React, { useState, useEffect } from 'react';
import Link from './components/Link';
import './App.css';

function App() {
  const [linkToken, setLinkToken] = useState(null);

  const generateToken = async () => {
    const response = await fetch('/api/create_link_token', {
      method: 'POST',
    });
    const data = await response.json();
    setLinkToken(data.link_token);
  };

  useEffect(() => {
    generateToken();
  }, []);

  return (
    <div className="App">
      {linkToken != null ? <Link linkToken={linkToken} /> : <></>}
    </div>
  );
}

export default App;
