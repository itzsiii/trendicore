export class GetRolePermissionsUseCase {
  constructor(permissionRepository) {
    this.permissionRepository = permissionRepository;
  }

  async execute(role = null) {
    if (role) {
      return await this.permissionRepository.getPermissionsByRole(role);
    }
    return await this.permissionRepository.getAllPermissions();
  }
}
