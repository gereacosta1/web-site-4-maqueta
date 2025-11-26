// src/lib/cardCheckout.ts
import type { CartItem } from '../context/CartContext';

const API_URL = '/api/card-checkout';

export async function startCardCheckout(items: CartItem[]): Promise<void> {
  if (!items.length) {
    throw new Error('El carrito está vacío');
  }

  const origin = window.location.origin;

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, origin }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('[card-checkout] error body:', text);
    throw new Error('No se pudo iniciar el pago con tarjeta');
  }

  const data = await res.json();
  if (!data.url) {
    throw new Error('La respuesta de Stripe no trajo URL');
  }

  // Redirige al checkout de Stripe
  window.location.href = data.url as string;
}
