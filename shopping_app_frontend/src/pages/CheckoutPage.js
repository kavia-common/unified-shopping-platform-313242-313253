import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { formatMoney } from "../utils/money";

// PUBLIC_INTERFACE
export default function CheckoutPage({ api }) {
  /** Checkout screen; creates order from cart via /checkout. */
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    refreshCart().catch(() => {});
  }, [refreshCart]);

  const items = cart?.items || [];
  const currency = items[0]?.product?.currency || "USD";

  return (
    <div className="container">
      <h1 className="page-title">Checkout</h1>
      <p className="page-subtitle">Confirm your order. The backend will create the order from your active cart.</p>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="grid">
        <div className="col-8">
          <div className="card">
            <div className="card-body">
              {items.length === 0 ? (
                <div>Your cart is empty.</div>
              ) : (
                <table className="table" aria-label="Checkout items">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th style={{ width: 120 }}>Qty</th>
                      <th style={{ width: 160 }}>Line</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it) => (
                      <tr key={it.id}>
                        <td style={{ fontWeight: 800 }}>{it.product?.name}</td>
                        <td>{it.quantity}</td>
                        <td>{formatMoney(Number(it.unit_price) * it.quantity, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="col-4">
          <div className="card">
            <div className="card-body stack">
              <div style={{ fontWeight: 900 }}>Total</div>
              <div className="price">{formatMoney(cart?.subtotal || "0.00", currency)}</div>

              <button
                className="btn btn-primary"
                disabled={busy || items.length === 0}
                onClick={async () => {
                  setBusy(true);
                  setError("");
                  try {
                    const order = await api.checkout({ idempotency_key: null });
                    await refreshCart();
                    navigate(`/orders/${order.id}`, { replace: true });
                  } catch (e) {
                    setError(e?.message || "Checkout failed");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? "Placing order…" : "Place order"}
              </button>

              <div className="footer-note">Tip: If you refresh while checking out, you can safely retry.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
