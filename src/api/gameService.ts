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
    categoria: string;
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
  status: string;
  resultado?: string;
  motivo_finalizacao?: string;
}

interface RespondResponse {
  detail: string;
  partida: PartidaResponse;
}

interface VehicleResponse {
  id: number;
  modelo: string;
  capacidade_carga: number;
  capacidade_combustivel: number;
  velocidade: number;
  preco: number;
  autonomia: number;
}

interface RouteResponse {
  id: number;
  nome: string;
  descricao: string;
  distancia_km: number;
  tempo_estimado_horas: number;
  tipo_estrada: string;
  velocidade_media_kmh: number;
  danger_zones_data: any[];
  dirt_segments_data: any[];
}

interface MapResponse {
  id: number;
  nome: string;
  descricao: string;
  rotas: RouteResponse[];
}

export const GameService = {
  async getMaps(): Promise<MapResponse[]> {
    console.log('🗺️ Buscando mapas da API...');
    try {
      const response = await api.get('/jogo1/mapas/');
      console.log('✅ Mapas recebidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar mapas:', error);
      throw error;
    }
  },

  async getVehicles(): Promise<VehicleResponse[]> {
    console.log('🚛 Buscando veículos da API...');
    try {
      const response = await api.get('/jogo1/veiculos/');
      console.log('✅ Veículos recebidos:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar veículos:', error);
      throw error;
    }
  },

  // FUNÇÃO ATUALIZADA: Agora é POST e recebe distancia_percorrida
  async getNextEvent(distancia_percorrida: number): Promise<EventResponse> {
    console.log('🎲 Buscando próximo evento para distância:', distancia_percorrida, 'km');
    try {
      const response = await api.post<EventResponse>('/jogo1/proximo-evento/', {
        distancia_percorrida
      });
      console.log('✅ Evento recebido:', response.data?.evento?.nome || 'Nenhum evento');
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar evento:', error);
      throw error;
    }
  },

  async respondToEvent(optionId: number): Promise<RespondResponse> {
    console.log('✋ Respondendo ao evento com opção ID:', optionId);
    try {
      const response = await api.post<RespondResponse>('/jogo1/eventos/responder/', {
        opcao_id: optionId
      });
      console.log('✅ Resposta do evento processada:', response.data.detail);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao responder evento:', error);
      throw error;
    }
  },

  async getActiveGame(): Promise<PartidaResponse> {
    console.log('🎮 Buscando partida ativa...');
    try {
      const response = await api.get<PartidaResponse>('/jogo1/partidas/ativa/');
      console.log('✅ Partida ativa encontrada:', response.data.id);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar partida ativa:', error);
      throw error;
    }
  },

  // FUNÇÃO ATUALIZADA: Usando o endpoint correto com logs detalhados
  async createGame(gameData: { mapa: number; rota: number; veiculo: number }): Promise<PartidaResponse> {
    console.log('🚀 Criando nova partida com dados:', gameData);

    // Validação dos dados antes de enviar
    if (!gameData.mapa || !gameData.rota || !gameData.veiculo) {
      const error = new Error('Dados inválidos para criar partida');
      console.error('❌ Dados incompletos:', {
        mapa: gameData.mapa,
        rota: gameData.rota,
        veiculo: gameData.veiculo
      });
      throw error;
    }

    try {
      const response = await api.post<PartidaResponse>('/jogo1/partidas/nova/', gameData);
      console.log('✅ Partida criada com sucesso! ID:', response.data.id);
      console.log('💰 Saldo inicial:', response.data.saldo);
      console.log('⛽ Combustível inicial:', response.data.combustivel_atual);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao criar partida:', error);

      // Log detalhado do erro para debug
      if (error.response) {
        console.error('📋 Status do erro:', error.response.status);
        console.error('📋 Dados do erro:', error.response.data);
        console.error('📋 Headers do erro:', error.response.headers);
      } else if (error.request) {
        console.error('📋 Requisição não respondida:', error.request);
      } else {
        console.error('📋 Erro na configuração:', error.message);
      }

      throw error;
    }
  },

  async pauseGame(): Promise<{ detail: string }> {
    console.log('⏸️ Pausando jogo...');
    try {
      const response = await api.post<{ detail: string }>('/jogo1/partidas/pausar/');
      console.log('✅ Jogo pausado:', response.data.detail);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao pausar jogo:', error);
      throw error;
    }
  },

  async resumeGame(): Promise<{ detail: string }> {
    console.log('▶️ Retomando jogo...');
    try {
      const response = await api.post<{ detail: string }>('/jogo1/partidas/continuar/');
      console.log('✅ Jogo retomado:', response.data.detail);
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao retomar jogo:', error);
      throw error;
    }
  },

  async syncGameProgress(progressData: { tempo_decorrido_segundos: number }): Promise<PartidaResponse> {
    console.log('🔄 Sincronizando progresso do jogo...', progressData);
    try {
      const response = await api.post<PartidaResponse>('/jogo1/partidas/sincronizar/', progressData);
      console.log('✅ Progresso sincronizado');
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao sincronizar progresso:', error);
      throw error;
    }
  }
};