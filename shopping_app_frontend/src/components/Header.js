import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

// PUBLIC_INTERFACE
export default function Header() {
  /** App header with navigation and actions. */
  const { isAuthenticated, logout } = useAuth();
  const { itemsCount } = useCart();
  const navigate = useNavigate();

  return (
    <div className="header">
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="Go to products list">
          <span className="brand-badge">S</span>
          <span>ShopLite</span>
        </Link>

        <nav className="nav" aria-label="Primary">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            Products
          </NavLink>
          <NavLink to="/orders" className={({ isActive }) => (isActive ? "active" : "")}>
            Orders
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => (isActive ? "active" : "")}>
            Cart <span className="badge badge-primary">{itemsCount}</span>
          </NavLink>

          {!isAuthenticated ? (
            <>
              <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
                Login
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => (isActive ? "active" : "")}>
                Register
              </NavLink>
            </>
          ) : (
            <span className="pill" aria-label="Account actions">
              <button
                className="btn"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                Logout
              </button>
            </span>
          )}
        </nav>
      </div>
    </div>
  );
}
