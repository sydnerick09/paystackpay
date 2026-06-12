// Verifies a Paystack transaction by reference.

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ status: false, message: 'Method not allowed' });
  }

  const { reference } = req.query;

  if (!reference) {
    return res.status(400).json({ status: false, message: 'Transaction reference is required.' });
  }

  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({
      status: false,
      message: 'Server is missing PAYSTACK_SECRET_KEY. Set it in your environment variables.',
    });
  }

  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
      }
    );

    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (err) {
    return res.status(500).json({
      status: false,
      message: 'Failed to reach Paystack. Please try again shortly.',
      error: err.message,
    });
  }
}
