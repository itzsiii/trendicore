export class DeleteProductUseCase {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async execute(id) {
    return await this.productRepository.delete(id);
  }
}
