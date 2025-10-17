import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';

const app = express();
const stripe = new Stripe('sk_live_your_secret_key_here'); // Replace with your actual Stripe secret key

app.use(express.json());
app.use(cors());

app.post('/create-session', async (req, res) => {
  const { size } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: 'price_XXXXXXXXXXXXXX', // Replace with your actual Stripe price ID for the T-shirt
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: 'https://yourwebsite.com/success',
      cancel_url: 'https://yourwebsite.com/cancel',
      metadata: { size },
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('✅ Server running on port 3000'));
