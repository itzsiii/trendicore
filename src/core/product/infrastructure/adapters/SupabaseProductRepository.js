import { Product } from '../../domain/Product';

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

    if (error) throw new Error(error.message);
    return new Product(data);
  }

  async findAll(filters = {}) {
    let query = this.client.from('products').select('*');

    if (filters.region) query = query.eq('region', filters.region);
    if (filters.status) query = query.eq('status', filters.status);
    if (filters.category) query = query.eq('category', filters.category);
    if (filters.categories) query = query.in('category', filters.categories);
    if (filters.featured !== undefined) query = query.eq('featured', filters.featured);
    
    query = query.order('created_at', { ascending: false });

    if (filters.limit) query = query.limit(filters.limit);

    const { data, error } = await query;

    if (error) throw new Error(error.message);
    return data.map(item => new Product(item));
  }

  async incrementClicks(id) {
    // Primero obtenemos los clicks actuales
    const product = await this.findById(id);
    const newClicks = (product.clicks || 0) + 1;

    const { error } = await this.client
      .from('products')
      .update({ clicks: newClicks })
      .eq('id', id);

    if (error) throw new Error(error.message);
    return newClicks;
  }

  async save(productDTO) {
    const { data, error } = await this.client
      .from('products')
      .insert([productDTO])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Ya existe un producto con este nombre.');
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
