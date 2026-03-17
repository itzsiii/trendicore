export class TrackClickUseCase {
  constructor(productRepository) {
    this.productRepository = productRepository;
  }

  async execute(id) {
    if (!id) throw new Error('ID de producto es requerido');

    const product = await this.productRepository.findById(id);
    if (!product) throw new Error('Producto no encontrado');

    // Incrementamos clicks de forma asíncrona (fuego y olvido o esperar, depende de la UX)
    // En este caso esperamos para asegurar la integridad, pero podríamos no hacerlo si es crítico el tiempo de respuesta.
    await this.productRepository.incrementClicks(id);

    return {
      affiliate_link: product.affiliate_link
    };
  }
}
