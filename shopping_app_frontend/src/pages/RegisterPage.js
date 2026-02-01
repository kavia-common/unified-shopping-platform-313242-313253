import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// PUBLIC_INTERFACE
export default function RegisterPage({ api }) {
  /** Register screen; creates account and stores JWT. */
  const { setToken } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="container">
      <h1 className="page-title">Create account</h1>
      <p className="page-subtitle">Register to save your cart and view your order history.</p>

      <div className="grid">
        <div className="col-12">
          <div className="card">
            <div className="card-body stack">
              {error ? <div className="alert alert-danger">{error}</div> : null}

              <label className="muted" htmlFor="fullName">
                Full name (optional)
              </label>
              <input id="fullName" className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />

              <label className="muted" htmlFor="email">
                Email
              </label>
              <input id="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />

              <label className="muted" htmlFor="password">
                Password (min 8 characters)
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
                    const res = await api.register({ email, password, full_name: fullName || null });
                    setToken(res.access_token);
                    navigate("/", { replace: true });
                  } catch (e) {
                    setError(e?.message || "Registration failed");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? "Creating…" : "Create account"}
              </button>

              <div className="muted">
                Already have an account? <Link className="btn-link" to="/login">Login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
