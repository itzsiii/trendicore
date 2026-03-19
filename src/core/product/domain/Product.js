export class Product {
  constructor({ id, title, price, category, affiliate_link, affiliate_source, region, featured, status, image_url, clicks, created_by, created_at }) {
    this.id = id;
    this.title = title;
    this.price = price;
    this.category = category;
    this.affiliate_link = affiliate_link;
    this.affiliate_source = affiliate_source;
    this.region = region;
    this.featured = featured || false;
    this.status = status || 'draft';
    this.image_url = image_url;
    this.clicks = clicks || 0;
    this.created_by = created_by;
    this.created_at = created_at;
    
    this.validate();
  }

  validate() {
    if (!this.title || this.title.trim().length === 0) {
      throw new Error('El producto debe tener un título válido');
    }
  }

  toDTO() {
    const dto = {
      id: this.id,
      title: this.title,
      price: this.price,
      category: this.category,
      affiliate_link: this.affiliate_link,
      affiliate_source: this.affiliate_source,
      region: this.region,
      featured: this.featured,
      status: this.status,
      image_url: this.image_url,
      clicks: this.clicks,
      created_by: this.created_by,
      created_at: this.created_at
    };

    // Eliminar propiedades undefined para que Supabase use los defaults de la BD
    Object.keys(dto).forEach(key => dto[key] === undefined && delete dto[key]);

    return dto;
  }
}
