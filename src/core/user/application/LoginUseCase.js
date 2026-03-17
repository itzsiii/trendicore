export class LoginUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async execute(email, password) {
    if (!email || !password) {
      throw new Error('Email y contraseña son requeridos');
    }

    const { user, session } = await this.authRepository.signIn(email, password);
    
    // Aquí podríamos buscar el perfil adicional del usuario si es necesario
    const profile = await this.authRepository.getUserProfile(user.id);
    
    const userData = {
      id: user.id,
      email: user.email,
      role: profile?.role || 'user',
      lastSignInAt: user.last_sign_in_at
    };

    return { user: userData, session };
  }
}
