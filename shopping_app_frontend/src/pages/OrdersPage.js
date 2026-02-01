import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatMoney } from "../utils/money";

// PUBLIC_INTERFACE
export default function OrdersPage({ api }) {
  /** Lists orders for authenticated user. */
  const [orders, setOrders] = useState([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      setBusy(true);
      setError("");
      try {
        const res = await api.listOrders();
        if (active) setOrders(res?.orders || []);
      } catch (e) {
        if (active) setError(e?.message || "Failed to load orders");
      } finally {
        if (active) setBusy(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [api]);

  return (
    <div className="container">
      <h1 className="page-title">Orders</h1>
      <p className="page-subtitle">Your order history (most recent first).</p>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      <div className="card">
        <div className="card-body">
          {busy ? (
            <div>Loading orders…</div>
          ) : orders.length === 0 ? (
            <div className="stack">
              <div>No orders yet.</div>
              <Link className="btn btn-primary" to="/">
                Browse products
              </Link>
            </div>
          ) : (
            <table className="table" aria-label="Orders table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Date</th>
                  <th style={{ width: 80 }} />
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 900 }}>#{o.id}</td>
                    <td>
                      <span className="badge badge-success">{o.status}</span>
                    </td>
                    <td>{formatMoney(o.total_amount, o.currency)}</td>
                    <td className="muted">{new Date(o.created_at).toLocaleString()}</td>
                    <td style={{ textAlign: "right" }}>
                      <Link className="btn" to={`/orders/${o.id}`}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
