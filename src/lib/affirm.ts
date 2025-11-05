// src/lib/affirm.ts
declare global {
  interface Window {
    _affirm_config?: any;
    affirm?: any;
  }
}

/** Devuelve la CDN correcta para Affirm según env ('prod' o 'sandbox') */
function getAffirmCdn(env: 'prod' | 'sandbox') {
  return env === 'prod'
    ? 'https://cdn1.affirm.com/js/v2/affirm.js'
    : 'https://cdn1-sandbox.affirm.com/js/v2/affirm.js';
}

/**
 * Carga Affirm con entorno FORZADO por VITE_AFFIRM_ENV (prod|sandbox).
 * Si VITE_AFFIRM_ENV no está, por defecto usamos **prod**.
 * Además limpia cualquier script previo de affirm que no coincida con el elegido.
 */
export function loadAffirm(publicKey: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (!publicKey) {
      console.error('[Affirm] Falta VITE_AFFIRM_PUBLIC_KEY');
      resolve();
      return;
    }

    // ⚠️ Forzamos a usar VITE_AFFIRM_ENV si existe, y si no, PROD por defecto
    const raw = (import.meta as any)?.env?.VITE_AFFIRM_ENV ?? 'prod';
    const env = String(raw).toLowerCase() === 'sandbox' ? 'sandbox' : 'prod';
    const scriptUrl = getAffirmCdn(env);

    // Limpia scripts previos de Affirm si no coinciden
    const existing = document.querySelectorAll<HTMLScriptElement>('script[src*="affirm.com/js/v2/affirm.js"]');
    existing.forEach(s => {
      if (s.src !== scriptUrl) s.remove();
    });
    // reset del objeto affirm si vino de otro script
    if ((window as any).affirm && (window as any)._affirm_config?.script !== scriptUrl) {
      (window as any).affirm = undefined;
    }

    // Si ya está correcto, resolvemos
    if (window.affirm?.ui && window._affirm_config?.script === scriptUrl) {
      try {
        window.affirm.ui.ready(() => resolve());
      } catch {
        resolve();
      }
      return;
    }

    // Configuración e inyección
    window._affirm_config = {
      public_api_key: publicKey,
      script: scriptUrl,
      locale: 'en_US',
      country_code: 'US',
    };

    console.log('[Affirm] env:', env, 'cdn:', scriptUrl, 'pk:', publicKey?.slice(0, 6) + '…');

   const s = document.createElement('script');
    s.async = true;
    s.src = scriptUrl;
    s.onload = () => {
      const check = () => {
        if (window.affirm && window.affirm.ui) {
          console.log('[Affirm] SDK loaded ✓');
          window.affirm.ui.ready(() => resolve());
        } else {
          setTimeout(check, 100); // espera hasta que cargue completamente
        }
      };
      check();
    };
    s.onerror = reject;
    document.head.appendChild(s);
  });
}
