import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// PUBLIC_INTERFACE
export default function LoginPage({ api }) {
  /** Login screen; stores JWT in local storage via AuthContext. */
  const { setToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="container">
      <h1 className="page-title">Login</h1>
      <p className="page-subtitle">Sign in to manage your cart, checkout, and view your orders.</p>

      <div className="grid">
        <div className="col-12">
          <div className="card">
            <div className="card-body stack">
              {error ? <div className="alert alert-danger">{error}</div> : null}

              <label className="muted" htmlFor="email">
                Email
              </label>
              <input id="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />

              <label className="muted" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
              />

              <button
                className="btn btn-primary"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  setError("");
                  try {
                    const res = await api.login({ email, password });
                    setToken(res.access_token);
                    navigate(redirectTo, { replace: true });
                  } catch (e) {
                    setError(e?.message || "Login failed");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? "Signing in…" : "Login"}
              </button>

              <div className="muted">
                New here? <Link className="btn-link" to="/register">Create an account</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
