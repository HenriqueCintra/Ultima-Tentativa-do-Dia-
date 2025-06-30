// src/api/gameService.ts
import api from './config';
import { Map } from '../types';

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
      efeitos: any;
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
}

interface RespondResponse {
  detail: string;
  partida: PartidaResponse;
}

export const GameService = {
  async getMaps(): Promise<Map[]> {
    const response = await api.get('/jogo1/mapas/');
    return response.data;
  },

  async getVehicles(): Promise<any[]> {
    const response = await api.get('/jogo1/veiculos/');
    return response.data;
  },

  async getNextEvent(): Promise<EventResponse> {
    const response = await api.get<EventResponse>('/jogo1/proximo-evento/');
    return response.data;
  },

  async respondToEvent(optionId: number): Promise<RespondResponse> {
    const response = await api.post<RespondResponse>('/jogo1/eventos/responder/', {
      opcao_id: optionId
    });
    return response.data;
  },

  async getActiveGame(): Promise<PartidaResponse> {
    const response = await api.get<PartidaResponse>('/jogo1/partidas/ativa/');
    return response.data;
  },

  async createGame(gameData: { mapa: number; rota: number; veiculo: number }): Promise<PartidaResponse> {
    const response = await api.post<PartidaResponse>('/jogo1/partidas/', gameData);
    return response.data;
  },

  async pauseGame(): Promise<{ detail: string }> {
    const response = await api.post<{ detail: string }>('/jogo1/partidas/pausar/');
    return response.data;
  },

  async resumeGame(): Promise<{ detail: string }> {
    const response = await api.post<{ detail: string }>('/jogo1/partidas/continuar/');
    return response.data;
  },

  async syncGameProgress(progressData: { tempo_decorrido_segundos: number }): Promise<PartidaResponse> {
    const response = await api.post<PartidaResponse>('/jogo1/partidas/sincronizar/', progressData);
    return response.data;
  }
};