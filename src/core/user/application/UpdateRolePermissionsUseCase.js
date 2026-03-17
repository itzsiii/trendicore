export class UpdateRolePermissionsUseCase {
  constructor(permissionRepository) {
    this.permissionRepository = permissionRepository;
  }

  async execute(role, permissions) {
    if (!role || !Array.isArray(permissions)) {
      throw new Error('Datos de rol o permisos inválidos');
    }
    
    // Al menos admin debe tener permisos básicos o no permitir editar admin si es peligroso
    // Pero el requerimiento es "por qué no puedo marcar?", así que permitimos.
    
    await this.permissionRepository.updatePermissionsByRole(role, permissions);
  }
}
