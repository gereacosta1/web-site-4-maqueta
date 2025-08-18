// netlify/functions/affirm-authorize.js

// Detecta ambiente para pegarle al endpoint correcto de Affirm
const env = (process.env.AFFIRM_ENV || 'sandbox').toLowerCase() === 'prod' ? 'prod' : 'sandbox';
const base = env === 'prod' ? 'https://api.affirm.com' : 'https://sandbox.affirm.com';

// CORS básico
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Helpers de logging (seguros)
function logStart(ctx, data) {
  const reqId = ctx?.requestId || 'local';
  console.log(`[affirm-authorize][${reqId}] START env=${env} base=${base}`);
  if (data) {
    console.log(`[affirm-authorize][${reqId}] BODY RECIBIDO:`, safeJson(data));
  }
}
function logStep(ctx, step, payload) {
  const reqId = ctx?.requestId || 'local';
  console.log(`[affirm-authorize][${reqId}] ${step}:`, safeJson(payload));
}
function logEnd(ctx, status, payload) {
  const reqId = ctx?.requestId || 'local';
  console.log(`[affirm-authorize][${reqId}] END status=${status}`, safeJson(payload));
}
function safeJson(obj) {
  try {
    // Evita loguear objetos gigantes y normaliza
    return JSON.stringify(obj, null, 2).slice(0, 5000);
  } catch {
    return '[unserializable]';
  }
}

export async function handler(event, context) {
  // Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: 'OK' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: 'Method Not Allowed' };
  }

     // 🚀 Producción: CAPTURAR (cobra realmente)
     const capture = true;


  try {
    const body = JSON.parse(event.body || '{}');

    // Logs de inicio
    logStart(context, {
      // Solo datos mínimos (no sensibles):
      order_id: body?.order_id,
      checkout_token_len: typeof body?.checkout_token === 'string' ? body.checkout_token.length : null,
      amount_cents: body?.amount_cents,
      capture_flag_in_body: body?.capture,
      capture_flag_server: capture,
    });

    const {
      checkout_token,
      order_id,
      amount_cents,
      shipping_carrier,
      shipping_confirmation,
    } = body;

    if (!checkout_token || !order_id) {
      const resp = { error: 'Missing checkout_token or order_id' };
      logEnd(context, 400, resp);
      return {
        statusCode: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(resp),
      };
    }

    const pub = process.env.AFFIRM_PUBLIC_KEY;
    const priv = process.env.AFFIRM_PRIVATE_KEY;
    if (!pub || !priv) {
      const resp = { error: 'Missing AFFIRM keys' };
      logEnd(context, 500, resp);
      return {
        statusCode: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(resp),
      };
    }

    const auth = Buffer.from(`${pub}:${priv}`).toString('base64');

    // 1) Autorizar
    logStep(context, 'FETCH authorize → /api/v1/transactions', {
      transaction_id_preview: checkout_token?.slice(0, 6) + '…',
      order_id,
    });

    const authRes = await fetch(`${base}/api/v1/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({ transaction_id: checkout_token, order_id }),
    });

    const authorize = await authRes.json().catch(() => ({}));
    logStep(context, 'authorize response (raw)', { status: authRes.status, body: authorize });

    if (!authRes.ok) {
      const resp = { step: 'authorize', error: authorize };
      logEnd(context, authRes.status, resp);
      return {
        statusCode: authRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(resp),
      };
    }

    // 2) (opcional) Capturar (DESACTIVADO en QA)
    let captureResult = null;
    if (capture) {
      if (typeof amount_cents !== 'number') {
        const resp = { error: 'amount_cents is required when capture=true' };
        logEnd(context, 400, resp);
        return {
          statusCode: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify(resp),
        };
      }

      const txId = authorize.id;
      logStep(context, 'FETCH capture → /capture', {
        txId_preview: String(txId).slice(0, 8) + '…',
        order_id,
        amount_cents,
        shipping_carrier,
        shipping_confirmation,
      });

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

      captureResult = await capRes.json().catch(() => ({}));
      logStep(context, 'capture response (raw)', { status: capRes.status, body: captureResult });

      if (!capRes.ok) {
        const resp = { step: 'capture', authorize, error: captureResult };
        logEnd(context, capRes.status, resp);
        return {
          statusCode: capRes.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify(resp),
        };
      }
    } else {
      logStep(context, 'capture SKIPPED', { reason: 'QA mode (capture=false)' });
    }

    const resp = { authorize, capture: captureResult };
    logEnd(context, 200, resp);
    return {
      statusCode: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(resp),
    };
  } catch (e) {
    const resp = { error: e?.message || 'Unknown error' };
    logEnd(context, 500, resp);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify(resp),
    };
  }
}
