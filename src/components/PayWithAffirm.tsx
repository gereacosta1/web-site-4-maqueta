import { useState } from 'react';
import { loadAffirm } from '../lib/affirm';
import { useCart, type CartItem } from '../context/CartContext';

type Customer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;          // solo números, 10–15 dígitos
  address1: string;
  city: string;
  state: string;          // 2 letras: FL, CA, NY, etc.
  zip: string;            // 5 dígitos
  country?: string;       // por defecto US
};

const toCents = (n: number) => Math.round(n * 100);

export default function PayWithAffirm() {
  const { items, totalUSD, clear } = useCart();
  const [busy, setBusy] = useState(false);

  // ⚠️ Form simple para enviar datos reales (evita “John Doe”)
  const [c, setC] = useState<Customer>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  });

  const onChange = (k: keyof Customer) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setC(s => ({ ...s, [k]: e.target.value }));

  const hasMinTotal = toCents(totalUSD) >= 5000; // Affirm suele requerir ≥ $50

  async function handlePay() {
    try {
      setBusy(true);

      // 1) Cargar Affirm (prod) con la PK de prod
      await loadAffirm(import.meta.env.VITE_AFFIRM_PUBLIC_KEY);

      // 2) Mapear items → formato Affirm
      const lineItems = items.map((it: CartItem) => ({
        display_name: it.name,
        sku: it.sku ?? String(it.id),
        unit_price_cents: toCents(it.price),
        qty: it.qty,
        item_url: window.location.origin + '/',              // opcional
        image_url: it.image ? window.location.origin + it.image : undefined,
      }));

      const total_cents = toCents(totalUSD);
      const order_id = 'ONEWAY-' + Date.now();

      // 3) CheckoutData con identidad real (shipping/billing)
      const checkoutData = {
        merchant: {
          user_confirmation_url: `${location.origin}/confirm.html`,
          user_cancel_url: `${location.origin}/cancel.html`,
        },
        items: lineItems,
        shipping: {
          name: { first: c.firstName, last: c.lastName },
          address: {
            line1: c.address1, city: c.city, state: c.state, zipcode: c.zip, country: c.country || 'US',
          },
          email: c.email,
          phone_number: c.phone,
        },
        billing: {
          name: { first: c.firstName, last: c.lastName },
          address: {
            line1: c.address1, city: c.city, state: c.state, zipcode: c.zip, country: c.country || 'US',
          },
          email: c.email,
          phone_number: c.phone,
        },
        // Totales (opcional; Affirm los valida contra items)
        order_id,
        metadata: { source: 'onewaymotor.com' }
      };

      // 4) Abrir modal de Affirm → obtener checkout_token
      await new Promise<void>((resolve, reject) => {
        window.affirm.checkout(checkoutData);
        window.affirm.checkout.open({
          onFail: (err: any) => reject(err),
          onCancel: () => reject(new Error('cancelled')),
          onSuccess: async (data: any) => {
            try {
              // 5) Autorizar y capturar desde la función (usa claves PRIVADAS)
              const res = await fetch('/.netlify/functions/affirm-authorize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  checkout_token: data.checkout_token,
                  order_id,
                  amount_cents: total_cents,
                }),
              });
              const json = await res.json();
              if (!res.ok) return reject(json);
              console.log('[Affirm][AUTH/CAPTURE]', json);
              resolve();
            } catch (e) {
              reject(e);
            }
          },
        });
      });

      // 6) Limpia carrito y redirige a confirmación
      clear();
      location.href = '/confirm.html';
    } catch (e: any) {
      console.error('[Affirm] error', e);
      alert('There was a problem completing your payment. Please try again or contact us.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Form compacto para identidad real */}
      <div className="grid grid-cols-2 gap-2">
        <input className="border rounded px-3 py-2" placeholder="First name" value={c.firstName} onChange={onChange('firstName')} />
        <input className="border rounded px-3 py-2" placeholder="Last name"  value={c.lastName}  onChange={onChange('lastName')} />
        <input className="border rounded px-3 py-2 col-span-2" placeholder="Email" value={c.email} onChange={onChange('email')} />
        <input className="border rounded px-3 py-2 col-span-2" placeholder="Phone (10–15 digits)" value={c.phone} onChange={onChange('phone')} />
        <input className="border rounded px-3 py-2 col-span-2" placeholder="Address" value={c.address1} onChange={onChange('address1')} />
        <input className="border rounded px-3 py-2" placeholder="City" value={c.city} onChange={onChange('city')} />
        <input className="border rounded px-3 py-2" placeholder="State (e.g. FL)" value={c.state} onChange={onChange('state')} />
        <input className="border rounded px-3 py-2" placeholder="ZIP" value={c.zip} onChange={onChange('zip')} />
        <input className="border rounded px-3 py-2" placeholder="Country (US)" value={c.country} onChange={onChange('country')} />
      </div>

      <button
        disabled={busy || !hasMinTotal}
        onClick={handlePay}
        className={`w-full border rounded px-4 py-3 ${busy || !hasMinTotal ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-100'}`}
      >
        {busy ? 'Processing…' : 'Pay with Affirm'}
      </button>
      {!hasMinTotal && (
        <p className="text-sm text-gray-500 mt-1">Minimum order is $50 to pay with Affirm.</p>
      )}
    </div>
  );
}
