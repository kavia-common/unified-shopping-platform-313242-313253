import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { formatMoney } from "../utils/money";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

// PUBLIC_INTERFACE
export default function ProductsListPage({ api }) {
  /** Products browse page with add-to-cart actions. */
  const { isAuthenticated } = useAuth();
  const { addOrUpdateItem, refreshCart } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [busyProductId, setBusyProductId] = useState(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const list = await api.listProducts();
        if (active) setProducts(Array.isArray(list) ? list : []);
      } catch (e) {
        if (active) setError(e?.message || "Failed to load products");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [api]);

  const hasProducts = useMemo(() => products.length > 0, [products.length]);

  return (
    <div className="container">
      <h1 className="page-title">Products</h1>
      <p className="page-subtitle">Browse our catalog. Login to add items to your cart and checkout.</p>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {loading ? (
        <div className="card">
          <div className="card-body">Loading products…</div>
        </div>
      ) : !hasProducts ? (
        <div className="card">
          <div className="card-body">No products found.</div>
        </div>
      ) : (
        <div className="product-grid" role="list">
          {products.map((p) => (
            <div key={p.id} className="card product-card" role="listitem">
              <div className="card-body stack">
                <div className="product-thumb" aria-label={`${p.name} image`}>
                  {p.image_url ? <img src={p.image_url} alt={p.name} /> : <span>{p.name.slice(0, 2).toUpperCase()}</span>}
                </div>

                <div className="row" style={{ alignItems: "flex-start" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 900, letterSpacing: "-0.02em" }}>{p.name}</div>
                    <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                      {p.description || "No description provided."}
                    </div>
                  </div>
                  <div className="price">{formatMoney(p.price, p.currency)}</div>
                </div>

                <div className="row">
                  <Link className="btn" to={`/products/${p.id}`}>
                    View
                  </Link>

                  {isAuthenticated ? (
                    <button
                      className="btn btn-primary"
                      disabled={busyProductId === p.id}
                      onClick={async () => {
                        setBusyProductId(p.id);
                        try {
                          await addOrUpdateItem(p.id, 1);
                          await refreshCart();
                        } finally {
                          setBusyProductId(null);
                        }
                      }}
                    >
                      {busyProductId === p.id ? "Adding…" : "Add to cart"}
                    </button>
                  ) : (
                    <Link className="btn btn-primary" to="/login">
                      Login to buy
                    </Link>
                  )}
                </div>

                <div className="footer-note">Currency: {p.currency}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
