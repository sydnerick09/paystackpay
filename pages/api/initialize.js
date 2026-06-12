// Initializes a Paystack transaction and returns an authorization_url
// that the user is redirected to in order to complete payment.

function getBaseUrl(req) {
  const proto = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ status: false, message: 'Method not allowed' });
  }

  const { email, amount, name } = req.body || {};

  if (!email || !amount) {
    return res.status(400).json({ status: false, message: 'Email and amount are required.' });
  }

  const numericAmount = Number(amount);
  if (Number.isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({ status: false, message: 'Amount must be a positive number.' });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({
      status: false,
      message: 'Server is missing PAYSTACK_SECRET_KEY. Set it in your environment variables.',
    });
  }

  const currency = process.env.PAYSTACK_CURRENCY || 'KES';

  // Paystack expects amounts in the smallest currency unit (e.g. cents/kobo)
  const amountInSubunit = Math.round(numericAmount * 100);

  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amountInSubunit,
        currency,
        callback_url: `${getBaseUrl(req)}/callback`,
        metadata: {
          custom_fields: [
            {
              display_name: 'Full Name',
              variable_name: 'full_name',
              value: name || 'N/A',
            },
          ],
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: 'Failed to reach Paystack. Please try again shortly.',
      error: err.message,
    });
  }
}
