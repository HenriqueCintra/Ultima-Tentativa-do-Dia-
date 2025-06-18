// src/api/gameService.ts
import api from './config';
import { Map } from '../types';

// --- INTERFACES PARA EVENTOS ---
interface EventResponse {
  id: number;
  partida: number;
  evento: {
    id: number;
    nome: string;
    descricao: string;
    tipo: 'positivo' | 'negativo';
    chance_base: number;
    opcoes: Array<{
      id: number;
      descricao: string;
      efeitos: any; // JSONField do backend
    }>;
  };
  momento: string;
  ordem: number;
  opcao_escolhida: null;
}

interface PartidaResponse {
  id: number;
  saldo: number;
  combustivel_atual: number;
  quantidade_carga: number;
  condicao_veiculo: number;
  estresse_motorista: number;
  tempo_real: number;
  pontuacao: number;
  distancia_percorrida: number;
  // Adicione outros campos conforme necessário
}

interface RespondResponse {
  detail: string;
  partida: PartidaResponse;
}

export const GameService = {
  // --- FUNÇÃO EXISTENTE ---
  async getMaps(): Promise<Map[]> {
    const response = await api.get('/jogo1/mapas/');
    return response.data;
  },

  // --- NOVAS FUNÇÕES PARA EVENTOS ---

  /**
   * Busca o próximo evento para a partida ativa do usuário
   */
  async getNextEvent(): Promise<EventResponse> {
    const response = await api.get<EventResponse>('/jogo1/proximo-evento/');
    return response.data;
  },

  /**
   * Responde a um evento enviando a opção escolhida pelo jogador
   * @param optionId - ID da opção escolhida pelo jogador
   */
  async respondToEvent(optionId: number): Promise<RespondResponse> {
    const response = await api.post<RespondResponse>('/jogo1/eventos/responder/', {
      opcao_id: optionId
    });
    return response.data;
  },

  // --- FUNÇÕES FUTURAS (PLACEHOLDER) ---

  /**
   * Busca a partida ativa do usuário
   */
  async getActiveGame(): Promise<PartidaResponse> {
    const response = await api.get<PartidaResponse>('/jogo1/partida-ativa/');
    return response.data;
  },

  /**
   * Cria uma nova partida
   */
  async createGame(gameData: { mapa: number; rota: number; veiculo: number }): Promise<PartidaResponse> {
    const response = await api.post<PartidaResponse>('/jogo1/partidas/', gameData);
    return response.data;
  },

  /**
   * Pausa a partida atual
   */
  async pauseGame(): Promise<{ detail: string }> {
    const response = await api.post<{ detail: string }>('/jogo1/pausar-partida/');
    return response.data;
  },

  /**
   * Retoma a partida pausada
   */
  async resumeGame(): Promise<{ detail: string }> {
    const response = await api.post<{ detail: string }>('/jogo1/continuar-partida/');
    return response.data;
  },

  /**
   * Sincroniza o progresso da partida com o backend
   */
  async syncGameProgress(progressData: { tempo_decorrido_segundos: number }): Promise<PartidaResponse> {
    const response = await api.post<PartidaResponse>('/jogo1/sincronizar-partida/', progressData);
    return response.data;
  }
};