import React from 'react';
import { X, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import AffirmButton from './AffirmButton';

const CartDrawer: React.FC = () => {
  const { items, isOpen, close, removeItem, setQty, totalUSD, clear } = useCart();

  return (
    <div
      className={`fixed inset-0 z-[10000] ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      {/* backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={close}
      />
      {/* panel */}
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-black text-white border-l border-white/10 shadow-2xl transform transition-transform
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-xl font-black">Tu carrito</h3>
          <button onClick={close} className="p-2 rounded hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
          {items.length === 0 ? (
            <p className="text-white/70">No agregaste productos.</p>
          ) : (
            items.map(it => (
              <div key={it.id} className="flex gap-3 border border-white/10 rounded-lg p-3">
                <img
                  src={it.image || '/fallback.png'}
                  alt={it.name}
                  className="w-20 h-20 object-cover rounded"
                  onError={(e) => {
                    const t = e.currentTarget as HTMLImageElement;
                    if (!t.src.endsWith('/fallback.png')) t.src = '/fallback.png';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold truncate">{it.name}</p>
                      <p className="text-sm text-white/70">${it.price.toLocaleString()} USD</p>
                    </div>
                    <button
                      onClick={() => removeItem(it.id)}
                      className="p-2 rounded hover:bg-white/10"
                      title="Quitar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => setQty(it.id, it.qty - 1)}
                      className="p-2 rounded bg-white/10 hover:bg-white/20"
                      aria-label="Restar"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-1 rounded bg-white/10">{it.qty}</span>
                    <button
                      onClick={() => setQty(it.id, it.qty + 1)}
                      className="p-2 rounded bg-white/10 hover:bg-white/20"
                      aria-label="Sumar"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    <span className="ml-auto font-bold">
                      ${(it.price * it.qty).toLocaleString()} USD
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* footer */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-white/80">Total</span>
            <span className="text-xl font-black">${totalUSD.toLocaleString()} USD</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={clear}
              disabled={!items.length}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg font-bold disabled:opacity-50"
            >
              Vaciar
            </button>

            {/* Affirm para TODO el carrito */}
            <div className="flex-1">
              <AffirmButton
                cartItems={items.map(it => ({
                  name: it.name,
                  price: it.price,
                  qty: it.qty,
                  sku: it.sku || it.id,
                  url: it.url || window.location.href,
                }))}
                totalUSD={totalUSD}
              />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default CartDrawer;
