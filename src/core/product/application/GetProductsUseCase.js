export class GetProductsUseCase {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async execute(filters = {}) {
    const products = await this.productRepository.findAll(filters);
    return products.map(p => p.toDTO());
  }
}
