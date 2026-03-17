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

  toDTO() {
    return {
      id: this.id,
      email: this.email,
      role: this.role,
      lastSignInAt: this.lastSignInAt
    };
  }
}
