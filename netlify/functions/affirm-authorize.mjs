// netlify/functions/affirm-authorize.mjs
// API v2: crea el charge desde checkout_token y (opcional) captura el pago

// Detecta producción (acepta "prod" o "production"), también si viene de Vite
const envRaw = String(process.env.AFFIRM_ENV || process.env.VITE_AFFIRM_ENV || "").toLowerCase();
const isProd = envRaw === "prod" || envRaw === "production";
const BASE = isProd
  ? "https://api.affirm.com/api/v2"
  : "https://api.sandbox.affirm.com/api/v2"; // sandbox correcto

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

// Por defecto capturamos (podés override con body.capture)
const CAPTURE_DEFAULT = true;

// ⬇️ ESTA es la exportación que Netlify necesita en ESM
export async function handler(event) {
  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: corsHeaders, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body || "{}");

    // 🔎 Diagnóstico rápido (no llama a Affirm)
    if (body && body.diag === true) {
      const diag = {
        envRaw: envRaw || null,
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
      return json(200, { ok: true, diag });
    }

    const {
      checkout_token,
      order_id,
      amount_cents,          // total en centavos (entero)
      shipping_carrier,      // opcional
      shipping_confirmation, // opcional
      capture,               // override de captura (true/false)
    } = body;

    if (!checkout_token || !order_id) {
      return json(400, { error: "Missing checkout_token or order_id" });
    }

    // Llaves (dos variantes por si cambian los nombres en Netlify)
    const PUB  = process.env.AFFIRM_PUBLIC_API_KEY  || process.env.AFFIRM_PUBLIC_KEY  || "";
    const PRIV = process.env.AFFIRM_PRIVATE_API_KEY || process.env.AFFIRM_PRIVATE_KEY || "";

    if (!PUB || !PRIV) {
      return json(500, { error: "Missing AFFIRM keys" });
    }

    // Auth correcto: usuario = PUBLIC, password = PRIVATE
    const AUTH = "Basic " + Buffer.from(`${PUB}:${PRIV}`).toString("base64");

    // 1) Autorizar (crear charge desde checkout_token)
    const authRes = await fetch(`${BASE}/charges`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: AUTH },
      body: JSON.stringify({ checkout_token }),
    });
    const charge = await tryJson(authRes);
    console.log("[charges]", { env: isProd ? "prod" : "sandbox", status: authRes.status, resp: safe(charge) });
    if (!authRes.ok) return json(authRes.status, { step: "charges", error: charge });

    // 2) Capturar si corresponde
    const shouldCapture = typeof capture === "boolean" ? capture : CAPTURE_DEFAULT;
    let captureResp = null;
    if (shouldCapture) {
      if (typeof amount_cents !== "number") {
        return json(400, { error: "amount_cents required for capture=true" });
      }
      const capRes = await fetch(`${BASE}/charges/${encodeURIComponent(charge.id)}/capture`, {
        method: "POST",
        headers: { Authorization: AUTH, "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id,
          amount: amount_cents, // centavos
          shipping_carrier,
          shipping_confirmation,
        }),
      });
      captureResp = await tryJson(capRes);
      console.log("[capture]", { status: capRes.status, resp: safe(captureResp) });
      if (!capRes.ok) return json(capRes.status, { step: "capture", error: captureResp });
    }

    return json(200, { ok: true, charge, capture: captureResp });
  } catch (e) {
    console.error("[affirm-authorize] error", e);
    return json(500, { error: "server_error" });
  }
}

/* ---------------- Helpers ---------------- */
async function tryJson(res) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { raw: text }; }
}
function json(statusCode, obj) {
  return {
    statusCode,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    body: JSON.stringify(obj),
  };
}
