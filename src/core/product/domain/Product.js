export class Product {
  constructor({ id, title, description, image_credits, price, price_period, category, affiliate_link, affiliate_source, region, featured, status, image_url, clicks, trend_score, created_by, created_at }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.image_credits = image_credits || '';
    this.price = price;
    this.price_period = price_period || 'mes';
    this.category = category;
    this.affiliate_link = affiliate_link;
    this.affiliate_source = affiliate_source;
    this.region = region;
    this.featured = featured || false;
    this.status = status || 'draft';
    this.image_url = image_url;
    this.clicks = clicks || 0;
    this.trend_score = trend_score ?? this.#calculateTrendScore({ clicks: this.clicks, featured: this.featured, created_at });
    this.created_by = created_by;
    this.created_at = created_at;
    
    this.validate();
  }

  /**
   * Calculates a trend score (0-100) based on engagement signals.
   * Formula v1: weighted combination of click velocity, recency, and editorial boost.
   * @returns {number} Score between 0 and 100
   */
  #calculateTrendScore({ clicks, featured, created_at }) {
    const now = Date.now();
    const created = created_at ? new Date(created_at).getTime() : now;
    const ageInDays = Math.max(1, (now - created) / (1000 * 60 * 60 * 24));

    // Click velocity: clicks per day, normalized (max ~50 clicks/day = 100 score)
    const clickVelocity = Math.min((clicks / ageInDays) / 50, 1) * 60;

    // Recency bonus: newer products get a boost (decays over 30 days)
    const recencyBonus = Math.max(0, 1 - (ageInDays / 30)) * 25;

    // Featured (editorial) boost
    const featuredBonus = featured ? 15 : 0;

    return Math.round(Math.min(100, clickVelocity + recencyBonus + featuredBonus));
  }

  /**
   * Returns the trend tier based on the score.
   * @returns {'trending' | 'rising' | 'curated'}
   */
  get trendTier() {
    if (this.trend_score >= 80) return 'trending';
    if (this.trend_score >= 50) return 'rising';
    return 'curated';
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
      description: this.description,
      image_credits: this.image_credits,
      price: this.price,
      price_period: this.price_period,
      category: this.category,
      affiliate_link: this.affiliate_link,
      affiliate_source: this.affiliate_source,
      region: this.region,
      featured: this.featured,
      status: this.status,
      image_url: this.image_url,
      clicks: this.clicks,
      trend_score: this.trend_score,
      created_by: this.created_by,
      created_at: this.created_at
    };

    // Eliminar propiedades undefined para que Supabase use los defaults de la BD
    Object.keys(dto).forEach(key => dto[key] === undefined && delete dto[key]);

    return dto;
  }
}
