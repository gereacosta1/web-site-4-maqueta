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
  phone?: string; // E.164 (+1XXXXXXXXXX) — lo enviaremos SOLO si es válido
  address?: {
    line1?: string;
    city?: string;
    state?: string;   // "FL"
    zip?: string;     // "33101"
    country?: string; // "USA"
  };
};

const toCents = (usd = 0) => Math.round((usd || 0) * 100);

// Valida E.164 US estricto (evita 000…/placeholders)
function toValidUSPhoneE164(input?: string): string | null {
  const s = (input || '').trim();
  if (!s) return null;
  // +1 y 10 dígitos, primer dígito del área 2-9
  const m = s.match(/^\+1([2-9]\d{2})(\d{7})$/);
  return m ? s : null;
}

function withDefaults(c?: Customer) {
  const a = c?.address || {};
  // NO ponemos teléfono por defecto; Affirm falla si es placeholder
  const phone = toValidUSPhoneE164(c?.phone || undefined);
  const email = (c?.email || '').trim();
  return {
    first: (c?.firstName || 'Test').trim(),
    last:  (c?.lastName  || 'Customer').trim(),
    email: email || 'demo@example.com',
    phone, // puede ser null → no se envía
    address: {
      line1:  (a.line1  || '123 Demo St').trim(),
      city:   (a.city   || 'Miami').trim(),
      state:  (a.state  || 'FL').trim(),
      zipcode:(a.zip    || '33101').trim(),
      country:(a.country|| 'USA').trim(),
    }
  };
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

  const shippingUsd = totals.shippingUSD ?? 0;
  const taxUsd = totals.taxUSD ?? 0;

  const subtotalC = mapped.reduce((acc, it) => acc + it.unit_price * it.qty, 0);
  const shippingC = toCents(shippingUsd);
  const taxC      = toCents(taxUsd);
  const totalC    = subtotalC + shippingC + taxC;

  const u = withDefaults(customer);

  return {
    merchant: {
      user_confirmation_url: merchantBase + '/affirm/confirm.html',
      user_cancel_url:       merchantBase + '/affirm/cancel.html',
      user_confirmation_url_action: 'GET',
      name: 'ONE WAY MOTORS',
    },
    shipping: {
      name: { first: u.first, last: u.last },
      address: {
        line1: u.address.line1,
        city: u.address.city,
        state: u.address.state,
        zipcode: u.address.zipcode,
        country: u.address.country,
      },
      email: u.email,
      ...(u.phone ? { phone_number: u.phone } : {}), // ← solo si es válido
    },
    billing: {
      name: { first: u.first, last: u.last },
      address: {
        line1: u.address.line1,
        city: u.address.city,
        state: u.address.state,
        zipcode: u.address.zipcode,
        country: u.address.country,
      },
    },
    items: mapped,
    currency: 'USD',
    shipping_amount: shippingC,
    tax_amount: taxC,
    total: totalC,
    metadata: { mode: 'modal' },
  };
}
