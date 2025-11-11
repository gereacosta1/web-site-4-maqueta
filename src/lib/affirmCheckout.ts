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
  phone?: string; // E.164 (+1XXXXXXXXXX) — opcional
  address?: {
    line1?: string;
    city?: string;
    state?: string;   // "FL"
    zip?: string;     // "33131"
    country?: string; // "US"
  };
};

const toCents = (usd = 0) => Math.round((usd || 0) * 100);

// Validadores mínimos
const isUSState  = (v?: string) => !!v && /^[A-Z]{2}$/.test(v.toUpperCase());
const isUSZip    = (v?: string) => !!v && /^\d{5}(-\d{4})?$/.test(v);
const isPhoneE164US = (v?: string) => !!v && /^\+1[2-9]\d{9}$/.test(v);
const isCountryUS   = (v?: string) => (v || '').toUpperCase() === 'US';

function safeCustomer(c?: Customer) {
  // Dirección USPS válida para facturación (no shipping). Podés cambiarla por la de tu negocio si querés.
  const fallbackAddr = {
    line1:  '100 S Biscayne Blvd',
    city:   'Miami',
    state:  'FL',
    zipcode:'33131',
    country:'US',
  };
  const a = c?.address || {};
  return {
    first:  (c?.firstName || 'Online').trim(),
    last:   (c?.lastName  || 'Customer').trim(),
    email:  (c?.email     || 'orders@onewaymotor.com').trim(),
    phone:  isPhoneE164US(c?.phone) ? c!.phone! : undefined,
    address:{
      line1:  (a.line1   || fallbackAddr.line1).trim(),
      city:   (a.city    || fallbackAddr.city).trim(),
      state:   isUSState(a.state)   ? a.state!.trim()   : fallbackAddr.state,
      zipcode: isUSZip(a.zip)       ? a.zip!.trim()     : fallbackAddr.zipcode,
      country: isCountryUS(a.country)? a.country!.trim(): fallbackAddr.country,
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

  const shippingC = toCents(totals.shippingUSD ?? 0);
  const taxC      = toCents(totals.taxUSD ?? 0);
  const subtotalC = mapped.reduce((acc, it) => acc + it.unit_price * it.qty, 0);
  const totalC    = subtotalC + shippingC + taxC;

  // Enviamos SIEMPRE billing (mínimo requerido) y NO enviamos shipping si no tenés datos reales.
  const u = safeCustomer(customer);

  const payload: any = {
    merchant: {
      user_confirmation_url: merchantBase + '/affirm/confirm.html',
      user_cancel_url:       merchantBase + '/affirm/cancel.html',
      user_confirmation_url_action: 'GET',
      name: 'ONE WAY MOTORS',
    },
    billing: {
      name: { first: u.first, last: u.last },
      address: {
        line1:  u.address.line1,
        city:   u.address.city,
        state:  u.address.state,
        zipcode:u.address.zipcode,
        country:u.address.country,
      },
    },
    // NO mandamos shipping por defecto para evitar validación USPS estricta
    items: mapped,
    currency: 'USD',
    shipping_amount: shippingC,
    tax_amount: taxC,
    total: totalC,
    metadata: { mode: 'modal' },
    // Si querés, podés adjuntar email/phone a nivel shipping más adelante
  };

  // Si más adelante recibís datos reales completos y QUERÉS enviar shipping, podés agregarlos acá.
  return payload;
}
