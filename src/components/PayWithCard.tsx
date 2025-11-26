// src/components/PayWithCard.tsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { startCardCheckout } from '../lib/cardCheckout';

const PayWithCard: React.FC = () => {
  const { items, totalUSD } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    try {
      setError(null);
      if (!items.length) {
        setError('Tu carrito está vacío.');
        return;
      }
      setLoading(true);
      await startCardCheckout(items);
      // No hay más código acá porque la página se redirige a Stripe
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Ocurrió un error iniciando el pago.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading || !items.length}
        className="w-full rounded-md bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Redirigiendo a pago con tarjeta…' : 'Pagar con tarjeta (crédito/débito)'}
      </button>
      <p className="text-xs text-slate-500">
        Total: <span className="font-semibold">${totalUSD.toFixed(2)} USD</span>
      </p>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default PayWithCard;
