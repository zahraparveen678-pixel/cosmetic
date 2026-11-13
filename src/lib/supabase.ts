import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type {
  Category,
  ContactMessagePayload,
  Order,
  OrderSubmissionPayload,
  Product,
} from '../types/shop';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? '';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ?? '';

export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      supabaseUrl.startsWith('https://') &&
      !supabaseUrl.includes('your-project-id') &&
      !supabaseAnonKey.includes('your-supabase-anon-key')
  );
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables and run supabase/schema.sql.'
    );
  }

  if (!cachedClient) {
    cachedClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return cachedClient;
}

export async function fetchCategories(): Promise<Category[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('categories')
    .select('id, name, group_name, image_url, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message || 'Unable to load categories from Supabase.');
  }

  return (data ?? []) as Category[];
}

export async function fetchProducts(): Promise<Product[]> {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('products')
    .select(
      'id, name, description, details, price, category, category_id, image_url, stock, is_active, is_featured, is_new_arrival, is_best_seller, is_trending, created_at'
    )
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message || 'Unable to load products from Supabase.');
  }

  return (data ?? []).map((row) => ({
    ...row,
    details: row.details ?? '',
    price: Number(row.price),
    stock: Number(row.stock),
    is_active: Boolean(row.is_active ?? true),
    is_featured: Boolean(row.is_featured),
    is_new_arrival: Boolean(row.is_new_arrival),
    is_best_seller: Boolean(row.is_best_seller),
    is_trending: Boolean(row.is_trending),
  }));
}

export async function submitOrder(payload: OrderSubmissionPayload): Promise<Order> {
  const client = getSupabaseClient();
  const { data, error } = await client.rpc('create_customer_order', {
    p_customer_name: payload.customer_name,
    p_phone: payload.phone,
    p_email: payload.email?.trim() || null,
    p_address: payload.address,
    p_notes: payload.notes?.trim() || null,
    p_items: payload.items,
  });

  if (error) {
    throw new Error(error.message || 'Unable to place order in Supabase.');
  }

  if (!data) {
    throw new Error('Order could not be confirmed by the database.');
  }

  const order = data as Order;
  return {
    ...order,
    total_amount: Number(order.total_amount),
  };
}

export async function lookupOrder(orderId: string, phone: string): Promise<Order | null> {
  const client = getSupabaseClient();
  const { data, error } = await client.rpc('lookup_customer_order', {
    p_order_id: orderId.trim(),
    p_phone: phone.trim(),
  });

  if (error) {
    throw new Error(error.message || 'Unable to retrieve order details.');
  }

  if (!data) {
    return null;
  }

  const order = data as Order;
  return {
    ...order,
    total_amount: Number(order.total_amount),
  };
}

export async function lookupOrdersByPhone(phone: string): Promise<Order[]> {
  const client = getSupabaseClient();
  const { data, error } = await client.rpc('lookup_customer_orders_by_phone', {
    p_phone: phone.trim(),
  });

  if (error) {
    throw new Error(error.message || 'Unable to retrieve order history.');
  }

  return ((data ?? []) as Order[]).map((order) => ({
    ...order,
    total_amount: Number(order.total_amount),
  }));
}

export async function submitContactMessage(payload: ContactMessagePayload): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client.from('contact_messages').insert([
    {
      name: payload.name.trim(),
      email: payload.email.trim(),
      subject: payload.subject.trim() || 'General Inquiry',
      message: payload.message.trim(),
    },
  ]);

  if (error) {
    throw new Error(error.message || 'Unable to send your message right now.');
  }
}

export async function subscribeNewsletter(email: string): Promise<void> {
  const client = getSupabaseClient();
  const { error } = await client.from('newsletter_subscribers').insert([
    {
      email: email.trim().toLowerCase(),
    },
  ]);

  if (error) {
    if (error.code === '23505') {
      throw new Error('This email address is already subscribed to our beauty circle.');
    }
    throw new Error(error.message || 'Unable to subscribe right now.');
  }
}
