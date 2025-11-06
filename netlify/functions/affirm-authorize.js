// netlify/functions/affirm-authorize.js
// API v2: crea el charge desde checkout_token y (opcional) captura el pago

// Detecta producción (acepta "prod" o "production")
const envVar = String(process.env.AFFIRM_ENV || "").toLowerCase();
const isProd = envVar === "prod" || envVar === "production";
const BASE = isProd
  ? "https://api.affirm.com/api/v2"
  : "https://api.sandbox.affirm.com/api/v2"; // <- FIX sandbox domain

// CORS básico
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Logging seguro (recorta)
const safe = (o) => {
  try { return JSON.stringify(o, null, 2).slice(0, 4000); }
  catch { return "[unserializable]"; }
};

// Por defecto capturamos en prod/sandbox (puedes cambiarlo)
const CAPTURE_DEFAULT = true;

exports.handler = async (event) => {
  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    // 🔎 MODO DIAGNÓSTICO (no llama a Affirm)
    if (body && body.diag === true) {
      const diag = {
        host: event.headers?.host || null,
        envVar: envVar || null,
        isProd,
        baseURL: BASE,
        nodeVersion: process.versions?.node,
        flags: {
          HAS_AFFIRM_PUBLIC_KEY:
            Boolean(process.env.AFFIRM_PUBLIC_API_KEY || process.env.AFFIRM_PUBLIC_KEY),
          HAS_AFFIRM_PRIVATE_KEY:
            Boolean(process.env.AFFIRM_PRIVATE_API_KEY || process.env.AFFIRM_PRIVATE_KEY),
          HAS_VITE_AFFIRM_PUBLIC_KEY: Boolean(process.env.VITE_AFFIRM_PUBLIC_KEY),
        },
      };
      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ ok: true, diag }),
      };
    }

    const {
      checkout_token,
      order_id,
      amount_cents,          // total en centavos (entero)
      shipping_carrier,      // opcional
      shipping_confirmation, // opcional
      capture,               // opcional: override de captura
    } = body;

    if (!checkout_token || !order_id) {
      return resp(400, { error: "Missing checkout_token or order_id" });
    }

    // Lee ambas variantes por si las guardaste con *_API_KEY
    const PUB  = process.env.AFFIRM_PUBLIC_API_KEY  || process.env.AFFIRM_PUBLIC_KEY  || "";
    const PRIV = process.env.AFFIRM_PRIVATE_API_KEY || process.env.AFFIRM_PRIVATE_KEY || "";

    if (!PUB || !PRIV) {
      return resp(500, { error: "Missing AFFIRM keys" });
    }

    // Auth correcto: usuario = PUBLIC, password = PRIVATE
    const AUTH = "Basic " + Buffer.from(`${PUB}:${PRIV}`).toString("base64");

    // 1) Autorizar: crear el charge a partir del checkout_token
    const authRes = await fetch(`${BASE}/charges`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: AUTH },
      body: JSON.stringify({ checkout_token }),
    });

    const charge = await tryJson(authRes);
    console.log("[charges]", { env: isProd ? "prod" : "sandbox", status: authRes.status, resp: safe(charge) });

    if (!authRes.ok) {
      return resp(authRes.status, { step: "charges", error: charge });
    }

    // 2) Capturar (si aplica)
    const shouldCapture = typeof capture === "boolean" ? capture : CAPTURE_DEFAULT;
    let captureResp = null;

    if (shouldCapture) {
      if (typeof amount_cents !== "number") {
        return resp(400, { error: "amount_cents required for capture=true" });
      }

      const capRes = await fetch(`${BASE}/charges/${encodeURIComponent(charge.id)}/capture`, {
        method: "POST",
        headers: { Authorization: AUTH, "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id,
          amount: amount_cents, // centavos (entero)
          shipping_carrier,
          shipping_confirmation,
        }),
      });

      captureResp = await tryJson(capRes);
      console.log("[capture]", { status: capRes.status, resp: safe(captureResp) });

      if (!capRes.ok) {
        return resp(capRes.status, { step: "capture", error: captureResp });
      }
    }

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true, charge, capture: captureResp }),
    };
  } catch (e) {
    console.error("[affirm-authorize] error", e);
    return resp(500, { error: "server_error" });
  }
};

// Helpers
async function tryJson(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { raw: text }; }
}
function resp(statusCode, obj) {
  return {
    statusCode,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    body: JSON.stringify(obj),
  };
}
