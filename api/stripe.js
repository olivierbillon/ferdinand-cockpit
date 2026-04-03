// api/stripe.js — Vercel Serverless Function
// Lit les transactions Stripe en lecture seule
// La clé STRIPE_RESTRICTED_KEY est stockée dans les variables d'environnement Vercel

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const key = process.env.STRIPE_RESTRICTED_KEY;
  if (!key) return res.status(500).json({ error: 'Stripe key not configured' });

  const { type = 'charges', limit = 100, starting_after } = req.query;

  try {
    let url;
    if (type === 'charges') {
      url = `https://api.stripe.com/v1/charges?limit=${limit}${starting_after ? '&starting_after=' + starting_after : ''}`;
    } else if (type === 'payment_intents') {
      url = `https://api.stripe.com/v1/payment_intents?limit=${limit}${starting_after ? '&starting_after=' + starting_after : ''}`;
    } else {
      return res.status(400).json({ error: 'Type invalide' });
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${key}`,
        'Stripe-Version': '2024-04-10',
      }
    });

    const data = await response.json();
    return res.status(response.status).json(data);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
