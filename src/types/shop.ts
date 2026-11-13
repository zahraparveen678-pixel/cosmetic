export type CollectionGroup = 'Makeup' | 'Skincare' | 'Fragrance & Body Care';

export interface Category {
  id: string;
  name: string;
  group_name: CollectionGroup;
  image_url: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  details: string;
  price: number;
  category: string;
  category_id?: string | null;
  image_url: string;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_trending: boolean;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderLineItem {
  product_id: string;
  name: string;
  category: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  image_url: string;
}

export interface OrderProductDetails {
  items: OrderLineItem[];
  subtotal: number;
  shipping: number;
  payment_method: string;
  customer_email?: string;
  notes?: string;
}

export interface Order {
  id: string;
  customer_id?: string | null;
  customer_name: string;
  phone: string;
  address: string;
  product_details: OrderProductDetails;
  total_amount: number;
  order_status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
}

export interface OrderSubmissionPayload {
  customer_name: string;
  phone: string;
  email?: string;
  address: string;
  notes?: string;
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
  }>;
}

export interface ContactMessagePayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  caption: string;
  image_url: string;
  targetRoute: string;
}

export type AppRoute =
  | { page: 'home' }
  | { page: 'shop' }
  | { page: 'makeup' }
  | { page: 'skincare' }
  | { page: 'lipsticks' }
  | { page: 'perfumes' }
  | { page: 'new-arrivals' }
  | { page: 'best-sellers' }
  | { page: 'product'; productId: string }
  | { page: 'cart' }
  | { page: 'checkout' }
  | { page: 'orders' }
  | { page: 'about' }
  | { page: 'contact' }
  | { page: 'wishlist' }
  | { page: 'gallery' }
  | { page: 'privacy-policy' }
  | { page: 'terms' };
