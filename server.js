import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';

const app = express();
const stripe = new Stripe('sk_live_your_secret_key_here'); // Replace with your real Stripe secret key

app.use(express.json());
app.use(cors());

app.post('/create-session', async (req, res) => {
  const { product, size } = req.body;

  try {
    let priceCAD, priceUSD;
    let metadata = {};

    if (product === 'tshirt') {
      priceCAD = 20000; // CAD $200
      priceUSD = 14238; // USD $142.38
      metadata.size = size || '';
    } else if (product === 'mug') {
      priceCAD = 8000; // CAD $80
      priceUSD = 5696; // USD $56.96
    } else {
      return res.status(400).json({ error: 'Invalid product' });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: 'https://yourwebsite.com/success',
      cancel_url: 'https://yourwebsite.com/cancel',
      line_items: [
        {
          price_data: {
            currency: 'usd', // default, updated below
            product_data: {
              name: product === 'tshirt' ? 'Millionaire Mindset T-shirt' : 'Millionaire Mindset Mug',
            },
            unit_amount: priceUSD,
          },
          quantity: 1,
        },
      ],
      shipping_address_collection: {
        allowed_countries: ['CA', 'US'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: 'Standard Shipping (Canada/US)',
            type: 'fixed_amount',
            fixed_amount: { amount: 2500, currency: 'cad' }, // updated below
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 7 }
            }
          }
        }
      ],
      metadata,
      after_completion: {
        type: 'redirect',
        redirect: { url: 'https://yourwebsite.com/success' },
      },
    });

    // Adjust for Canada vs USA based on shipping address later
    stripe.checkout.sessions.update(session.id, {
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: 'Standard Shipping',
            type: 'fixed_amount',
            fixed_amount: { amount: 1780, currency: 'usd' },
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 7 }
            }
          }
        }
      ]
    });

    res.json({ id: session.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('✅ Server running on port 3000'));
