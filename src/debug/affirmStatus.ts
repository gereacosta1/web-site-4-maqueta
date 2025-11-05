// src/debug/affirmStatus.ts
export async function logAffirmStatus() {
  const page = location.origin;
  const sdk = (window as any).affirm;
  const cfg = (window as any)._affirm_config || {};
  const env = (import.meta as any)?.env || {};
  const hasVitePk = !!env.VITE_AFFIRM_PUBLIC_KEY;

  // backend diag (claves privadas y baseURL reales)
  let fn = { ok: false, baseURL: null, isProd: null, HAS_AFFIRM_PRIVATE_KEY: false };
  try {
    const r = await fetch('/.netlify/functions/affirm-authorize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diag: true })
    });
    const j = await r.json();
    if (j?.ok && j?.diag) {
      fn.ok = true;
      fn.baseURL = j.diag.baseURL;
      fn.isProd = j.diag.isProd;
      fn.HAS_AFFIRM_PRIVATE_KEY = !!j.diag.flags?.HAS_AFFIRM_PRIVATE_KEY;
    }
  } catch {}

  const out = {
    page,
    sdk: {
      env: cfg?.script?.includes('sandbox') ? 'sandbox' : 'production',
      key_starts_with: String(cfg?.public_api_key || '').slice(0, 7),
      loaded: !!(sdk && sdk.ui)
    },
    fn,
    ok:
      fn.ok === true &&
      fn.isProd === true &&
      hasVitePk === true &&
      !!cfg?.public_api_key &&
      !!(sdk && sdk.ui),
  };

  console.log(
    '%c[Affirm STATUS]',
    `padding:2px 6px;border-radius:6px;color:#fff;background:${out.ok ? '#16a34a' : '#dc2626'}`,
    out
  );
}
