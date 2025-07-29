// src/api/authService.ts - Serviço de autenticação

import api from './config';

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  refresh_token?: string;
  user: {
    id: number;
    username: string;
    email: string;
    nickname: string;
    first_name?: string;
    last_name?: string;
    data_nascimento?: string;
    equipe?: number;
  };
}

interface UserProfileResponse {
  id: number;
  username: string;
  email: string;
  nickname: string;
  first_name?: string;
  last_name?: string;
  data_nascimento?: string;
  equipe?: number;
  data_cadastro?: string;
  is_active?: boolean;
}

class AuthServiceClass {
  private tokenKey = 'authToken';
  private refreshTokenKey = 'refresh_token';

  /**
   * Realiza login do usuário
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('🔐 Fazendo login para:', credentials.username);

      const response = await api.post<LoginResponse>('/auth/login/', credentials);

      // Salvar tokens no localStorage
      if (response.data.access_token) {
        localStorage.setItem(this.tokenKey, response.data.access_token);
        console.log('✅ Token salvo no localStorage');
      }

      if (response.data.refresh_token) {
        localStorage.setItem(this.refreshTokenKey, response.data.refresh_token);
        console.log('✅ Refresh token salvo no localStorage');
      }

      console.log('✅ Login realizado com sucesso');
      return response.data;

    } catch (error: any) {
      console.error('❌ Erro no login:', error);

      // Limpar tokens em caso de erro
      this.clearTokens();

      // Relançar erro com mensagem mais amigável
      if (error.response?.status === 401) {
        throw new Error('Usuário ou senha incorretos');
      } else if (error.response?.status === 400) {
        throw new Error('Dados de login inválidos');
      } else if (error.code === 'ERR_NETWORK') {
        throw new Error('Erro de conexão. Verifique sua internet.');
      } else {
        throw new Error('Erro interno do servidor. Tente novamente.');
      }
    }
  }

  /**
   * Faz logout do usuário
   */
  logout(): void {
    try {
      console.log('👋 Fazendo logout...');

      // Limpar tokens
      this.clearTokens();

      // Opcional: Chamar endpoint de logout no servidor
      // api.post('/auth/logout/').catch(() => {
      //   // Ignorar erros do logout no servidor
      // });

      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
    }
  }

  /**
   * Obtém perfil do usuário logado
   */
  async getProfile(): Promise<{ data: UserProfileResponse }> {
    try {
      console.log('👤 Buscando perfil do usuário...');

      const response = await api.get<UserProfileResponse>('/auth/me/');

      console.log('✅ Perfil obtido:', response.data.username);
      return { data: response.data };

    } catch (error: any) {
      console.error('❌ Erro ao obter perfil:', error);

      // Se token for inválido, fazer logout
      if (error.response?.status === 401) {
        this.logout();
      }

      throw error;
    }
  }

  /**
   * Verifica se usuário está autenticado
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    const isAuth = !!token;

    console.log('🔍 Verificando autenticação:', isAuth ? 'Autenticado' : 'Não autenticado');
    return isAuth;
  }

  /**
   * Obtém token de acesso atual
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Obtém refresh token atual
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  /**
   * Atualiza token usando refresh token
   */
  async refreshAccessToken(): Promise<string | null> {
    try {
      const refreshToken = this.getRefreshToken();

      if (!refreshToken) {
        console.warn('⚠️ Refresh token não encontrado');
        return null;
      }

      console.log('🔄 Atualizando token...');

      const response = await api.post<{ access_token: string }>('/auth/refresh/', {
        refresh_token: refreshToken
      });

      // Salvar novo token
      localStorage.setItem(this.tokenKey, response.data.access_token);

      console.log('✅ Token atualizado com sucesso');
      return response.data.access_token;

    } catch (error) {
      console.error('❌ Erro ao atualizar token:', error);

      // Se refresh falhar, fazer logout
      this.logout();
      return null;
    }
  }

  /**
   * Limpa todos os tokens
   */
  private clearTokens(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem('access_token'); // Compatibilidade
  }

  /**
   * Registra novo usuário
   */
  async register(userData: {
    username: string;
    email: string;
    password: string;
    nickname: string;
    first_name?: string;
    last_name?: string;
    data_nascimento?: string;
  }): Promise<UserProfileResponse> {
    try {
      console.log('📝 Registrando novo usuário:', userData.username);

      const response = await api.post<UserProfileResponse>('/auth/register/', userData);

      console.log('✅ Usuário registrado com sucesso');
      return response.data;

    } catch (error: any) {
      console.error('❌ Erro no registro:', error);

      if (error.response?.status === 400) {
        throw new Error('Dados de registro inválidos');
      } else if (error.response?.status === 409) {
        throw new Error('Usuário já existe');
      } else {
        throw new Error('Erro interno do servidor');
      }
    }
  }

  /**
   * Solicita redefinição de senha
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      console.log('📧 Solicitando redefinição de senha para:', email);

      await api.post('/auth/password-reset/', { email });

      console.log('✅ Email de redefinição enviado');
    } catch (error) {
      console.error('❌ Erro ao solicitar redefinição:', error);
      throw error;
    }
  }

  /**
   * Confirma redefinição de senha
   */
  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    try {
      console.log('🔑 Confirmando redefinição de senha...');

      await api.post('/auth/password-reset-confirm/', {
        token,
        password: newPassword
      });

      console.log('✅ Senha redefinida com sucesso');
    } catch (error) {
      console.error('❌ Erro ao redefinir senha:', error);
      throw error;
    }
  }
}

const AuthService = new AuthServiceClass();
export default AuthService;