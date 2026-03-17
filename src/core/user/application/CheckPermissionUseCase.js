export class CheckPermissionUseCase {
  constructor() {}

  execute(user, permission, resource = null) {
    if (!user) return false;
    return user.hasPermission(permission, resource);
  }
}
