// src/components/PayWithAffirm.tsx
import AffirmButton from './AffirmButton';
import { useCart, type CartItem as CartItemCtx } from '../context/CartContext';

/**
 * Wrapper minimal para evitar duplicar la lógica de checkout.
 * Solo transforma items del contexto al formato que espera AffirmButton.
 */
export default function PayWithAffirm() {
  const { items, totalUSD } = useCart();

  const mapped = (items as any as CartItemCtx[]).map((it, idx) => ({
    name: it.name ?? `Item ${idx + 1}`,
    sku: it.sku ?? String((it as any).id ?? idx + 1),
    price: Number(it.price) || 0,
    qty: Number(it.qty) || 1,
    url: window.location.href,
    image: (it as any).image,
  }));

  return <AffirmButton cartItems={mapped} totalUSD={totalUSD} />;
}
