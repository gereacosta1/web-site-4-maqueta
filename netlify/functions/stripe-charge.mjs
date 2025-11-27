// netlify/functions/stripe-charge.mjs
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const { amount_cents, currency, name, description, token } = JSON.parse(event.body || "{}");

    if (!amount_cents || !token) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing data" }),
      };
    }

    const charge = await stripe.charges.create({
      amount: amount_cents,
      currency: currency || "usd",
      description: description || "Payment",
      source: token,
      metadata: { name: name || "Customer" },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, charge }),
    };

  } catch (err) {
    console.error("[stripe-charge] Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
