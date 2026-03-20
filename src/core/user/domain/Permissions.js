export const PERMISSIONS = {
  VIEW_PENDING: 'view_pending',
  CREATE_PRODUCT: 'create_product',
  EDIT_ANY_PRODUCT: 'edit_any_product',
  EDIT_OWN_PRODUCT: 'edit_own_product',
  DELETE_ANY_PRODUCT: 'delete_any_product',
  DELETE_OWN_PRODUCT: 'delete_own_product',
  PUBLISH_PRODUCT: 'publish_product',
  MANAGE_ROLES: 'manage_roles',
};

// Matriz estática inicial (Fallback)
export const STATIC_ROLE_PERMISSIONS = {
  admin: [
    PERMISSIONS.VIEW_PENDING,
    PERMISSIONS.CREATE_PRODUCT,
    PERMISSIONS.EDIT_ANY_PRODUCT,
    PERMISSIONS.EDIT_OWN_PRODUCT,
    PERMISSIONS.DELETE_ANY_PRODUCT,
    PERMISSIONS.DELETE_OWN_PRODUCT,
    PERMISSIONS.PUBLISH_PRODUCT,
    PERMISSIONS.MANAGE_ROLES,
  ],
  'co-admin': [
    PERMISSIONS.VIEW_PENDING,
    PERMISSIONS.CREATE_PRODUCT,
    PERMISSIONS.EDIT_OWN_PRODUCT,
    PERMISSIONS.DELETE_OWN_PRODUCT,
  ],
  worker: [
    PERMISSIONS.CREATE_PRODUCT,
    PERMISSIONS.DELETE_OWN_PRODUCT,
  ],
};

export class PermissionManager {
  static currentPermissions = STATIC_ROLE_PERMISSIONS;

  static setPermissions(permissionsMap) {
    this.currentPermissions = { ...STATIC_ROLE_PERMISSIONS, ...permissionsMap };
  }

  static can(role, permission) {
    const permissions = this.currentPermissions[role] || [];
    return permissions.includes(permission);
  }

  static canPerformOnResource(user, permission, resource) {
    const role = user.role;
    
    // Admin always can (Hardcoded for safety)
    if (role === 'admin') return true;

    const permissions = this.currentPermissions[role] || [];
    
    // Check global permission
    if (permissions.includes(permission)) {
      return true;
    }

    // Check ownership-based permissions
    if (permission === PERMISSIONS.DELETE_ANY_PRODUCT && permissions.includes(PERMISSIONS.DELETE_OWN_PRODUCT)) {
      return resource.created_by === user.id;
    }

    if (permission === PERMISSIONS.EDIT_ANY_PRODUCT && permissions.includes(PERMISSIONS.EDIT_OWN_PRODUCT)) {
      return resource.created_by === user.id;
    }

    return false;
  }
}
