import { Product } from '../domain/Product';

export class CreateProductUseCase {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async execute(productData) {
    const product = new Product(productData);

    const savedProduct = await this.productRepository.save(product.toDTO());
    
    return savedProduct;
  }
}
