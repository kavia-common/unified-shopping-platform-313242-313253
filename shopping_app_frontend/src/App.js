import React, { useMemo } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";

import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";

import ProductsListPage from "./pages/ProductsListPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import NotFoundPage from "./pages/NotFoundPage";

import { ApiClient } from "./api/client";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

function AppShell() {
  const { accessToken, logout, isAuthenticated } = useAuth();

  const api = useMemo(() => {
    return new ApiClient({
      getAccessToken: () => accessToken,
      onUnauthorized: () => {
        // If backend returns 401 (expired/invalid token), log out so UI updates.
        logout();
      },
    });
  }, [accessToken, logout]);

  return (
    <CartProvider api={api} isAuthenticated={isAuthenticated}>
      <div className="App">
        <Header />

        <Routes>
          <Route path="/" element={<ProductsListPage api={api} />} />
          <Route path="/products/:productId" element={<ProductDetailPage api={api} />} />

          <Route path="/login" element={<LoginPage api={api} />} />
          <Route path="/register" element={<RegisterPage api={api} />} />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage api={api} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage api={api} />
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders/:orderId"
            element={
              <ProtectedRoute>
                <OrderDetailPage api={api} />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </CartProvider>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** Application entry with providers and routing. */
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
