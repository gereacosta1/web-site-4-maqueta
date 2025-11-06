// src/lib/affirm.ts
declare global {
  interface Window {
    _affirm_config?: any;
    affirm?: any;
  }
}

/* ---------------- Utils ---------------- */
function getAffirmCdn(env: 'prod' | 'sandbox') {
  return env === 'prod'
    ? 'https://cdn1.affirm.com/js/v2/affirm.js'
    : 'https://cdn1-sandbox.affirm.com/js/v2/affirm.js';
}

// Reutilizamos una única promesa para evitar cargas duplicadas
let loadingPromise: Promise<void> | null = null;

/**
 * Carga el SDK de Affirm una sola vez y en el entorno correcto.
 * - Respeta VITE_AFFIRM_ENV ('prod' | 'sandbox'), default: 'prod'
 * - Limpia scripts previos si no coinciden con el entorno elegido
 * - No inyecta dos veces (idempotente)
 * - Resuelve cuando affirm.ui.ready() dispara (o cuando affirm ya está listo)
 */
export function loadAffirm(publicKey: string): Promise<void> {
  if (!publicKey) {
    console.error('[Affirm] Falta VITE_AFFIRM_PUBLIC_KEY');
    // Resolvemos para no romper flujos que esperan la promesa
    return Promise.resolve();
  }

  // Si ya estamos cargando/cargado, devolvemos la misma promesa
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise<void>((resolve) => {
    const raw = (import.meta as any)?.env?.VITE_AFFIRM_ENV ?? 'prod';
    const env: 'prod' | 'sandbox' = 'prod';
      String(raw).toLowerCase() === 'sandbox' ? 'sandbox' : 'prod';
    const scriptUrl = getAffirmCdn(env);

    // 1) Limpiar scripts previos que no coincidan
    const existingScripts = Array.from(
      document.querySelectorAll<HTMLScriptElement>('script[src*="affirm.com/js/v2/affirm.js"]'),
    );
    existingScripts.forEach((s) => {
      if (s.src !== scriptUrl) s.remove();
    });

    // 2) Si ya hay affirm con el script correcto, solo esperar ready()
    const alreadyRightScript = existingScripts.find((s) => s.src === scriptUrl);
    const hasRightConfig = window._affirm_config?.script === scriptUrl;

    const finishWhenReady = () => {
      try {
        if (window.affirm?.ui?.ready) {
          window.affirm.ui.ready(() => resolve());
        } else {
          // fallback por si affirm.ui tarda en montarse
          const t = setInterval(() => {
            if (window.affirm?.ui?.ready) {
              clearInterval(t);
              window.affirm.ui.ready(() => resolve());
            }
          }, 100);
          // safety timeout (2.5s). Si en ese tiempo no expone ui.ready, resolvemos igual.
          setTimeout(() => {
            clearInterval(t);
            resolve();
          }, 2500);
        }
      } catch {
        resolve();
      }
    };

    // 3) Configuración global
    window._affirm_config = {
      public_api_key: 'pk_live_F8TUN95FN4Q7GH2F',
      script: scriptUrl,
      locale: 'en_US',       // usa 'en_US' estable; el modal puede mostrar spans/labels propios
      country_code: 'US',
    };

    // 4) Si ya existe el script correcto y affirm está presente → esperar ready
    if (alreadyRightScript && window.affirm) {
      finishWhenReady();
      return;
    }

    // 5) Inyectar script si no está el correcto
    let s = document.querySelector<HTMLScriptElement>('#affirm-sdk');
    if (s && s.src !== scriptUrl) {
      // si existe pero con src distinto, lo reemplazamos
      s.remove();
      s = null;
      // invalidamos objeto affirm previo que pudo quedar enlazado al otro script
      (window as any).affirm = undefined;
    }

    if (!s) {
      s = document.createElement('script');
      s.id = 'affirm-sdk';
      s.async = true;
      s.src = scriptUrl;
      s.onload = () => {
        // Aseguramos config correcta antes de ready()
        if (!hasRightConfig) {
          window._affirm_config = {
            public_api_key: publicKey,
            script: scriptUrl,
            locale: 'en_US',
            country_code: 'US',
          };
        }
        finishWhenReady();
      };
      s.onerror = () => {
        // Si falla la carga, “liberamos” la promesa para permitir reintentos
        loadingPromise = null;
        console.error('[Affirm] Error al cargar el SDK:', scriptUrl);
        // Aún así resolvemos para no romper la app; el botón debería manejar falta de SDK
        resolve();
      };
      document.head.appendChild(s);
    } else {
      // Ya está el script correcto en DOM, esperamos ready
      finishWhenReady();
    }
  });

  return loadingPromise;
}
