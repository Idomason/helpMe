export const initializePayment = async (req, res) => {
  try {
    const { email, amount, requestId } = req.body;

    if (!email || !amount || !requestId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Missing required fields',
      });
    }

    // Initialize Paystack transaction
    const response = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: Math.round(amount * 100), // Convert to kobo
          currency: 'NGN',
          ref: `help-${Date.now()}`,
          metadata: {
            requestId,
            type: 'help_request',
          },
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || 'Failed to initialize payment with Paystack',
      );
    }

    // Return the authorization URL to the frontend
    return res.status(200).json({
      status: 'success',
      data: {
        authorizationUrl: data.data.authorization_url,
      },
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    return res.status(500).json({
      status: 'fail',
      message: 'Failed to initialize payment',
      error: error.message,
    });
  }
};
