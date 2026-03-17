export class UpdateProductUseCase {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async execute(id, productData) {
    const updatedProduct = await this.productRepository.update(id, productData);
    return updatedProduct.toDTO();
  }
}
