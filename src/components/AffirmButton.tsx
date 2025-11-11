// src/components/AffirmButton.tsx
import { useEffect, useState, type ReactNode } from "react";
import { loadAffirm } from "../lib/affirm";

/* ---------------- Tipos ---------------- */
type CartItem = {
  name: string;
  sku?: string | number;
  price: number; // USD
  qty: number;
  url?: string;
  image?: string;
};

type Customer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: {
    line1: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
};

type Props = {
  cartItems?: CartItem[];
  totalUSD?: number;
  shippingUSD?: number;
  taxUSD?: number;
  /** Si tenés datos reales del cliente, pasalos acá */
  customer?: Partial<Customer>;
};

const MIN_TOTAL_CENTS = 5000; // $50 mínimo Affirm
const toCents = (usd = 0) => Math.round((Number(usd) || 0) * 100);
const isFiniteNumber = (n: unknown): n is number =>
  typeof n === "number" && Number.isFinite(n);

/* ---------- Normalizador teléfono E.164 (US) ---------- */
function toE164US(input: string): string {
  const digits = String(input || "").replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return ""; // inválido
}

function isUSState(v: string) {
  return /^[A-Z]{2}$/.test((v || '').toUpperCase());
}
function isUSZip(v: string) {
  return /^\d{5}(-\d{4})?$/.test(v || '');
}
function hasFullAddress(c?: Customer) {
  if (!c) return false;
  const a = c.address || ({} as Customer['address']);
  return Boolean(
    c.firstName && c.lastName &&
    a.line1 && a.city && isUSState(a.state) && isUSZip(a.zip) &&
    (a.country || '').toUpperCase() === 'USA'
  );
}


/* ---------------- Toast simple ---------------- */
function Toast({
  show,
  type,
  message,
  onClose,
}: {
  show: boolean;
  type: "success" | "error" | "info";
  message: string;
  onClose: () => void;
}) {
  if (!show) return null;
  const base =
    "fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-4 py-3 rounded-xl shadow-2xl border text-sm font-semibold";
  const palette =
    type === "success"
      ? "bg-green-600/95 text-white border-green-400"
      : type === "error"
      ? "bg-red-600/95 text-white border-red-400"
      : "bg-black/90 text-white border-white/20";
  return (
    <div className={`${base} ${palette}`} role="status" onClick={onClose}>
      {message}
    </div>
  );
}

