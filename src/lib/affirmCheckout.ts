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
  firstName: string;
  lastName: string;
  email: string;
  phone: string; // 10 dígitos
  address: {
    line1: string;
    city: string;
    state: string;   // "FL"
    zip: string;     // "33101"
    country: string; // "USA"
  };
};

const toCents = (usd = 0) => Math.round((usd || 0) * 100);

export function buildAffirmCheckout(
  items: CartItem[],
  totals: Totals,
  customer: Customer,
  merchantBase: string // ej.: "https://www.onewaymotor.com"
) {
  const mapped = items.map((p) => ({
    display_name: p.title,
    sku: String(p.id),
    unit_price: toCents(p.price),
    qty: p.qty,
    item_url: merchantBase + (p.url || "/"),
    image_url: p.image ? merchantBase + p.image : undefined,
  }));

  return {
    merchant: {
      user_confirmation_url: merchantBase + "/affirm/confirm.html",
      user_cancel_url: merchantBase + "/affirm/cancel.html",
    },
    shipping: {
      name: { first: customer.firstName, last: customer.lastName },
      address: {
        line1: customer.address.line1,
        city: customer.address.city,
        state: customer.address.state,
        zipcode: customer.address.zip,
        country: customer.address.country,
      },
      email: customer.email,
      phone_number: customer.phone,
    },
    billing: {
      name: { first: customer.firstName, last: customer.lastName },
      address: {
        line1: customer.address.line1,
        city: customer.address.city,
        state: customer.address.state,
        zipcode: customer.address.zip,
        country: customer.address.country,
      },
    },
    items: mapped,
    currency: "USD",
    shipping_amount: toCents(totals.shippingUSD || 0),
    tax_amount: toCents(totals.taxUSD || 0),
    metadata: { mode: "modal" },
  };
}
