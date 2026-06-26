import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !amount) {
      setError('Please enter your email and an amount to receive reshare on WhatsApp.');
      return;
    }

    if (Number(amount) <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, amount, name }),
      });

      const data = await res.json();

      if (!res.ok || !data.status) {
        throw new Error(data.message || 'Could not start payment. Please try again.');
      }

      window.location.href = data.data.authorization_url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Make a Payment</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="container">
        <div className="card">
          <h1>Make a Payment</h1>
          <p className="subtitle">dear client pay withdraw fee you have paid USD 5 balance remaining USD 5</p>

          <form onSubmit={handleSubmit}>
            <label htmlFor="name">Full Name (optional)</label>
            <input
              id="name"
              type="text"
              placeholder="   username "
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="amount">Amount (KES)</label>
            <input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              placeholder="amount "
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            {error && <p className="error">{error}</p>}

            <button type="submit" disabled={loading}>
              {loading ? 'Redirecting to Paystack...' : 'Pay Now'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
