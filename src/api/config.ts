import axios from 'axios';

// Base URL da API - ajuste conforme seu ambiente (usando o nome do serviço no Docker Compose)
const API_URL = import.meta.env.VITE_API_URL || 'http://api:8000';

// Instância do Axios para a API
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // ✅ CORREÇÃO CRÍTICA: Configuração para HTTP 204
  validateStatus: function (status) {
    // Aceita status 200-299 E também 204 explicitamente
    return (status >= 200 && status < 300) || status === 204;
  },
  // ✅ CORREÇÃO: Evita parsing JSON em respostas vazias (HTTP 204)
  transformResponse: [function (data, headers) {
    // Se é resposta vazia (HTTP 204) ou data está vazio, retorna null
    if (!data || data === '' || headers['content-length'] === '0') {
      return null;
    }

    // Caso contrário, tenta fazer o parsing normal
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        // Se falhar no parsing, retorna a string original
        return data;
      }
    }
    return data;
  }]
});

// Interceptor para adicionar o token JWT em todas as requisições autenticadas
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratar respostas com erro 401 (não autorizado)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // ✅ CORREÇÃO: Não tratar HTTP 204 como erro
    if (error.response && error.response.status === 204) {
      // HTTP 204 é sucesso, não erro - deixa passar
      return Promise.resolve(error.response);
    }

    // Se o token expirou (401), tenta renovar com refresh token
    if (error.response && error.response.status === 401 && !error.config.url.includes('/auth/token/')) {
      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          // Tenta obter um novo token
          const response = await axios.post(`${API_URL}/api/auth/token/refresh/`, {
            refresh: refreshToken
          });

          // Armazena os novos tokens
          localStorage.setItem('token', response.data.access);

          // Reexecuta a requisição original com o novo token
          const originalRequest = error.config;
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Se não conseguir renovar, faz logout
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          console.error("Falha ao renovar token:", refreshError);
          window.location.href = '/login';
        }
      } else {
        // Se não tem refresh token, redireciona para login
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;