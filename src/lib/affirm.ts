// src/lib/affirm.ts

declare global {
  interface Window {
    _affirm_config?: {
      public_api_key: string;
      script: string;
      locale?: string;
      country_code?: string;
    };
    affirm?: any;
  }
}

/* ---------- Utils ---------- */

/** CDN según entorno */
function getAffirmCdn(env: 'prod' | 'sandbox') {
  return env === 'prod'
    ? 'https://cdn1.affirm.com/js/v2/affirm.js'
    : 'https://cdn1-sandbox.affirm.com/js/v2/affirm.js';
}

/** Quita cualquier prefijo pk_live_/pk_test_ si viniera en la env */
function sanitizePublicKey(key: string) {
  if (!key) return '';
  return key.replace(/^pk_(live|test)_/i, '');
}

/** Lee y normaliza el entorno desde VITE_AFFIRM_ENV (default prod) */
function getEnv(): 'prod' | 'sandbox' {
  const raw = (import.meta as any)?.env?.VITE_AFFIRM_ENV ?? 'prod';
  return String(raw).toLowerCase() === 'sandbox' ? 'sandbox' : 'prod';
}

/* ---------- Loader con memo ---------- */

let loadingPromise: Promise<void> | null = null;

/**
 * Carga el SDK de Affirm una sola vez y en el entorno correcto.
 * - Usa VITE_AFFIRM_ENV ('prod' | 'sandbox'), default 'prod'
 * - Limpia scripts previos si no coinciden con el entorno
 * - Evita inyección duplicada
 * - Espera affirm.ui.ready()
 */
export function loadAffirm(publicKey: string): Promise<void> {
  const cleaned = sanitizePublicKey(publicKey);

  if (!cleaned) {
    console.error('[Affirm] Falta o es inválida la PUBLIC KEY.');
    return Promise.resolve(); // no rompemos el flujo, pero no habrá Affirm operativo
  }

  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise<void>((resolve) => {
    const env = getEnv();
    const scriptUrl = getAffirmCdn(env);

    // 1) Retirar cualquier script v2 de un entorno distinto
    const all = Array.from(
      document.querySelectorAll<HTMLScriptElement>('script[src*="affirm.com/js/v2/affirm.js"]')
    );
    all.forEach((s) => {
      if (s.src !== scriptUrl) s.remove();
    });

    // 2) Config global SIEMPRE antes de cargar el script
    window._affirm_config = {
      public_api_key: 'F8TUN95FN4Q7GH2F',
      script: scriptUrl,
      locale: 'en_US',
      country_code: 'US',
    };

    // Helper para resolver cuando el SDK esté listo
    const finishWhenReady = () => {
      try {
        if (window.affirm?.ui?.ready) {
          window.affirm.ui.ready(() => resolve());
          return;
        }
        // Fallback: poll cortito
        const iv = setInterval(() => {
          if (window.affirm?.ui?.ready) {
            clearInterval(iv);
            window.affirm.ui.ready(() => resolve());
          }
        }, 100);
        // Safety timeout (2.5s)
        setTimeout(() => {
          clearInterval(iv);
          resolve();
        }, 2500);
      } catch {
        resolve();
      }
    };

    // 3) Si ya hay el script correcto y affirm existe → esperar ready
    const existing = all.find((s) => s.src === scriptUrl)
      ?? document.querySelector<HTMLScriptElement>('#affirm-sdk');

    if (existing && existing.src === scriptUrl && window.affirm) {
      finishWhenReady();
      return;
    }

    // 4) Inyectar el script correcto si no está
    let s = document.querySelector<HTMLScriptElement>('#affirm-sdk');
    if (s && s.src !== scriptUrl) {
      s.remove();
      s = null;
      (window as any).affirm = undefined; // invalidar instancia previa
    }

    if (!s) {
      s = document.createElement('script');
      s.id = 'affirm-sdk';
      s.async = true;
      s.src = scriptUrl;
      s.onload = finishWhenReady;
      s.onerror = () => {
        loadingPromise = null; // permitir reintento
        console.error('[Affirm] Error al cargar SDK:', scriptUrl);
        resolve();
      };
      document.head.appendChild(s);
    } else {
      // Ya existe el script correcto pero aún no expone affirm
      finishWhenReady();
    }
  });

  return loadingPromise;
}
