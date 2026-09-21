import { Product, Order, User } from '../types';

const API_BASE = '/api';

export const api = {
  // Auth
  async loginGoogle(data: { id_token?: string; mock_email?: string; mock_name?: string; mock_role?: string; mock_avatar?: string }) {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Auth failed');
    return res.json() as Promise<{ access_token: string; token_type: string; user: User }>;
  },

  async getMe(token: string) {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json() as Promise<User>;
  },

  // Products
  async getProducts(params?: { category?: string; search?: string; in_stock_only?: boolean }) {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'All') query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.in_stock_only) query.set('in_stock_only', 'true');

    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json() as Promise<Product[]>;
  },

  async getProduct(id: number) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Failed to fetch product');
    return res.json() as Promise<Product>;
  },

  async createProduct(data: Partial<Product>, token: string) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to create product');
    return res.json() as Promise<Product>;
  },

  async updateProduct(id: number, data: Partial<Product>, token: string) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to update product');
    return res.json() as Promise<Product>;
  },

  // Orders
  async getMyOrders(token: string) {
    const res = await fetch(`${API_BASE}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to fetch customer orders');
    return res.json() as Promise<Order[]>;
  },

  async getAllOrders(token: string) {
    const res = await fetch(`${API_BASE}/admin/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to fetch all orders');
    return res.json() as Promise<Order[]>;
  },

  async updateOrderStatus(orderId: number, status: string, token: string) {
    const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to update status');
    return res.json() as Promise<Order>;
  },

  // Checkout
  async createCheckoutSession(items: { product_id: number; quantity: number }[], token: string) {
    const res = await fetch(`${API_BASE}/checkout/create-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ items }),
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to create checkout session');
    return res.json() as Promise<{
      order_id: number;
      session_id: string;
      checkout_url: string;
      total_amount_cents: number;
    }>;
  },

  async confirmPayment(orderId: number, token: string, sessionId?: string) {
    const res = await fetch(`${API_BASE}/checkout/confirm-payment/${orderId}${sessionId ? `?session_id=${sessionId}` : ''}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error((await res.json()).detail || 'Failed to confirm payment');
    return res.json() as Promise<Order>;
  },

  // AI Support Agent
  async sendAiMessage(message: string, history: { role: string; content: string }[], token?: string) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message,
        conversation_history: history,
      }),
    });
    if (!res.ok) throw new Error('AI Agent error');
    return res.json() as Promise<{ response: string; tools_called: string[] }>;
  },
};
