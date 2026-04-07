/**
 * @interface
 * Interfaz que define el contrato que TODO adaptador de BD (Supabase, Firebase, Postgres, Mock, etc.) 
 * debe cumplir para ser inyectado en los Casos de Uso del dominio Product.
 */
export class IProductRepository {
  /**
   * Recupera un Producto por su ID único.
   * @param {string} id - Identificador UUID del Producto.
   * @returns {Promise<import('./Product').Product>} Instancia pura de Dominio Product
   * @throws {import('./ProductErrors').ProductNotFoundError} Si el elemento no existe.
   */
  async findById(id) {
    throw new Error('Method not implemented: findById');
  }

  /**
   * Recupera una lista de Productos dadas ciertas condiciones.
   * @param {Object} filters - Diccionario de filtrado (opcional).
   * @returns {Promise<import('./Product').Product[]>}
   */
  async findAll(filters = {}) {
    throw new Error('Method not implemented: findAll');
  }

  /**
   * Incrementa contadores de clicks atómicamente.
   * @param {string} id - Identificador UUID del producto.
   * @returns {Promise<void>}
   */
  async incrementClicks(id) {
    throw new Error('Method not implemented: incrementClicks');
  }

  /**
   * Crea o guarda un nuevo producto.
   * @param {Object} productDTO - Representación plana de datos del producto para ser persistido.
   * @returns {Promise<import('./Product').Product>} La nueva instancia generada.
   * @throws {import('./ProductErrors').DuplicateProductError} Si los datos violan las restricciones únicas (UNIQUE).
   */
  async save(productDTO) {
    throw new Error('Method not implemented: save');
  }

  /**
   * Actualiza parte del registro de un Producto existente.
   * @param {string} id - UUID
   * @param {Object} productDTO - Diccionario con solo los campos a modificar.
   * @returns {Promise<import('./Product').Product>}
   */
  async update(id, productDTO) {
    throw new Error('Method not implemented: update');
  }

  /**
   * Elimina destructivamente el producto de la persistencia.
   * @param {string} id - UUID del objetivo a ser exterminado.
   * @returns {Promise<boolean>} True si tuvo éxito.
   */
  async delete(id) {
    throw new Error('Method not implemented: delete');
  }
}
