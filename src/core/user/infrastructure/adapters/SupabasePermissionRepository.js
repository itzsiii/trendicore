import { IPermissionRepository } from '../../domain/IPermissionRepository';

export class SupabasePermissionRepository extends IPermissionRepository {
  constructor(supabaseClient) {
    super();
    this.client = supabaseClient;
    this.table = 'role_permissions';
  }

  async getPermissionsByRole(role) {
    const { data, error } = await this.client
      .from(this.table)
      .select('permissions')
      .eq('role', role)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // Row not found
        return null;
      }
      console.error('Error fetching permissions:', error);
      throw new Error('Error al obtener permisos en el servidor');
    }

    return data.permissions;
  }

  async updatePermissionsByRole(role, permissions) {
    const { error } = await this.client
      .from(this.table)
      .upsert({ role, permissions }, { onConflict: 'role' });

    if (error) {
      console.error('Error updating permissions:', error);
      throw new Error('Error al actualizar permisos en el servidor');
    }
  }

  async getAllPermissions() {
    const { data, error } = await this.client
      .from(this.table)
      .select('*');

    if (error) {
      console.error('Error fetching all permissions:', JSON.stringify(error, null, 2));
      throw new Error(`Error al obtener todos los permisos: ${error.message}`);
    }

    return data.reduce((acc, curr) => {
      acc[curr.role] = curr.permissions;
      return acc;
    }, {});
  }
}
