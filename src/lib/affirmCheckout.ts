// src/lib/affirmCheckout.ts
export type CartItem = {
  id: string | number;
  title: string;
  price: number;      // USD
  qty: number;
  image?: string;     // /img/xxx.jpg
  url?: string;       // /product/xxx
};

export type Totals = {
  subtotalUSD: number;
  shippingUSD?: number;
  taxUSD?: number;
};

export type Customer = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string; // E.164 (+1XXXXXXXXXX) — sólo si es válido
  address?: {
    line1?: string;
    city?: string;
    state?: string;   // "FL"
    zip?: string;     // "33101"
    country?: string; // "US" (no "USA")
  };
};

const toCents = (usd = 0) => Math.round((usd || 0) * 100);

// Validadores mínimos
const isUSState  = (v?: string) => !!v && /^[A-Z]{2}$/.test(v.toUpperCase());
const isUSZip    = (v?: string) => !!v && /^\d{5}(-\d{4})?$/.test(v);
const isPhoneE164US = (v?: string) => !!v && /^\+1[2-9]\d{9}$/.test(v);
const isCountryUS   = (v?: string) => (v || '').toUpperCase() === 'US';

function hasFullAddress(c?: Customer) {
  const a = c?.address || {};
  return Boolean(
    c?.firstName && c?.lastName &&
    a.line1 && a.city && isUSState(a.state) && isUSZip(a.zip) && isCountryUS(a.country)
  );
}

export function buildAffirmCheckout(
  items: CartItem[],
  totals: Totals,
  customer?: Customer,
  merchantBase = window.location.origin
) {
  const mapped = items.map((p, idx) => ({
    display_name: (p.title || `Item ${idx + 1}`).toString().slice(0, 120),
    sku: String(p.id),
    unit_price: toCents(p.price),
    qty: Math.max(1, Number(p.qty) || 1),
    item_url: (p.url?.startsWith('http') ? p.url : merchantBase + (p.url || '/')),
    image_url: p.image ? (p.image.startsWith('http') ? p.image : merchantBase + p.image) : undefined,
  }));

  const shippingC = toCents(totals.shippingUSD ?? 0);
  const taxC      = toCents(totals.taxUSD ?? 0);
  const subtotalC = mapped.reduce((acc, it) => acc + it.unit_price * it.qty, 0);
  const totalC    = subtotalC + shippingC + taxC;

  // Incluir direcciones SOLO si son reales y válidas.
  const includeAddr = hasFullAddress(customer);

  const payload: any = {
    merchant: {
      user_confirmation_url: merchantBase + '/affirm/confirm.html',
      user_cancel_url:       merchantBase + '/affirm/cancel.html',
      user_confirmation_url_action: 'GET',
      name: 'ONE WAY MOTORS',
    },
    items: mapped,
    currency: 'USD',
    shipping_amount: shippingC,
    tax_amount: taxC,
    total: totalC,
    metadata: { mode: 'modal' },
  };

  if (includeAddr) {
    const a = customer!.address!;
    const name = { first: customer!.firstName!, last: customer!.lastName! };
    const addr = { line1: a.line1!, city: a.city!, state: a.state!, zipcode: a.zip!, country: a.country! };

    payload.shipping = {
      name,
      address: addr,
      ...(customer?.email ? { email: customer!.email } : {}),
      ...(isPhoneE164US(customer?.phone) ? { phone_number: customer!.phone } : {}),
    };
    payload.billing = { name, address: addr };
  }
  // Si no hay dirección válida, NO enviamos shipping/billing → Affirm la pide en el modal.

  return payload;
}
