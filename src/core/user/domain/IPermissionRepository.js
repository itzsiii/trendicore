/**
 * @interface
 * Interfaz que define el contrato de persistencia para el sistema de permisos y roles del Domio de Usuarios.
 */
export class IPermissionRepository {
  /**
   * Obtiene la matriz de permisos asociados a un rol específico.
   * @param {string} role - El rol a consultar (ej: 'admin', 'staff', 'co-admin').
   * @returns {Promise<string[]>} Promesa que resuelve a una lista de directivas (ej: ['create_product', 'delete_own_product']).
   */
  async getPermissionsByRole(role) {
    throw new Error('Method not implemented: getPermissionsByRole');
  }

  /**
   * Actualiza el árbol de permisos de un rol específico con una nueva lista de directivas.
   * @param {string} role - El rol a actualizar.
   * @param {string[]} permissions - La nueva lista íntegra de permisos para dicho rol.
   * @returns {Promise<void>} 
   */
  async updatePermissionsByRole(role, permissions) {
    throw new Error('Method not implemented: updatePermissionsByRole');
  }
}
