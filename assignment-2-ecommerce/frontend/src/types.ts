export interface User {
  id: number;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'customer' | 'admin';
  created_at: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  category: string;
  price_cents: number;
  stock_quantity: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_title: string;
  unit_price_cents: number;
  quantity: number;
}

export interface Order {
  id: number;
  user_id: number;
  total_amount_cents: number;
  status: 'pending' | 'paid' | 'processing' | 'shipped' | 'cancelled';
  stripe_session_id: string | null;
  customer_email: string;
  customer_name: string | null;
  created_at: string;
  items: OrderItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tools_called?: string[];
  timestamp: string;
}
