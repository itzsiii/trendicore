import { AuthRepository } from '../../application/AuthRepository';

export class SupabaseAuthRepository extends AuthRepository {
  constructor(supabaseClient) {
    super();
    this.client = supabaseClient;
  }

  async signIn(email, password) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  }

  async signOut() {
    await this.client.auth.signOut();
  }

  async getSession() {
    const { data } = await this.client.auth.getSession();
    return data;
  }

  async getUserProfile(userId) {
    const { data, error } = await this.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
       return null; // El usuario podría no tener perfil configurado aún
    }
    return data;
  }
}
