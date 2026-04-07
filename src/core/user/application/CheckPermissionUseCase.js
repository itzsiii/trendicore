import { STATIC_ROLE_PERMISSIONS, PERMISSIONS } from '../domain/Permissions';

export class CheckPermissionUseCase {
  constructor(permissionRepository) {
    this.permissionRepository = permissionRepository;
  }

  async execute(user, permission, resource = null) {
    if (!user) return false;
    
    // Admin always has all permissions (hardcoded for safety)
    if (user.role === 'admin') return true;

    // Resolve permissions: dynamic from DB, or fallback to static
    let rolePerms = STATIC_ROLE_PERMISSIONS[user.role] || [];

    if (this.permissionRepository) {
      try {
        const dynamicPerms = await this.permissionRepository.getPermissionsByRole(user.role);
        if (dynamicPerms && dynamicPerms.length > 0) {
          rolePerms = dynamicPerms;
        }
      } catch (error) {
        console.error('Fallback to static permissions:', error);
      }
    }

    // Check direct permission
    if (rolePerms.includes(permission)) return true;

    // Check ownership-based permissions
    if (resource) {
      if (permission === PERMISSIONS.DELETE_ANY_PRODUCT && rolePerms.includes(PERMISSIONS.DELETE_OWN_PRODUCT)) {
        return resource.created_by === user.id;
      }
      if (permission === PERMISSIONS.EDIT_ANY_PRODUCT && rolePerms.includes(PERMISSIONS.EDIT_OWN_PRODUCT)) {
        return resource.created_by === user.id;
      }
    }

    return false;
  }
}
