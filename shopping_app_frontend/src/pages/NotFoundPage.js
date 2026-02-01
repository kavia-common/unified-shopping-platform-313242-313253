import React from "react";
import { Link } from "react-router-dom";

// PUBLIC_INTERFACE
export default function NotFoundPage() {
  /** 404 fallback page. */
  return (
    <div className="container">
      <h1 className="page-title">Page not found</h1>
      <p className="page-subtitle">The page you requested doesn’t exist.</p>
      <Link className="btn btn-primary" to="/">
        Go to products
      </Link>
    </div>
  );
}
