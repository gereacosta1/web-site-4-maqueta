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
  subtotalUSD: number;   // si no lo calculás, podés pasar 0 y lo calculamos
  shippingUSD?: number;
  taxUSD?: number;
};

export type Customer = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string; // E.164 preferido (+1...)
  address?: {
    line1?: string;
    city?: string;
    state?: string;   // "FL"
    zip?: string;     // "33101"
    country?: string; // "USA"
  };
};

const toCents = (usd = 0) => Math.round((usd || 0) * 100);

function withDefaults(c?: Customer) {
  const a = c?.address || {};
  return {
    first: (c?.firstName || 'Test').trim(),
    last:  (c?.lastName  || 'Customer').trim(),
    email: (c?.email     || 'demo@example.com').trim(),
    phone: (c?.phone     || '+13050000000').trim(), // opcional
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

  // Siempre mandamos shipping y billing válidos (evita missing_fields)
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
      phone_number: u.phone,
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
