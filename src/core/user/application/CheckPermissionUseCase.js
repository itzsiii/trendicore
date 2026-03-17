import { PermissionManager } from '../domain/Permissions';

export class CheckPermissionUseCase {
  constructor(permissionRepository) {
    this.permissionRepository = permissionRepository;
  }

  async execute(user, permission, resource = null) {
    if (!user) return false;
    
    // Si tenemos repositorio, cargamos permisos dinámicos antes de chequear
    if (this.permissionRepository) {
      try {
        const rolePerms = await this.permissionRepository.getPermissionsByRole(user.role);
        if (rolePerms) {
          PermissionManager.setPermissions({ [user.role]: rolePerms });
        }
      } catch (error) {
        console.error('Error loading dynamic permissions in Use Case:', error);
        // Fallback al estático si falla la carga
      }
    }

    return user.hasPermission(permission, resource);
  }
}
