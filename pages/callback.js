import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Callback() {
  const router = useRouter();
  const [status, setStatus] = useState('verifying'); // verifying | success | failed | error
  const [details, setDetails] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!router.isReady) return;

    const { reference, trxref } = router.query;
    const ref = reference || trxref;

    if (!ref) {
      setStatus('error');
      setMessage('No transaction reference was found.');
      return;
    }

    fetch(`/api/verify?reference=${encodeURIComponent(ref)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status && data.data && data.data.status === 'success') {
          setStatus('success');
          setDetails(data.data);
        } else {
          setStatus('failed');
          setMessage(data.message || 'Payment was not successful.');
          setDetails(data.data || null);
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Something went wrong while verifying your payment.');
      });
  }, [router.isReady, router.query]);

  return (
    <>
      <Head>
        <title>Payment Status</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="container">
        <div className="card">
          {status === 'verifying' && (
            <>
              <div className="status-icon">⏳</div>
              <h1>Verifying Payment...</h1>
              <p className="subtitle">Please wait a moment while we confirm your transaction.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="status-icon">✅</div>
              <h1>Payment Successful</h1>
              <p className="subtitle">Thank you! Your transaction was completed.</p>
              {details && (
                <div className="details">
                  <p>
                    <span>Reference</span>
                    <span>{details.reference}</span>
                  </p>
                  <p>
                    <span>Amount</span>
                    <span>
                      {(details.amount / 100).toLocaleString()} {details.currency}
                    </span>
                  </p>
                  <p>
                    <span>Email</span>
                    <span>{details.customer?.email}</span>
                  </p>
                  <p>
                    <span>Status</span>
                    <span>{details.status}</span>
                  </p>
                </div>
              )}
            </>
          )}

          {status === 'failed' && (
            <>
              <div className="status-icon">❌</div>
              <h1>Payment Failed</h1>
              <p className="subtitle">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="status-icon">⚠️</div>
              <h1>Something Went Wrong</h1>
              <p className="subtitle">{message}</p>
            </>
          )}

          <a className="back-link" href="/">
            ← Back to Home
          </a>
        </div>
      </div>
    </>
  );
}
