import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { formatMoney } from "../utils/money";

// PUBLIC_INTERFACE
export default function ProductDetailPage({ api }) {
  /** Product detail screen and add-to-cart. */
  const { productId } = useParams();
  const { isAuthenticated } = useAuth();
  const { addOrUpdateItem, refreshCart } = useCart();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const p = await api.getProduct(productId);
        if (active) setProduct(p);
      } catch (e) {
        if (active) setError(e?.message || "Failed to load product");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [api, productId]);

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: "flex-start" }}>
        <Link className="btn" to="/">
          ← Back
        </Link>
      </div>

      {error ? <div className="alert alert-danger" style={{ marginTop: 12 }}>{error}</div> : null}

      {loading ? (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="card-body">Loading product…</div>
        </div>
      ) : !product ? (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="card-body">Product not found.</div>
        </div>
      ) : (
        <div className="grid" style={{ marginTop: 12 }}>
          <div className="col-8">
            <div className="card">
              <div className="card-body stack">
                <div className="product-thumb" style={{ height: 260 }}>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} />
                  ) : (
                    <span style={{ fontSize: 42 }}>{product.name.slice(0, 2).toUpperCase()}</span>
                  )}
                </div>
                <h1 className="page-title" style={{ marginBottom: 0 }}>
                  {product.name}
                </h1>
                <div className="muted">{product.description || "No description provided."}</div>
                <div className="kv">
                  <div className="muted">Price</div>
                  <div className="price">{formatMoney(product.price, product.currency)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-4">
            <div className="card">
              <div className="card-body stack">
                <div style={{ fontWeight: 900 }}>Buy</div>

                {isAuthenticated ? (
                  <>
                    <label className="muted" htmlFor="qty">
                      Quantity
                    </label>
                    <input
                      id="qty"
                      className="input"
                      type="number"
                      min={1}
                      value={qty}
                      onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))}
                    />

                    <button
                      className="btn btn-primary"
                      disabled={busy}
                      onClick={async () => {
                        setBusy(true);
                        setError("");
                        try {
                          await addOrUpdateItem(product.id, qty);
                          await refreshCart();
                        } catch (e) {
                          setError(e?.message || "Failed to update cart");
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      {busy ? "Updating…" : "Add to cart"}
                    </button>

                    <Link className="btn" to="/cart">
                      Go to cart
                    </Link>
                  </>
                ) : (
                  <>
                    <div className="muted">Login required to add to cart and checkout.</div>
                    <Link className="btn btn-primary" to="/login">
                      Login
                    </Link>
                    <Link className="btn" to="/register">
                      Create account
                    </Link>
                  </>
                )}

                {error ? <div className="alert alert-danger">{error}</div> : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
