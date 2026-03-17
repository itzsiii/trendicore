export class CheckSessionUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async execute() {
    const sessionData = await this.authRepository.getSession();
    
    if (!sessionData || !sessionData.session) {
      return { authenticated: false };
    }

    const user = sessionData.session.user;
    const profile = await this.authRepository.getUserProfile(user.id);

    return { 
      authenticated: true, 
      token: sessionData.session.access_token,
      user: {
        id: user.id,
        email: user.email,
        role: profile?.role || 'user'
      }
    };
  }
}
