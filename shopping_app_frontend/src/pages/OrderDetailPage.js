import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatMoney } from "../utils/money";

// PUBLIC_INTERFACE
export default function OrderDetailPage({ api }) {
  /** Displays a single order with items. */
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      setBusy(true);
      setError("");
      try {
        const res = await api.getOrder(orderId);
        if (active) setOrder(res);
      } catch (e) {
        if (active) setError(e?.message || "Failed to load order");
      } finally {
        if (active) setBusy(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [api, orderId]);

  return (
    <div className="container">
      <div className="row" style={{ justifyContent: "flex-start" }}>
        <Link className="btn" to="/orders">
          ← Back to orders
        </Link>
      </div>

      {error ? <div className="alert alert-danger" style={{ marginTop: 12 }}>{error}</div> : null}

      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-body">
          {busy ? (
            <div>Loading…</div>
          ) : !order ? (
            <div>Order not found.</div>
          ) : (
            <div className="stack">
              <div className="row">
                <div>
                  <h1 className="page-title" style={{ margin: 0 }}>
                    Order #{order.id}
                  </h1>
                  <div className="muted">Placed {new Date(order.created_at).toLocaleString()}</div>
                </div>
                <div className="stack" style={{ textAlign: "right" }}>
                  <span className="badge badge-success">{order.status}</span>
                  <div className="price">{formatMoney(order.total_amount, order.currency)}</div>
                </div>
              </div>

              <div className="divider" />

              <table className="table" aria-label="Order items">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th style={{ width: 90 }}>Qty</th>
                    <th style={{ width: 160 }}>Unit</th>
                    <th style={{ width: 160 }}>Line</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((it) => (
                    <tr key={it.id}>
                      <td style={{ fontWeight: 800 }}>{it.product?.name}</td>
                      <td>{it.quantity}</td>
                      <td>{formatMoney(it.unit_price, order.currency)}</td>
                      <td>{formatMoney(it.line_total, order.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="footer-note">
                Updated {new Date(order.updated_at).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
