// src/api/gameService.ts - VERSÃO CORRIGIDA
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
  // ✅ CORREÇÃO: Adicionar cache busting para garantir dados frescos
  async getMaps(): Promise<MapResponse[]> {
    console.log('🗺️ Buscando mapas da API...');
    try {
      // Adiciona timestamp para evitar cache desatualizado
      const timestamp = Date.now();
      const response = await api.get(`/jogo1/mapas/?_t=${timestamp}`);
      console.log('✅ Mapas recebidos:', response.data.length, 'mapas');

      // Log detalhado dos IDs para debug
      response.data.forEach((mapa: MapResponse) => {
        console.log(`📍 Mapa "${mapa.nome}" (ID: ${mapa.id}) - ${mapa.rotas.length} rotas`);
        mapa.rotas.forEach((rota: RouteResponse) => {
          console.log(`  🛣️ Rota "${rota.nome}" (ID: ${rota.id})`);
        });
      });

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
      console.log('✅ Veículos recebidos:', response.data.length, 'veículos');
      return response.data;
    } catch (error) {
      console.error('❌ Erro ao buscar veículos:', error);
      throw error;
    }
  },

  // ✅ CORREÇÃO: Melhor tratamento de erros para eventos
  async getNextEvent(distancia_percorrida: number): Promise<EventResponse> {
    console.log('🎲 Buscando próximo evento para distância:', distancia_percorrida.toFixed(2), 'km');
    try {
      const response = await api.post<EventResponse>('/jogo1/proximo-evento/', {
        distancia_percorrida
      });

      if (response.data && response.data.evento) {
        console.log('✅ Evento recebido:', response.data.evento.nome, '(categoria:', response.data.evento.categoria + ')');
        return response.data;
      } else {
        console.log('ℹ️ Resposta da API não contém evento válido:', response.data);
        throw new Error('Resposta inválida da API de eventos');
      }
    } catch (error: any) {
      // ✅ CORREÇÃO: Melhor tratamento de diferentes tipos de erro
      if (error.response?.status === 204) {
        console.log('ℹ️ Nenhum evento disponível (HTTP 204)');
        throw new Error('NO_EVENT_AVAILABLE');
      } else if (error.response?.status === 400) {
        console.warn('⚠️ Bad Request ao buscar evento:', error.response?.data);
        throw new Error('INVALID_REQUEST');
      } else if (error.response?.status >= 500) {
        console.error('💥 Erro interno do servidor:', error.response?.status);
        throw new Error('SERVER_ERROR');
      } else if (error.code === 'ERR_NETWORK') {
        console.error('🔥 Erro de rede/conexão');
        throw new Error('NETWORK_ERROR');
      } else {
        console.error('❌ Erro desconhecido ao buscar evento:', error);
        throw error;
      }
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

  // ✅ CORREÇÃO: Validação mais robusta e logs detalhados
  async createGame(gameData: { mapa: number; rota: number; veiculo: number }): Promise<PartidaResponse> {
    console.log('🚀 Criando nova partida com dados:', gameData);

    // Validação rigorosa dos dados antes de enviar
    if (!gameData.mapa || !gameData.rota || !gameData.veiculo) {
      const error = new Error('Dados inválidos para criar partida');
      console.error('❌ Dados incompletos:', {
        mapa: gameData.mapa,
        rota: gameData.rota,
        veiculo: gameData.veiculo
      });
      throw error;
    }

    // Validação de tipos
    if (typeof gameData.mapa !== 'number' || typeof gameData.rota !== 'number' || typeof gameData.veiculo !== 'number') {
      const error = new Error('IDs devem ser números válidos');
      console.error('❌ Tipos inválidos:', {
        mapa: typeof gameData.mapa,
        rota: typeof gameData.rota,
        veiculo: typeof gameData.veiculo
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

      // Log detalhado do erro para debug aprimorado
      if (error.response) {
        console.error('📋 Status do erro:', error.response.status);
        console.error('📋 Dados do erro:', error.response.data);

        // ✅ CORREÇÃO: Tratamento específico para erro 400 (IDs inválidos)
        if (error.response.status === 400) {
          const errorData = error.response.data;
          console.error('🔍 ERRO DE VALIDAÇÃO DETECTADO:');

          if (errorData.mapa) {
            console.error('  ❌ Mapa ID', gameData.mapa, ':', errorData.mapa);
          }
          if (errorData.rota) {
            console.error('  ❌ Rota ID', gameData.rota, ':', errorData.rota);
          }
          if (errorData.veiculo) {
            console.error('  ❌ Veículo ID', gameData.veiculo, ':', errorData.veiculo);
          }

          // Lançar erro mais descritivo
          throw new Error(`IDs inválidos: ${JSON.stringify(errorData)}`);
        }

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