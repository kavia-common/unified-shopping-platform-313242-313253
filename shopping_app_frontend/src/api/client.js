const DEFAULT_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:3001";

/**
 * Attempts to parse an error payload into a readable message.
 * @param {any} data
 * @returns {string}
 */
function extractErrorMessage(data) {
  if (!data) return "Request failed";
  if (typeof data === "string") return data;
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail)) {
    // FastAPI validation errors often come as a list
    return data.detail.map((d) => d.msg || JSON.stringify(d)).join(", ");
  }
  if (typeof data.message === "string") return data.message;
  return "Request failed";
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export class ApiClient {
  /**
   * @param {{ baseUrl?: string, getAccessToken?: () => string | null, onUnauthorized?: () => void }} opts
   */
  constructor(opts = {}) {
    this.baseUrl = (opts.baseUrl || DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.getAccessToken = opts.getAccessToken || (() => null);
    this.onUnauthorized = opts.onUnauthorized || (() => {});
  }

  /**
   * @param {"GET"|"POST"|"DELETE"} method
   * @param {string} path
   * @param {{ body?: any, auth?: boolean, headers?: Record<string,string> }} options
   */
  async request(method, path, options = {}) {
    const url = `${this.baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
    const headers = {
      Accept: "application/json",
      ...(options.headers || {}),
    };

    let body;
    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(options.body);
    }

    if (options.auth) {
      const token = this.getAccessToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      method,
      headers,
      body,
    });

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json") ? await res.json().catch(() => null) : await res.text().catch(() => null);

    if (res.status === 401) {
      // Token expired/invalid, or user not logged in.
      this.onUnauthorized();
    }

    if (!res.ok) {
      throw new ApiError(extractErrorMessage(data), res.status, data);
    }
    return data;
  }

  // --- Auth ---
  async register(payload) {
    return this.request("POST", "/auth/register", { body: payload });
  }

  async login(payload) {
    return this.request("POST", "/auth/login", { body: payload });
  }

  // --- Products ---
  async listProducts() {
    return this.request("GET", "/products");
  }

  async getProduct(productId) {
    return this.request("GET", `/products/${productId}`);
  }

  // --- Cart ---
  async getCart() {
    return this.request("GET", "/cart", { auth: true });
  }

  async upsertCartItem(payload) {
    return this.request("POST", "/cart/items", { auth: true, body: payload });
  }

  async removeCartItem(cartItemId) {
    return this.request("DELETE", `/cart/items/${cartItemId}`, { auth: true });
  }

  async clearCart() {
    return this.request("DELETE", "/cart", { auth: true });
  }

  // --- Orders ---
  async checkout(payload = {}) {
    return this.request("POST", "/checkout", { auth: true, body: payload });
  }

  async listOrders() {
    return this.request("GET", "/orders", { auth: true });
  }

  async getOrder(orderId) {
    return this.request("GET", `/orders/${orderId}`, { auth: true });
  }
}
