import { PERMISSIONS, PermissionManager } from './Permissions';

describe('PermissionManager', () => {
  const admin = { id: '1', role: 'admin' };
  const coAdmin = { id: '2', role: 'co-admin' };
  const staff = { id: '3', role: 'staff' };
  const outsider = { id: '4', role: 'user' };

  const ownProduct = { id: 'p1', created_by: '3' };
  const otherProduct = { id: 'p2', created_by: '5' };

  describe('can', () => {
    it('should allow admin everything', () => {
      expect(PermissionManager.can('admin', PERMISSIONS.DELETE_ANY_PRODUCT)).toBe(true);
      expect(PermissionManager.can('admin', PERMISSIONS.MANAGE_ROLES)).toBe(true);
    });

    it('should allow co-admin view_pending but not manage_roles', () => {
      expect(PermissionManager.can('co-admin', PERMISSIONS.VIEW_PENDING)).toBe(true);
      expect(PermissionManager.can('co-admin', PERMISSIONS.MANAGE_ROLES)).toBe(false);
    });

    it('should allow staff create_product but not view_pending', () => {
      expect(PermissionManager.can('staff', PERMISSIONS.CREATE_PRODUCT)).toBe(true);
      expect(PermissionManager.can('staff', PERMISSIONS.VIEW_PENDING)).toBe(false);
    });
  });

  describe('canPerformOnResource', () => {
    it('should allow admin to delete any product', () => {
      expect(PermissionManager.canPerformOnResource(admin, PERMISSIONS.DELETE_ANY_PRODUCT, otherProduct)).toBe(true);
    });

    it('should allow staff to delete their own product', () => {
      expect(PermissionManager.canPerformOnResource(staff, PERMISSIONS.DELETE_ANY_PRODUCT, ownProduct)).toBe(true);
    });

    it('should NOT allow staff to delete others products', () => {
      expect(PermissionManager.canPerformOnResource(staff, PERMISSIONS.DELETE_ANY_PRODUCT, otherProduct)).toBe(false);
    });

    it('should allow co-admin to delete their own product', () => {
      expect(PermissionManager.canPerformOnResource(coAdmin, PERMISSIONS.DELETE_ANY_PRODUCT, { created_by: '2' })).toBe(true);
    });
  });
});
