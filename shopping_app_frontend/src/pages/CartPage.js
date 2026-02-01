import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { formatMoney } from "../utils/money";

// PUBLIC_INTERFACE
export default function CartPage() {
  /** Cart screen backed by /cart endpoints. */
  const { cart, loading, refreshCart, addOrUpdateItem, removeItem, clear } = useCart();
  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [busyItemId, setBusyItemId] = useState(null);
  const [busyClear, setBusyClear] = useState(false);

  useEffect(() => {
    refreshCart().catch(() => {});
  }, [refreshCart]);

  const items = useMemo(() => (cart?.items ? cart.items : []), [cart]);
  const currency = items[0]?.product?.currency || "USD";

  return (
    <div className="container">
      <h1 className="page-title">Your cart</h1>
      <p className="page-subtitle">Review items, adjust quantities, then checkout.</p>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="grid">
        <div className="col-8">
          <div className="card">
            <div className="card-body">
              {loading ? (
                <div>Loading cart…</div>
              ) : items.length === 0 ? (
                <div className="stack">
                  <div>Your cart is empty.</div>
                  <Link className="btn btn-primary" to="/">
                    Browse products
                  </Link>
                </div>
              ) : (
                <table className="table" aria-label="Cart items">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th style={{ width: 140 }}>Qty</th>
                      <th style={{ width: 160 }}>Unit</th>
                      <th style={{ width: 80 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it) => (
                      <tr key={it.id}>
                        <td>
                          <div style={{ fontWeight: 900 }}>{it.product?.name}</div>
                          <div className="muted" style={{ fontSize: 13 }}>
                            {it.product?.description || ""}
                          </div>
                        </td>
                        <td>
                          <input
                            className="input"
                            type="number"
                            min={1}
                            value={it.quantity}
                            disabled={busyItemId === it.id}
                            onChange={async (e) => {
                              const nextQty = Math.max(1, Number(e.target.value || 1));
                              setBusyItemId(it.id);
                              setError("");
                              try {
                                await addOrUpdateItem(it.product.id, nextQty);
                              } catch (err) {
                                setError(err?.message || "Failed to update quantity");
                              } finally {
                                setBusyItemId(null);
                              }
                            }}
                          />
                        </td>
                        <td>{formatMoney(it.unit_price, currency)}</td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className="btn"
                            disabled={busyItemId === it.id}
                            onClick={async () => {
                              setBusyItemId(it.id);
                              setError("");
                              try {
                                await removeItem(it.id);
                              } catch (err) {
                                setError(err?.message || "Failed to remove item");
                              } finally {
                                setBusyItemId(null);
                              }
                            }}
                          >
                            Remove
                          </button>
                        </td>
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
              <div style={{ fontWeight: 900 }}>Summary</div>

              <div className="kv">
                <div className="muted">Items</div>
                <div>{items.reduce((sum, it) => sum + it.quantity, 0)}</div>
              </div>
              <div className="kv">
                <div className="muted">Subtotal</div>
                <div className="price">{formatMoney(cart?.subtotal || "0.00", currency)}</div>
              </div>

              <div className="divider" />

              <button
                className="btn btn-primary"
                disabled={items.length === 0}
                onClick={() => navigate("/checkout")}
              >
                Checkout
              </button>

              <button
                className="btn"
                disabled={items.length === 0 || busyClear}
                onClick={async () => {
                  setBusyClear(true);
                  setError("");
                  try {
                    await clear();
                  } catch (err) {
                    setError(err?.message || "Failed to clear cart");
                  } finally {
                    setBusyClear(false);
                  }
                }}
              >
                {busyClear ? "Clearing…" : "Clear cart"}
              </button>

              <Link className="btn" to="/">
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