/* ---------------- Modal simple ---------------- */
function NiceModal({
  open,
  title,
  children,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[95%] max-w-md p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-black text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">✕</button>
        </div>
        <div className="text-gray-700 mb-6">{children}</div>
        <div className="flex items-center justify-end gap-3">
          {secondaryLabel ? (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {secondaryLabel}
            </button>
          ) : null}
          {primaryLabel ? (
            <button
              onClick={onPrimary}
              className="px-4 py-2 rounded-lg bg-black text-white font-bold hover:bg-gray-900"
            >
              {primaryLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function AffirmButton({
  cartItems,
  totalUSD,
  shippingUSD = 0,
  taxUSD = 0,
  customer,
}: Props) {
  const PUBLIC_KEY = (import.meta.env.VITE_AFFIRM_PUBLIC_KEY || "").trim();
  const [ready, setReady] = useState(false);
  const [opening, setOpening] = useState(false);

  // UI helpers
  const [toast, setToast] = useState<{ show: boolean; type: "success" | "error" | "info"; message: string; }>({ show: false, type: "info", message: "" });
  const showToast = (type: "success" | "error" | "info", message: string, ms = 2500) => {
    setToast({ show: true, type, message });
    window.setTimeout(() => setToast((s) => ({ ...s, show: false })), ms);
  };

  const [modal, setModal] = useState<{ open: boolean; title: string; body: string; retry?: boolean; }>({ open: false, title: "", body: "", retry: false });

  useEffect(() => {
    if (!PUBLIC_KEY) {
      console.error("Falta VITE_AFFIRM_PUBLIC_KEY");
      return;
    }
    loadAffirm(PUBLIC_KEY).then(() => setReady(true)).catch(console.error);
  }, []);

  // Normaliza items → payload Affirm
  const items = (cartItems || []).map((it, idx) => ({
    display_name: (it.name || `Item ${idx + 1}`).toString().slice(0, 120),
    sku: String(it.sku ?? `SKU-${idx + 1}`).slice(0, 64),
    unit_price: toCents(it.price),
    qty: Math.max(1, Number(it.qty) || 1),
    item_url: it.url || window.location.href,
    image_url: it.image,
  }));

  const shippingCents = toCents(shippingUSD);
  const taxCents = toCents(taxUSD);
  const sumItems = items.reduce((acc, it) => acc + it.unit_price * it.qty, 0);
  const totalCentsProp = isFiniteNumber(totalUSD) ? toCents(totalUSD!) : NaN;
  const totalCents = isFiniteNumber(totalCentsProp) ? totalCentsProp : sumItems + shippingCents + taxCents;

  const canPay = ready && items.length > 0 && isFiniteNumber(totalCents) && totalCents >= MIN_TOTAL_CENTS;

  // Cliente “fallback” (válido) si no tenés datos reales todavía
  const fallbackCustomer: Customer = {
  firstName: customer?.firstName || '',
  lastName:  customer?.lastName  || '',
  email:     customer?.email     || '',
  phone:     customer?.phone     || '',
  address: {
    line1:  customer?.address?.line1  || '',
    city:   customer?.address?.city   || '',
    state:  (customer?.address?.state || '').toUpperCase(),
    zip:    customer?.address?.zip    || '',
    country:(customer?.address?.country|| '').toUpperCase(),
  },
};

  const handleClick = () => {
    const affirm = (window as any).affirm;
    if (!affirm?.checkout) {
      console.error("Affirm no está listo");
      return;
    }
    if (!items.length) {
      showToast("error", "Agregá productos al carrito.");
      return;
    }
    if (!isFiniteNumber(totalCents) || totalCents < MIN_TOTAL_CENTS) {
      setModal({ open: true, title: "Importe no disponible para financiación", body: "El total es demasiado bajo para Affirm.", retry: false });
      return;
    }

   // si hay teléfono, lo normalizamos; si no, dejamos que Affirm lo pida
const phoneE164 = fallbackCustomer.phone ? toE164US(fallbackCustomer.phone) : "";

// Helpers de validación rápida
const isUSState = (v: string) => /^[A-Z]{2}$/.test((v || "").toUpperCase());
const isUSZip   = (v: string) => /^\d{5}(-\d{4})?$/.test(v || "");
const hasFullAddress = (() => {
  const a = fallbackCustomer.address || ({} as typeof fallbackCustomer.address);
  return Boolean(
    fallbackCustomer.firstName &&
    fallbackCustomer.lastName &&
    a?.line1 && a?.city && isUSState(a?.state) && isUSZip(a?.zip) &&
    (a?.country || "").toUpperCase() === "USA"
  );
})();

const orderId = "ORDER-" + Date.now();
const base = window.location.origin.replace("http://", "https://");

// Construimos shipping/billing sólo si la dirección pasa validación
const shipping = hasFullAddress
  ? {
      name: { first: fallbackCustomer.firstName, last: fallbackCustomer.lastName },
      address: {
        line1:  fallbackCustomer.address.line1,
        city:   fallbackCustomer.address.city,
        state:  fallbackCustomer.address.state,
        zipcode:fallbackCustomer.address.zip,
        country:fallbackCustomer.address.country,
      },
      ...(fallbackCustomer.email ? { email: fallbackCustomer.email } : {}),
      ...(phoneE164 ? { phone_number: phoneE164 } : {}), // opcional
    }
  : undefined;

const billing = hasFullAddress
  ? {
      name: { first: fallbackCustomer.firstName, last: fallbackCustomer.lastName },
      address: {
        line1:  fallbackCustomer.address.line1,
        city:   fallbackCustomer.address.city,
        state:  fallbackCustomer.address.state,
        zipcode:fallbackCustomer.address.zip,
        country:fallbackCustomer.address.country,
      },
    }
  : undefined;

// ✅ Payload: incluye shipping/billing solo si son válidos
const checkout: any = {
  merchant: {
    user_confirmation_url: `${base}/affirm/confirm.html`,
    user_cancel_url: `${base}/affirm/cancel.html`,
    user_confirmation_url_action: "GET",
    name: "ONE WAY MOTORS",
  },
  ...(shipping ? { shipping } : {}),
  ...(billing ? { billing } : {}),
  items,
  currency: "USD",
  shipping_amount: shippingCents,
  tax_amount: taxCents,
  total: totalCents, // Affirm puede calcularlo, pero lo enviamos igual
  order_id: orderId,
  metadata: { mode: "modal" },
};

// Log útil:
console.log("addr_valid:", hasFullAddress, "phone_e164:", phoneE164 || "(omitted)");



    // Logs de verificación
    console.group("[Affirm][VERIFY]");
    console.log("public_key:", (window as any)._affirm_config?.public_api_key);
    console.log("confirm:", checkout.merchant.user_confirmation_url);
    console.log("cancel:", checkout.merchant.user_cancel_url);
    console.table(items.map((it: any) => ({ name: it.display_name, sku: it.sku, cents: it.unit_price, qty: it.qty })));
    console.log("shipping_cents:", shippingCents, "tax_cents:", taxCents, "TOTAL cents:", totalCents);
    console.log("phone_e164:", phoneE164 || "(omitted)");
    console.groupEnd();

    setOpening(true);
    try {
      affirm.checkout(checkout);
      affirm.checkout.open({
        onSuccess: async ({ checkout_token }: { checkout_token: string }) => {
          try {
            const r = await fetch("/.netlify/functions/affirm-authorize", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ checkout_token, order_id: orderId, amount_cents: totalCents, capture: true }),
            });
            const data = await r.json();
            console.log("affirm-authorize →", data);
            showToast("success", "¡Solicitud enviada con éxito!");
          } catch (e) {
            console.warn("Falló confirmación en server:", e);
            setModal({ open: true, title: "No pudimos confirmar tu solicitud", body: "Tuvimos un problema al confirmar con nuestro servidor.", retry: true });
          } finally {
            setOpening(false);
          }
        },
        onFail: () => {
          setOpening(false);
          setModal({ open: true, title: "No se completó la financiación", body: "Podés intentarlo de nuevo.", retry: true });
        },
        onValidationError: (err: any) => {
          console.warn("onValidationError", err);
          setOpening(false);
          setModal({ open: true, title: "Datos inválidos", body: "Revisá nombre y dirección del comprador.", retry: false });
        },
        onClose: () => {
          setOpening(false);
          setModal({ open: true, title: "Proceso cancelado", body: "No se realizó ningún cargo. ¿Querés intentarlo de nuevo?", retry: true });
        },
      });
    } catch (e) {
      console.error("Error al abrir Affirm:", e);
      setOpening(false);
      showToast("error", "No se pudo abrir Affirm. Intentá nuevamente.");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={opening || !canPay}
        className="h-9 px-3 text-sm rounded-md font-semibold bg-black text-white border border-white/20 shadow hover:bg-neutral-900 transition disabled:opacity-60 w-auto"
      >
        {opening ? "Abriendo…" : "Pay with Affirm"}
      </button>

      <Toast show={toast.show} type={toast.type} message={toast.message} onClose={() => setToast((s) => ({ ...s, show: false }))} />

      <NiceModal
        open={modal.open}
        title={modal.title}
        onClose={() => setModal({ open: false, title: "", body: "" })}
        secondaryLabel="Cerrar"
        primaryLabel={modal.retry ? "Reintentar" : undefined}
        onPrimary={modal.retry ? handleClick : undefined}
      >
        {modal.body}
      </NiceModal>
    </>
  );
}
