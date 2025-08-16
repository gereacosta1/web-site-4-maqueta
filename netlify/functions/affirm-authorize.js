// netlify/functions/affirm-authorize.js
const env = (process.env.AFFIRM_ENV || 'sandbox').toLowerCase() === 'prod' ? 'prod' : 'sandbox';
const base = env === 'prod' ? 'https://api.affirm.com' : 'https://sandbox.affirm.com'; // ← AHORA DINÁMICO

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function handler(event) {
  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: 'OK' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: 'Method Not Allowed' };
  }

  try {
    const {
      checkout_token,
      order_id,
      amount_cents,
      shipping_carrier,
      shipping_confirmation,
    } = JSON.parse(event.body || '{}');


    const capture = false;



    if (!checkout_token || !order_id) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing checkout_token or order_id' }),
      };
    }

    const pub = process.env.AFFIRM_PUBLIC_KEY;
    const priv = process.env.AFFIRM_PRIVATE_KEY;
    if (!pub || !priv) {
      return {
        statusCode: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing AFFIRM keys' }),
      };
    }

    const auth = Buffer.from(`${pub}:${priv}`).toString('base64');

    // 1) Autorizar
    const authRes = await fetch(`${base}/api/v1/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({ transaction_id: checkout_token, order_id }),
    });

    const authorize = await authRes.json();
    if (!authRes.ok) {
      return {
        statusCode: authRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'authorize', error: authorize }),
      };
    }

    // 2) (opcional) Capturar
    let captureResult = null;
    if (capture) {
      if (typeof amount_cents !== 'number') {
        return {
          statusCode: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'amount_cents is required when capture=true' }),
        };
      }
      const txId = authorize.id;
      const capRes = await fetch(`${base}/api/v1/transactions/${encodeURIComponent(txId)}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({
          order_id,
          amount: amount_cents,
          shipping_carrier,
          shipping_confirmation,
        }),
      });

      captureResult = await capRes.json();
      if (!capRes.ok) {
        return {
          statusCode: capRes.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify({ step: 'capture', authorize, error: captureResult }),
        };
      }
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorize, capture: captureResult }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: e?.message || 'Unknown error' }),
    };
  }
}
