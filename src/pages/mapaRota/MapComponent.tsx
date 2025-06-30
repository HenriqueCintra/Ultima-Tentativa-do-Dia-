// src/pages/mapaRota/MapComponent.tsx

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { routes, Route, parseEstimatedTime, DirtSegment } from './routesData';
import { useLocation, useNavigate } from 'react-router-dom';
import { FuelModal } from './FuelModal';
import { Vehicle } from '../../types/vehicle';
import { ArrowLeft } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { GameService } from '../../api/gameService';

// --- Correção para o ícone padrão do Leaflet ---
import defaultIcon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: defaultIcon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Ícones Customizados ---
import truckIconSvg from '@/assets/truck-solid.svg';

const truckIcon = L.icon({
  iconUrl: truckIconSvg,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

// Outros ícones
const tollIcon = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/2297/2297592.png', iconSize: [30, 30], iconAnchor: [15, 15] });
const dangerIcon = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/1008/1008928.png', iconSize: [30, 30], iconAnchor: [15, 15] });
const restStopIcon = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/6807/6807796.png', iconSize: [30, 30], iconAnchor: [15, 15] });
const constructionIcon = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/4725/4725077.png', iconSize: [30, 30], iconAnchor: [15, 15] });
const gasStationIcon = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/465/465090.png', iconSize: [30, 30], iconAnchor: [15, 15] });

// Ícones de risco
const lowRiskIcon = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/6276/6276686.png', iconSize: [30, 30], iconAnchor: [15, 15] });
const mediumRiskIcon = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/4751/4751259.png', iconSize: [30, 30], iconAnchor: [15, 15] });
const highRiskIcon = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/900/900532.png', iconSize: [30, 30], iconAnchor: [15, 15] });

// Ícones de velocidade
const speedLimitIcon20 = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/1670/1670172.png', iconSize: [30, 30], iconAnchor: [15, 15] });
const speedLimitIcon40 = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/5124/5124881.png', iconSize: [30, 30], iconAnchor: [15, 15] });
const speedLimitIcon50 = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/752/752738.png', iconSize: [30, 30], iconAnchor: [15, 15] });
const speedLimitIcon60 = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/15674/15674424.png', iconSize: [30, 30], iconAnchor: [15, 15] });
const speedLimitIcon80 = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/3897/3897785.png', iconSize: [30, 30], iconAnchor: [15, 15] });
const speedLimitIcon100 = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/10392/10392769.png', iconSize: [30, 30], iconAnchor: [15, 15] });

const getSpeedLimitIcon = (speed: number): L.Icon => {
  switch (speed) {
    case 20: return speedLimitIcon20;
    case 40: return speedLimitIcon40;
    case 50: return speedLimitIcon50;
    case 60: return speedLimitIcon60;
    case 80: return speedLimitIcon80;
    case 100: return speedLimitIcon100;
    default: return speedLimitIcon60;
  }
};

// INTERFACES
interface RenderSegment {
  path: [number, number][];
  isDirt: boolean;
  style: L.PathOptions;
}

interface EventData {
  id: number;
  evento_nome: string;
  evento_descricao: string;
  evento_tipo: string;
  opcoes: Array<{
    id: number;
    descricao: string;
  }>;
}

// Modal de Evento
interface EventModalProps {
  event: EventData;
  onRespond: (optionId: number) => void;
  isResponding: boolean;
}

const EventModal: React.FC<EventModalProps> = ({ event, onRespond, isResponding }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999] p-4">
      <div className="bg-[#200259] rounded-lg shadow-2xl border-4 border-[#E3922A] max-w-2xl w-full p-6">
        <h1 className="text-2xl font-['Silkscreen'] font-bold text-[#E3922A] text-center mb-4">
          EVENTO ENCONTRADO!
        </h1>
        <h2 className="text-xl font-['Silkscreen'] text-white text-center mb-4">
          {event.evento_nome}
        </h2>
        <p className="text-white text-center mb-6 font-sans text-lg">
          {event.evento_descricao}
        </p>
        <div className="space-y-3">
          {event.opcoes.map((opcao) => (
            <button
              key={opcao.id}
              onClick={() => onRespond(opcao.id)}
              disabled={isResponding}
              className="w-full px-4 py-3 bg-[#E3922A] text-black font-bold rounded-md shadow-lg 
                       border-2 border-black hover:bg-[#FFC06F] transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed text-left"
            >
              {opcao.descricao}
            </button>
          ))}
        </div>
        {isResponding && (
          <p className="text-center text-white mt-4 font-['Silkscreen']">
            Processando sua decisão...
          </p>
        )}
      </div>
    </div>
  );
};

// Componente de animação do caminhão
interface TruckAnimationProps {
  routePath: [number, number][];
  speed: number;
  playing: boolean;
  onTripEnd: () => void;
  onFuelEmpty: () => void;
  onEventTriggered: () => void;
  vehicle: Vehicle;
  routeDistance: number;
  setCurrentFuel: (fuel: number) => void;
  isDirtRoad: boolean;
}

const TruckAnimation: React.FC<TruckAnimationProps> = ({
  routePath,
  speed,
  playing,
  onTripEnd,
  onFuelEmpty,
  onEventTriggered,
  vehicle,
  routeDistance,
  setCurrentFuel,
  isDirtRoad
}) => {
  const truckRef = useRef<L.Marker>(null);
  const animationFrameRef = useRef<number | null>(null);
  const currentSegment = useRef<number>(0);
  const segmentProgress = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const totalDistanceTraveledRef = useRef<number>(0);
  const lastFuelUpdateRef = useRef<number>(0);
  const currentFuelRef = useRef<number>(vehicle.currentFuel);
  const lastEventCheckRef = useRef<number>(0);
  const visualizationSpeedFactor = 300;

  const vehicleIcon = useMemo(() => {
    return L.icon({
      iconUrl: vehicle.image,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    });
  }, [vehicle.image]);

  const calculateFuelConsumption = useCallback((distanceTraveled: number) => {
    const consumption = isDirtRoad ? vehicle.consumption.dirt : vehicle.consumption.asphalt;
    return distanceTraveled / consumption;
  }, [isDirtRoad, vehicle.consumption]);

  const updateFuel = useCallback((distanceTraveled: number) => {
    const fuelConsumed = calculateFuelConsumption(distanceTraveled);
    const newFuel = Math.max(0, currentFuelRef.current - fuelConsumed);

    currentFuelRef.current = newFuel;
    setCurrentFuel(newFuel);

    if (newFuel <= 0) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      onFuelEmpty();
      return true;
    }
    return false;
  }, [calculateFuelConsumption, onFuelEmpty, setCurrentFuel]);

  const animateTruck = useCallback(() => {
    if (!playing || !truckRef.current || !routePath || routePath.length < 2) {
      return;
    }

    if (currentSegment.current >= routePath.length - 1) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      onTripEnd();
      return;
    }

    const now = performance.now();

    if (startTimeRef.current === 0) {
      startTimeRef.current = now;
      lastTimeRef.current = now;
    }

    const elapsed = now - startTimeRef.current;
    const deltaTime = now - lastTimeRef.current;
    lastTimeRef.current = now;

    const startPoint = routePath[currentSegment.current];
    const endPoint = routePath[currentSegment.current + 1];

    // Calcular distância em metros do segmento (usando a fórmula de Haversine)
    const R = 6371e3;
    const φ1 = startPoint[0] * Math.PI / 180;
    const φ2 = endPoint[0] * Math.PI / 180;
    const Δφ = (endPoint[0] - startPoint[0]) * Math.PI / 180;
    const Δλ = (endPoint[1] - startPoint[1]) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const segmentDistanceMeters = R * c;
    const segmentDistanceKm = segmentDistanceMeters / 1000;

    const timeToCompleteMsec = (segmentDistanceKm / speed) * 3600 * 1000;
    const adjustedTimeToCompleteMsec = timeToCompleteMsec / visualizationSpeedFactor;

    segmentProgress.current = Math.min(elapsed / adjustedTimeToCompleteMsec, 1);

    const previousProgress = (elapsed - deltaTime) / adjustedTimeToCompleteMsec;
    const previousDistanceFraction = Math.min(previousProgress, 1);
    const currentDistanceFraction = segmentProgress.current;
    const distanceDiff = currentDistanceFraction - previousDistanceFraction;
    const distanceThisFrameKm = segmentDistanceKm * distanceDiff;

    totalDistanceTraveledRef.current += distanceThisFrameKm;

    // Verificar eventos a cada 10km
    if (totalDistanceTraveledRef.current - lastEventCheckRef.current >= 10) {
      lastEventCheckRef.current = totalDistanceTraveledRef.current;
      // 30% de chance de evento
      if (Math.random() < 0.3) {
        onEventTriggered();
        return;
      }
    }

    // Atualizar combustível
    if (totalDistanceTraveledRef.current - lastFuelUpdateRef.current >= 1 ||
      currentFuelRef.current <= (vehicle.maxCapacity * 0.1)) {
      const distanceSinceLastUpdate = totalDistanceTraveledRef.current - lastFuelUpdateRef.current;
      lastFuelUpdateRef.current = totalDistanceTraveledRef.current;

      if (updateFuel(distanceSinceLastUpdate)) {
        return;
      }
    }

    if (segmentProgress.current >= 1) {
      currentSegment.current += 1;
      segmentProgress.current = 0;
      startTimeRef.current = now;

      if (currentSegment.current < routePath.length - 1) {
        animationFrameRef.current = requestAnimationFrame(animateTruck);
      } else {
        onTripEnd();
      }
      return;
    }

    const newLat = startPoint[0] + (endPoint[0] - startPoint[0]) * segmentProgress.current;
    const newLng = startPoint[1] + (endPoint[1] - startPoint[1]) * segmentProgress.current;
    const newPosition = L.latLng(newLat, newLng);

    truckRef.current.setLatLng(newPosition);
    animationFrameRef.current = requestAnimationFrame(animateTruck);
  }, [playing, routePath, speed, onTripEnd, updateFuel, vehicle.maxCapacity, onFuelEmpty, onEventTriggered]);

  useEffect(() => {
    if (playing && routePath && routePath.length > 1) {
      if (!truckRef.current || (currentSegment.current === 0 && segmentProgress.current === 0)) {
        truckRef.current?.setLatLng(L.latLng(routePath[0][0], routePath[0][1]));
      }

      if (currentSegment.current === 0 && segmentProgress.current === 0) {
        totalDistanceTraveledRef.current = 0;
        lastFuelUpdateRef.current = 0;
        lastEventCheckRef.current = 0;
        currentFuelRef.current = vehicle.currentFuel;
      }

      if (segmentProgress.current === 0) {
        startTimeRef.current = 0;
      }

      animationFrameRef.current = requestAnimationFrame(animateTruck);
    } else if (!playing && animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [playing, routePath, animateTruck, vehicle.currentFuel]);

  if (!routePath || routePath.length === 0) return null;

  return (
    <Marker
      position={L.latLng(routePath[0][0], routePath[0][1])}
      icon={vehicleIcon}
      ref={truckRef}
    >
      <Popup>
        <div className="text-sm">
          <p className="font-bold">{vehicle.name}</p>
          <p>Combustível: {Math.round(currentFuelRef.current)} de {vehicle.maxCapacity}L</p>
        </div>
      </Popup>
    </Marker>
  );
};

export const MapComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const juazeiroCoordinates: [number, number] = [-9.44977115369502, -40.52422616182216];
  const salvadorCoordinates: [number, number] = [-12.954121960174133, -38.47128319030249];

  // Estados principais
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [routesList] = useState<Route[]>(routes);
  const [showEventModal, setShowEventModal] = useState(false);
  const [activeEvent, setActiveEvent] = useState<EventData | null>(null);
  const [simulatedTime, setSimulatedTime] = useState<number>(0);

  // Estados do backend
  const [backendMaps, setBackendMaps] = useState<any[]>([]);
  const [backendVehicles, setBackendVehicles] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Estados do jogo
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [activeGameId, setActiveGameId] = useState<number | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);

  // Estado do veículo
  const [vehicle, setVehicle] = useState<Vehicle>(() => {
    if (location.state && location.state.selectedVehicle) {
      return location.state.selectedVehicle;
    }
    navigate('/select-vehicle');
    return {
      id: 'carreta',
      name: 'Carreta',
      capacity: 60,
      consumption: { asphalt: 2, dirt: 1.5 },
      image: '/carreta.png',
      maxCapacity: 495,
      currentFuel: 120,
      cost: 4500
    };
  });

  // Estado do dinheiro
  const [availableMoney, setAvailableMoney] = useState<number>(() => {
    if (location.state && location.state.availableMoney !== undefined) {
      return location.state.availableMoney;
    }
    return 5500;
  });

  // Outros estados
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [gameOverReason, setGameOverReason] = useState('');
  const [initialMapViewSet, setInitialMapViewSet] = useState(false);
  const [renderedSegments, setRenderedSegments] = useState<RenderSegment[]>([]);

  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Carregar dados do backend
  useEffect(() => {
    const loadBackendData = async () => {
      try {
        console.log('🔄 Carregando dados do backend...');

        const [mapsData, vehiclesData] = await Promise.all([
          GameService.getMaps(),
          GameService.getVehicles()
        ]);

        console.log('✅ Mapas carregados:', mapsData);
        console.log('✅ Veículos carregados:', vehiclesData);

        // Verificar se o mapa "ENTREGA EFICIENTE" existe
        const entregaEficiente = mapsData.find(m => m.nome === "ENTREGA EFICIENTE");
        if (entregaEficiente) {
          console.log('🎯 Mapa "ENTREGA EFICIENTE" encontrado:', entregaEficiente);
        } else {
          console.warn('⚠️ Mapa "ENTREGA EFICIENTE" NÃO encontrado!');
          console.log('📋 Mapas disponíveis:', mapsData.map(m => `ID: ${m.id}, Nome: ${m.nome}`));
        }

        // Verificar se os veículos necessários existem
        const veiculosEsperados = ['Camionete', 'Van', 'Caminhão Médio', 'Carreta'];
        veiculosEsperados.forEach(modelo => {
          const veiculo = vehiclesData.find(v => v.modelo === modelo);
          if (veiculo) {
            console.log(`✅ Veículo "${modelo}" encontrado (ID: ${veiculo.id})`);
          } else {
            console.warn(`⚠️ Veículo "${modelo}" NÃO encontrado!`);
          }
        });

        setBackendMaps(mapsData);
        setBackendVehicles(vehiclesData);
        setIsLoadingData(false);
      } catch (error) {
        console.error('❌ Erro ao carregar dados do backend:', error);
        setIsLoadingData(false);
      }
    };

    loadBackendData();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      const start = Date.now();
      interval = setInterval(() => {
        const elapsedRealMs = Date.now() - start;
        const accelerationFactor = 8 / 3;
        const simulatedMinutes = (elapsedRealMs / 60000) * accelerationFactor;
        setSimulatedTime(simulatedMinutes);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Mutations do backend
  const createGameMutation = useMutation({
    mutationFn: (gameData: { mapa: number; rota: number; veiculo: number }) =>
      GameService.createGame(gameData),
    onSuccess: (partida) => {
      console.log('✅ Partida criada com sucesso:', partida);
      console.log('🎮 Dados enviados ao backend:', {
        mapa: partida.mapa || 'N/A',
        rota: partida.rota || 'N/A',
        veiculo: partida.veiculo || 'N/A'
      });

      setActiveGameId(partida.id);
      setIsGameActive(true);

      // CORRIGIR: Definir gameStartTime aqui!
      setGameStartTime(Date.now());

      setIsPlaying(true);
      startProgressSync();
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || error?.message || "Erro ao criar partida";
      console.error('❌ Erro ao criar partida:', errorMessage);
      alert(`Erro: ${errorMessage}`);
    }
  });

  const syncProgressMutation = useMutation({
    mutationFn: (progressData: { tempo_decorrido_segundos: number }) =>
      GameService.syncGameProgress(progressData),
    onSuccess: (partida) => {
      console.log('🔄 Progresso sincronizado:', partida);

      if (partida.saldo !== undefined) {
        setAvailableMoney(partida.saldo);
      }
      if (partida.combustivel_atual !== undefined) {
        setVehicle(prev => ({ ...prev, currentFuel: partida.combustivel_atual }));
      }

      if (partida.status === 'concluido') {
        setIsPlaying(false);
        setIsGameActive(false);
        setActiveGameId(null);
        stopProgressSync();

        if (partida.resultado === 'vitoria') {
          alert(`🏆 Parabéns! ${partida.motivo_finalizacao || 'Você completou a rota!'}`);
        } else {
          alert(`💀 Game Over: ${partida.motivo_finalizacao || 'Viagem interrompida'}`);
          setGameOverReason(partida.motivo_finalizacao || 'Erro desconhecido');
          setShowGameOverModal(true);
        }
      }
    },
    onError: (error: any) => {
      console.warn("⚠️ Erro na sincronização:", error?.response?.data?.detail || error?.message);
    }
  });

  const fetchNextEventMutation = useMutation({
    mutationFn: GameService.getNextEvent,
    onSuccess: (data) => {
      console.log('🎲 Evento carregado:', data);
      setActiveEvent(data);
      setShowEventModal(true);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || error?.message || "Erro desconhecido";
      console.log(`ℹ️ Sem eventos disponíveis: ${errorMessage}`);
      setIsPlaying(true); // Continuar jogo se não há eventos
    }
  });

  const respondToEventMutation = useMutation({
    mutationFn: (optionId: number) => GameService.respondToEvent(optionId),
    onSuccess: (data) => {
      const { detail, partida: updatedPartida } = data;
      if (updatedPartida) {
        if (updatedPartida.saldo !== undefined) {
          setAvailableMoney(updatedPartida.saldo);
        }
        if (updatedPartida.combustivel_atual !== undefined) {
          setVehicle(prev => ({
            ...prev,
            currentFuel: updatedPartida.combustivel_atual,
          }));
        }
      }
      alert(`Resultado: ${detail}`);
      setShowEventModal(false);
      setActiveEvent(null);
      setIsPlaying(true);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || error?.message || "Erro desconhecido";
      alert(`Erro: ${errorMessage}. O jogo será retomado.`);
      setIsPlaying(true);
    }
  });

  // Funções de controle do progresso
  const startProgressSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    syncIntervalRef.current = setInterval(() => {
      if (isGameActive && gameStartTime > 0) {
        const tempoDecorrido = Math.floor((Date.now() - gameStartTime) / 1000);

        // CORRIGIR: Só sincronizar se tempo > 0
        if (tempoDecorrido > 0) {
          syncProgressMutation.mutate({
            tempo_decorrido_segundos: tempoDecorrido
          });
        }
      }
    }, 30000); // Sincronizar a cada 30 segundos
  }, [isGameActive, gameStartTime, syncProgressMutation]);

  const stopProgressSync = useCallback(() => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  }, []);

  // Handlers
  const handleSelectRoute = useCallback((routeId: number) => {
    const routeToSelect = routesList.find(r => r.routeId === routeId);
    if (routeToSelect) {
      setSelectedRoute(routeToSelect);
      setIsPlaying(false);
      setInitialMapViewSet(false);
      setSimulatedTime(0);
    }
  }, [routesList]);

  // Função para mapear veículo do frontend para ID do backend
  const mapVehicleToBackendId = useCallback((frontendVehicle: Vehicle): number => {
    // Mapeamento baseado no nome/modelo do veículo
    const vehicleMapping: { [key: string]: string } = {
      'caminhonete': 'Camionete',          // Frontend 'caminhonete' → Backend 'Camionete' (ID 1)
      'caminhao_pequeno': 'Van',           // Frontend 'caminhao_pequeno' → Backend 'Van' (ID 2) 
      'caminhao_medio': 'Caminhão Médio',  // Frontend 'caminhao_medio' → Backend 'Caminhão Médio' (ID 3)
      'carreta': 'Carreta'                 // Frontend 'carreta' → Backend 'Carreta' (ID 4)
    };

    const targetName = vehicleMapping[frontendVehicle.id];
    const backendVehicle = backendVehicles.find(v => v.modelo === targetName);

    if (backendVehicle) {
      console.log(`🔄 Mapeamento: "${frontendVehicle.id}" → "${targetName}" (ID: ${backendVehicle.id})`);
      return backendVehicle.id;
    }

    // Fallback: usar o primeiro veículo disponível
    console.warn(`⚠️ Veículo "${frontendVehicle.id}" não encontrado, usando fallback`);
    return backendVehicles.length > 0 ? backendVehicles[0].id : 1;
  }, [backendVehicles]);

  // Debug: Mostrar todos os mapeamentos disponíveis quando os dados estiverem carregados
  useEffect(() => {
    if (!isLoadingData && backendVehicles.length > 0) {
      console.log('🗺️ TABELA DE MAPEAMENTO DE VEÍCULOS:');
      console.log('Frontend ID → Backend Modelo (ID)');
      console.log('=====================================');

      const vehicleMapping: { [key: string]: string } = {
        'caminhonete': 'Camionete',
        'caminhao_pequeno': 'Van',
        'caminhao_medio': 'Caminhão Médio',
        'carreta': 'Carreta'
      };

      Object.entries(vehicleMapping).forEach(([frontendId, backendName]) => {
        const backendVehicle = backendVehicles.find(v => v.modelo === backendName);
        const status = backendVehicle ? '✅' : '❌';
        const backendId = backendVehicle ? backendVehicle.id : 'NÃO ENCONTRADO';
        console.log(`${status} ${frontendId} → ${backendName} (${backendId})`);
      });
      console.log('=====================================');
    }
  }, [isLoadingData, backendVehicles]);

  const handleStartGame = useCallback(() => {
    if (!selectedRoute) {
      alert("Selecione uma rota primeiro!");
      return;
    }

    // Se há jogo ativo, apenas retomar
    if (isGameActive && activeGameId) {
      setIsPlaying(true);
      return;
    }

    // Buscar o mapa "ENTREGA EFICIENTE" que é o único jogo ativo
    let mapaParaUsar = backendMaps.find(m => m.nome === "ENTREGA EFICIENTE");

    // Fallback: se não encontrar "ENTREGA EFICIENTE", usar o primeiro mapa disponível
    if (!mapaParaUsar && backendMaps.length > 0) {
      console.warn('⚠️ Mapa "ENTREGA EFICIENTE" não encontrado, usando primeiro mapa disponível');
      mapaParaUsar = backendMaps[0];
    }

    if (!mapaParaUsar) {
      alert("Erro: Nenhum mapa disponível no backend!");
      console.error("Mapas carregados:", backendMaps);
      return;
    }

    // CORRIGIR: Mapear o veículo selecionado para o ID do backend
    const veiculoBackendId = mapVehicleToBackendId(vehicle);

    console.log('🚀 Iniciando jogo com:', {
      mapaId: mapaParaUsar.id,
      mapaNome: mapaParaUsar.nome,
      rotaSelecionada: selectedRoute.name,
      veiculoFrontend: vehicle.name,
      veiculoBackendId: veiculoBackendId
    });

    const gameData = {
      mapa: mapaParaUsar.id,
      rota: mapaParaUsar.id, // Usar o mesmo ID do mapa
      veiculo: veiculoBackendId // ✅ USAR O ID CORRETO DO BACKEND
    };

    createGameMutation.mutate(gameData);
  }, [selectedRoute, isGameActive, activeGameId, createGameMutation, backendMaps, vehicle, mapVehicleToBackendId]);

  const handleTripEnd = useCallback(() => {
    setIsPlaying(false);

    if (isGameActive && gameStartTime > 0) {
      const tempoFinal = Math.floor((Date.now() - gameStartTime) / 1000);
      if (tempoFinal > 0) {
        syncProgressMutation.mutate({
          tempo_decorrido_segundos: tempoFinal
        });
      }
    }

    setIsGameActive(false);
    setActiveGameId(null);
    stopProgressSync();

    alert('🏆 Viagem concluída!');
  }, [isGameActive, gameStartTime, syncProgressMutation, stopProgressSync]);

  const handleFuelEmpty = useCallback(() => {
    setIsPlaying(false);

    if (isGameActive && gameStartTime > 0) {
      const tempoFinal = Math.floor((Date.now() - gameStartTime) / 1000);
      if (tempoFinal > 0) {
        syncProgressMutation.mutate({
          tempo_decorrido_segundos: tempoFinal
        });
      }
    }

    setIsGameActive(false);
    setActiveGameId(null);
    stopProgressSync();

    setGameOverReason('combustível');
    setShowGameOverModal(true);
  }, [isGameActive, gameStartTime, syncProgressMutation, stopProgressSync]);

  const handleEventTriggered = useCallback(() => {
    setIsPlaying(false);
    fetchNextEventMutation.mutate();
  }, [fetchNextEventMutation]);

  // Funções auxiliares
  function MapViewControl({ route }: { route: Route | null }) {
    const map = useMapEvents({});

    useEffect(() => {
      if (route && route.pathCoordinates && route.pathCoordinates.length > 1 && (!initialMapViewSet || !isPlaying)) {
        const bounds = L.latLngBounds(route.pathCoordinates);
        map.fitBounds(bounds, { padding: [50, 50] });
        setInitialMapViewSet(true);
      } else if (!route && !initialMapViewSet) {
        const bounds = L.latLngBounds(juazeiroCoordinates, salvadorCoordinates);
        map.fitBounds(bounds, { padding: [100, 100] });
        setInitialMapViewSet(true);
      }
    }, [map, route, isPlaying]);

    return null;
  }

  // Segmentar a rota
  useEffect(() => {
    if (!selectedRoute || !selectedRoute.pathCoordinates) {
      setRenderedSegments([]);
      return;
    }

    const segments: RenderSegment[] = [];
    const totalPoints = selectedRoute.pathCoordinates.length;
    const totalDistance = selectedRoute.actualDistance || selectedRoute.distance;
    let lastIndex = 0;

    const sortedDirtSegments = (selectedRoute.dirtSegments || []).sort((a, b) => a.startKm - b.startKm);

    sortedDirtSegments.forEach(dirtSegment => {
      const startIndex = Math.floor((dirtSegment.startKm / totalDistance) * totalPoints);
      const endIndex = Math.floor((dirtSegment.endKm / totalDistance) * totalPoints);

      if (startIndex > lastIndex) {
        segments.push({
          path: selectedRoute.pathCoordinates!.slice(lastIndex, startIndex + 1),
          isDirt: false,
          style: { color: '#1e40af', weight: 6, opacity: 1 }
        });
      }

      segments.push({
        path: selectedRoute.pathCoordinates!.slice(startIndex, endIndex + 1),
        isDirt: true,
        style: { color: '#8B4513', weight: 7, opacity: 0.9, dashArray: '10, 10' }
      });

      lastIndex = endIndex;
    });

    if (lastIndex < totalPoints - 1) {
      segments.push({
        path: selectedRoute.pathCoordinates.slice(lastIndex),
        isDirt: false,
        style: { color: '#1e40af', weight: 6, opacity: 1 }
      });
    }

    if (segments.length === 0 && selectedRoute.pathCoordinates.length > 0) {
      segments.push({
        path: selectedRoute.pathCoordinates,
        isDirt: false,
        style: { color: '#1e40af', weight: 6, opacity: 1 }
      });
    }

    setRenderedSegments(segments);
  }, [selectedRoute]);

  // Funções auxiliares para ícones
  const getUnselectedRouteColor = (): string => '#94a3b8';

  const getPoiIcon = (type: 'construction' | 'danger' | 'rest' | 'gas'): L.Icon => {
    switch (type) {
      case 'construction': return constructionIcon;
      case 'danger': return dangerIcon;
      case 'rest': return restStopIcon;
      case 'gas': return gasStationIcon;
      default: return DefaultIcon;
    }
  };

  const getRiskIcon = (riskLevel: 'Baixo' | 'Médio' | 'Alto'): L.Icon => {
    switch (riskLevel) {
      case 'Baixo': return lowRiskIcon;
      case 'Médio': return mediumRiskIcon;
      case 'Alto': return highRiskIcon;
      default: return mediumRiskIcon;
    }
  };

  const handleChangeVehicle = () => {
    navigate('/select-vehicle');
  };

  const handleRefuel = (updatedVehicle: Vehicle, newBalance: number) => {
    setVehicle(updatedVehicle);
    setAvailableMoney(newBalance);
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-[#200259] flex items-center justify-center">
        <div className="text-white text-center text-2xl font-['Silkscreen']">
          Carregando dados do jogo...
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen p-4 font-['Silkscreen'] bg-[#200259]">
      <div className="absolute top-0 left-0 w-full flex items-center justify-between px-8 py-4 z-40">
        <button
          className="flex items-center px-6 py-2 bg-[#E3922A] text-black font-bold text-lg rounded-md shadow-lg
                   hover:bg-[#FFC06F] transition-all duration-200 border-2 border-black"
          onClick={handleChangeVehicle}
        >
          <ArrowLeft /> TROCAR VEÍCULOS
        </button>
        <h1 className="text-3xl font-bold text-[#E3922A] text-center flex-1 -ml-16">
          ROTAS DISPONÍVEIS
        </h1>
        <div className="bg-[#E3922A] text-black text-2xl font-bold px-6 py-2 rounded-md shadow-lg border-2 border-black">
          R$ {availableMoney.toFixed(2)}
        </div>
      </div>

      <div className="flex-1 w-full relative bg-gray-200 rounded-lg shadow-inner border-4 border-black mt-20">
        {selectedRoute && (
          <div className="absolute top-4 right-4 flex space-x-2 z-[1000]">
            <button
              className="px-4 py-2 bg-green-500 text-white font-bold text-md rounded-md shadow-lg hover:bg-green-600 transition-all duration-200 border-2 border-black"
              onClick={handleStartGame}
              disabled={isPlaying || !selectedRoute.pathCoordinates || selectedRoute.pathCoordinates.length < 2 || vehicle.currentFuel <= 0}
            >
              {isPlaying ? 'EM ANDAMENTO' : isGameActive ? 'CONTINUAR' : 'INICIAR'}
            </button>
            {isPlaying && (
              <div className="px-4 py-2 bg-white text-black font-['Silkscreen'] text-md rounded shadow-md border-2 border-black">
                Tempo: {Math.floor(simulatedTime / 60).toString().padStart(2, '0')}h:{Math.floor(simulatedTime % 60).toString().padStart(2, '0')}
              </div>
            )}
            <button
              className="px-4 py-2 bg-yellow-500 text-black font-bold text-md rounded-md shadow-lg hover:bg-yellow-600 transition-all duration-200 border-2 border-black"
              onClick={() => setIsPlaying(false)}
              disabled={!isPlaying}
            >
              PAUSAR
            </button>
          </div>
        )}

        <MapContainer
          center={juazeiroCoordinates}
          zoom={7}
          scrollWheelZoom={true}
          className="w-full h-full rounded-lg"
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapViewControl route={selectedRoute} />

          {/* Rotas não selecionadas */}
          {routesList.map((route) => {
            if (route.routeId === selectedRoute?.routeId || !route.pathCoordinates || route.pathCoordinates.length < 2) {
              return null;
            }
            return (
              <Polyline
                key={`unselected-${route.routeId}`}
                positions={route.pathCoordinates as L.LatLngExpression[]}
                pathOptions={{ color: getUnselectedRouteColor(), weight: 3, opacity: 0.3 }}
              />
            );
          })}

          {/* Rota selecionada em segmentos */}
          {renderedSegments.map((segment, index) => (
            <Polyline
              key={`segment-${selectedRoute?.routeId}-${index}`}
              positions={segment.path}
              pathOptions={segment.style}
            >
              <Popup>
                {segment.isDirt ?
                  <span className="font-bold text-yellow-800">Trecho de Terra</span> :
                  <span className="font-bold text-blue-700">{selectedRoute?.name}</span>
                }
              </Popup>
            </Polyline>
          ))}

          {/* Marcadores de velocidade */}
          {selectedRoute?.speedLimits.map((speedLimit, index) => (
            speedLimit.coordinates && (
              <Marker
                key={`speed-${selectedRoute.routeId}-${index}`}
                position={speedLimit.coordinates}
                icon={getSpeedLimitIcon(speedLimit.value ?? 60)}
              >
                <Popup>
                  <span className="font-bold">Limite de Velocidade:</span><br />
                  {speedLimit.limit} na {speedLimit.road}
                </Popup>
              </Marker>
            )
          ))}

          {/* Outros marcadores */}
          {selectedRoute?.tollBooths.map((toll, index) =>
            <Marker key={`toll-${index}`} position={toll.coordinates as L.LatLngTuple} icon={tollIcon}>
              <Popup>{toll.location}</Popup>
            </Marker>
          )}
          {selectedRoute?.dangerZones?.map((zone, index) =>
            <Marker key={`danger-${index}`} position={zone.coordinates as L.LatLngTuple} icon={getRiskIcon(zone.riskLevel)}>
              <Popup>{zone.description}</Popup>
            </Marker>
          )}

          <Marker position={juazeiroCoordinates}>
            <Popup>Ponto de Partida: Juazeiro</Popup>
          </Marker>
          <Marker position={salvadorCoordinates}>
            <Popup>Destino: Salvador</Popup>
          </Marker>

          {/* Animação do caminhão */}
          {selectedRoute?.pathCoordinates && (
            <TruckAnimation
              routePath={selectedRoute.pathCoordinates}
              speed={(selectedRoute.actualDistance || selectedRoute.distance) / selectedRoute.estimatedTimeHours}
              playing={isPlaying}
              onTripEnd={handleTripEnd}
              onFuelEmpty={handleFuelEmpty}
              onEventTriggered={handleEventTriggered}
              vehicle={vehicle}
              routeDistance={selectedRoute.actualDistance || selectedRoute.distance}
              setCurrentFuel={(fuel) => setVehicle(prev => ({ ...prev, currentFuel: fuel }))}
              isDirtRoad={selectedRoute.dirtRoad || false}
            />
          )}
        </MapContainer>
      </div>

      {/* Painel lateral */}
      <div className="lg:w-1/4 w-full p-4 rounded-lg shadow-lg overflow-y-auto mb-4 lg:mb-0 lg:ml-4 mt-20">
        <div className="bg-[#FFC06F] p-4 rounded-lg shadow-md border-2 border-black mb-6">
          <h2 className="text-xl font-['Silkscreen'] font-bold mb-3 text-black text-center border-b-2 border-black pb-2">
            COMBUSTÍVEL
          </h2>
          <p className="font-sans text-black text-lg mb-2">
            <span className="font-bold">PREÇO DO DIESEL:</span> R$ 5,50 por litro
          </p>
          <div className="bg-black h-px my-2"></div>
          <h3 className="font-['Silkscreen'] text-lg font-bold text-black mb-2">
            VEÍCULO: {vehicle.name.toUpperCase()}
          </h3>
          <p className="font-sans text-black text-md mb-1">
            - ASFALTO: {vehicle.consumption.asphalt}KM/L
          </p>
          <p className="font-sans text-black text-md mb-3">
            - TERRA: {vehicle.consumption.dirt}KM/L
          </p>

          <button
            className="bg-[#E3922A] text-black font-bold py-2 px-4 rounded-md w-full mb-3 shadow-md border-2 border-black hover:bg-[#FFC06F]"
            onClick={() => setShowFuelModal(true)}
          >
            ABASTECER
          </button>

          <p className="font-sans text-black text-md mb-2">NÍVEL DO TANQUE</p>
          <div className="w-full bg-gray-300 rounded-full h-6 border-2 border-black">
            <div
              className="bg-green-500 h-full rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ width: `${(vehicle.currentFuel / vehicle.maxCapacity) * 100}%` }}
            >
              {vehicle.currentFuel.toFixed(0)}/{vehicle.maxCapacity}
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-['Silkscreen'] font-bold mb-4 text-white text-center border-b-2 border-white pb-2">
          ESCOLHA UMA ROTA
        </h2>

        {routesList.map((route) => (
          <div
            key={route.routeId}
            className={`p-4 mb-3 rounded-lg cursor-pointer transition-all duration-200
              ${selectedRoute?.routeId === route.routeId ? 'bg-yellow-400 border-4 border-black ring-4 ring-yellow-500' : 'bg-white border-2 border-black hover:bg-gray-200'}
              shadow-md`}
            onClick={() => handleSelectRoute(route.routeId)}
          >
            <h3 className="font-['Silkscreen'] font-bold text-2xl text-black mb-1">{route.name}</h3>
            <p className="font-sans text-black text-lg">
              <span className="font-bold">TEMPO ESTIMADO:</span> {route.estimatedTime}
            </p>
            <p className="font-sans text-black text-lg">
              <span className="font-bold">DISTÂNCIA:</span> {route.actualDistance ? `${route.actualDistance.toFixed(0)}` : route.distance} km
            </p>
            <p className="font-sans text-black text-lg flex items-center">
              <span className="font-bold">RISCO ENVOLVIDO:</span>
              <span className={`${route.safety.robberyRisk === 'Baixo' ? 'text-green-800' : 'text-red-800'} ml-1`}>
                {route.safety.robberyRisk} {route.safety.robberyRisk === 'Baixo' ? '✅' : '⚠️'}
              </span>
            </p>
          </div>
        ))}
      </div>

      {/* Modais */}
      {showEventModal && activeEvent && (
        <EventModal
          event={activeEvent}
          onRespond={(optionId) => respondToEventMutation.mutate(optionId)}
          isResponding={respondToEventMutation.isPending}
        />
      )}

      {showGameOverModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999] p-4">
          <div className="bg-[#200259] rounded-lg shadow-2xl border-4 border-red-500 max-w-md w-full p-6">
            <h1 className="text-2xl font-['Silkscreen'] font-bold text-red-500 text-center mb-4">
              FIM DE JOGO!
            </h1>
            <p className="text-xl font-['Silkscreen'] text-white text-center mb-6">
              {gameOverReason === 'combustível' ? 'Seu combustível acabou!' : 'Viagem interrompida!'}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setShowGameOverModal(false);
                  navigate('/select-vehicle');
                }}
                className="px-6 py-3 bg-red-500 text-white font-bold rounded-md shadow-lg border-2 border-black hover:bg-red-600 transition-all duration-200"
              >
                VOLTAR AO INÍCIO
              </button>
            </div>
          </div>
        </div>
      )}

      {showFuelModal && (
        <FuelModal
          vehicle={vehicle}
          availableMoney={availableMoney}
          onRefuel={handleRefuel}
          onClose={() => setShowFuelModal(false)}
        />
      )}
    </div>
  );
};