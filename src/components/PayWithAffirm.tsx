// src/components/PayWithAffirm.tsx
import AffirmButton from "./AffirmButton";
import { useCart, type CartItem as CartItemCtx } from "../context/CartContext";

export default function PayWithAffirm() {
  const { items, totalUSD } = useCart();

  const mapped = (items as CartItemCtx[]).map((it, idx) => ({
    name: it.name ?? `Item ${idx + 1}`,
    sku: it.sku ?? String((it as any).id ?? idx + 1),
    price: Number(it.price) || 0,
    qty: Number(it.qty) || 1,
    url: (it as any).url || window.location.pathname,
    image: (it as any).image,
  }));

  // Si ya tenés datos del comprador, podes pasarlos acá:
  const customer = undefined; // o { firstName, lastName, email, phone, address: { ... } }

  return (
    <AffirmButton
      cartItems={mapped}
      totalUSD={Number(totalUSD) || 0}
      shippingUSD={0}
      taxUSD={0}
      customer={customer}
    />
  );
}
