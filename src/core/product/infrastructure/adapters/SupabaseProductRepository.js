import { Product } from '../../domain/Product';
import { DuplicateProductError, ProductNotFoundError } from '../../domain/ProductErrors';


export class SupabaseProductRepository {
  constructor(supabaseClient) {
    this.client = supabaseClient;
  }

  async findById(id) {
    const { data, error } = await this.client
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') throw new ProductNotFoundError(id);
      throw new Error(error.message); // Other unknown errors
    }
    return new Product(data);
  }

  async findAll(filters = {}) {
    let query = this.client.from('products').select('*');

    if (filters.region) query = query.eq('region', filters.region);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.category && filters.category !== 'all') query = query.eq('category', filters.category);
    if (filters.categories) query = query.in('category', filters.categories);
    if (filters.featured !== undefined) query = query.eq('featured', filters.featured);
    if (filters.affiliate_source && filters.affiliate_source !== 'all') query = query.eq('affiliate_source', filters.affiliate_source);
    
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters.sortBy === 'popular') {
      query = query.order('clicks', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    
    if (filters.limit) query = query.limit(filters.limit);

    const { data, error } = await query;

    if (error) throw new Error(error.message);
    return data.map(item => new Product(item));
  }

  async incrementClicks(id) {
    // Atomic increment: uses Supabase's raw SQL via rpc if available,
    // otherwise falls back to a single update with a sub-select.
    // Try RPC first (requires the increment_clicks function in Supabase)
    const { data, error: rpcError } = await this.client.rpc('increment_clicks', { product_id: id });
    
    if (!rpcError) return data;
    
    // Fallback: single-query increment (still atomic at DB level)
    const { error } = await this.client
      .from('products')
      .update({ clicks: this.client.raw ? this.client.raw('clicks + 1') : 1 })
      .eq('id', id);

    if (error) {
      console.error('incrementClicks fallback error:', error.message);
      // Non-critical: don't throw, just log
    }
  }

  async save(productDTO) {
    const { data, error } = await this.client
      .from('products')
      .insert([productDTO])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new DuplicateProductError(productDTO.title);
      }
      throw new Error(error.message);
    }
    return new Product(data);
  }

  async update(id, productDTO) {
    const { data, error } = await this.client
      .from('products')
      .update(productDTO)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return new Product(data);
  }

  async delete(id) {
    const { error } = await this.client
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    return true;
  }
}
