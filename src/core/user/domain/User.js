import { PermissionManager } from './Permissions';

export class User {
  constructor({ id, email, role, lastSignInAt }) {
    this.id = id;
    this.email = email;
    this.role = role || 'user';
    this.lastSignInAt = lastSignInAt;

    this.validate();
  }

  validate() {
    if (!this.email || !this.email.includes('@')) {
      throw new Error('El usuario debe tener un email válido');
    }
  }

  hasPermission(permission, resource = null) {
    if (resource) {
      return PermissionManager.canPerformOnResource(this, permission, resource);
    }
    return PermissionManager.can(this.role, permission);
  }

  toDTO() {
    return {
      id: this.id,
      email: this.email,
      role: this.role,
      lastSignInAt: this.lastSignInAt
    };
  }
}
