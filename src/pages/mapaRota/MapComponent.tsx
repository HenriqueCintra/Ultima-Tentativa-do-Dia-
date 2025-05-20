// src/MapComponent.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { routes, Route, parseEstimatedTime } from './routesData'; // Importa as rotas e a função do arquivo

// --- Correção para o ícone padrão do Leaflet --- aa
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
// --- Fim da Correção do Ícone ---

// --- Ícone Personalizado do Caminhão ---
import truckIconSvg from '@/assets/truck-solid.svg'; // Caminho para o ícone SVG do caminhão

const truckIcon = L.icon({
  iconUrl: truckIconSvg,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

// --- Ícones de POI ---
const tollIcon = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/2852/2852936.png', iconSize: [30, 30], iconAnchor: [15, 15] });
const dangerIcon = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/2870/2870420.png', iconSize: [30, 30], iconAnchor: [15, 15] });
const restStopIcon = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/3233/3233066.png', iconSize: [30, 30], iconAnchor: [15, 15] });
const constructionIcon = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/1000/1000494.png', iconSize: [30, 30], iconAnchor: [15, 15] });
const gasStationIcon = L.icon({ iconUrl: 'https://cdn-icons-png.flaticon.com/512/2950/2950942.png', iconSize: [30, 30], iconAnchor: [15, 15] });

// Componente para animar o caminhão
interface TruckAnimationProps {
  routePath: [number, number][];
  speed: number; // Velocidade média em km/h
  playing: boolean;
  onTripEnd: () => void;
}

const TruckAnimation: React.FC<TruckAnimationProps> = ({ routePath, speed, playing, onTripEnd }) => {
  const truckRef = useRef<L.Marker>(null);
  const animationFrameRef = useRef<number>(0);
  const currentSegment = useRef<number>(0);
  const segmentProgress = useRef<number>(0); // 0.0 to 1.0

  const animateTruck = useCallback(() => {
    if (!playing || !truckRef.current || !routePath || routePath.length < 2) {
      animationFrameRef.current = requestAnimationFrame(animateTruck);
      return;
    }

    const nextSegmentIndex = currentSegment.current;
    const startPoint = routePath[nextSegmentIndex];
    const endPoint = routePath[nextSegmentIndex + 1];

    if (!endPoint) {
      // Fim da rota
      truckRef.current.setLatLng(L.latLng(routePath[routePath.length - 1][0], routePath[routePath.length - 1][1]));
      onTripEnd();
      return;
    }

    const segmentLatLng1 = L.latLng(startPoint[0], startPoint[1]);
    const segmentLatLng2 = L.latLng(endPoint[0], endPoint[1]);
    const segmentDistanceKm = segmentLatLng1.distanceTo(segmentLatLng2) / 1000;

    // Calcula a duração do segmento em milissegundos
    const segmentDurationMs = (segmentDistanceKm / speed) * 3600 * 1000;
    if (segmentDurationMs <= 0) { // Evita divisão por zero ou loop infinito para segmentos curtos
      currentSegment.current++;
      segmentProgress.current = 0;
      animationFrameRef.current = requestAnimationFrame(animateTruck);
      return;
    }

    const progressIncrement = (1000 / 60) / segmentDurationMs; // Incremento por frame (aprox 60fps)

    segmentProgress.current += progressIncrement;

    if (segmentProgress.current >= 1.0) {
      segmentProgress.current = 0;
      currentSegment.current++;
      if (currentSegment.current >= routePath.length - 1) {
        // Chegou ao último ponto da rota
        truckRef.current.setLatLng(L.latLng(routePath[routePath.length - 1][0], routePath[routePath.length - 1][1]));
        onTripEnd();
        return;
      }
    }

    const newLat = startPoint[0] + (endPoint[0] - startPoint[0]) * segmentProgress.current;
    const newLng = startPoint[1] + (endPoint[1] - startPoint[1]) * segmentProgress.current;
    const newPosition = L.latLng(newLat, newLng);

    truckRef.current.setLatLng(newPosition);
    animationFrameRef.current = requestAnimationFrame(animateTruck);
  }, [playing, routePath, speed, onTripEnd]);

  useEffect(() => {
    if (playing && routePath && routePath.length > 1) {
      // Inicia o caminhão no primeiro ponto da rota
      truckRef.current?.setLatLng(L.latLng(routePath[0][0], routePath[0][1]));
      currentSegment.current = 0;
      segmentProgress.current = 0;
      animationFrameRef.current = requestAnimationFrame(animateTruck);
    } else {
      cancelAnimationFrame(animationFrameRef.current as number);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [playing, routePath, animateTruck]);

  if (!routePath || routePath.length === 0) return null;

  return (
    <Marker
      position={L.latLng(routePath[0][0], routePath[0][1])} // Posição inicial do marcador
      icon={truckIcon}
      ref={truckRef}
    >
      <Popup>Caminhão em viagem!</Popup>
    </Marker>
  );
};

export const MapComponent = () => {
  const juazeiroCoordinates: [number, number] = [-9.44977115369502, -40.52422616182216];
  const salvadorCoordinates: [number, number] = [-12.954121960174133, -38.47128319030249];

  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [routesList] = useState<Route[]>(routes); // routesList now initialized directly from imported 'routes'

  // Centraliza o mapa nos pontos inicial e final da rota selecionada
  function MapViewControl({ route }: { route: Route | null }) {
    const map = useMapEvents({});

    useEffect(() => {
      if (route && route.pathCoordinates && route.pathCoordinates.length > 1) {
        const bounds = L.latLngBounds(route.pathCoordinates);
        map.fitBounds(bounds, { padding: [50, 50] }); // Ajusta o zoom para caber a rota
      } else if (!route) {
        // Se nenhuma rota estiver selecionada, centraliza em Juazeiro/Salvador
        const bounds = L.latLngBounds(juazeiroCoordinates, salvadorCoordinates);
        map.fitBounds(bounds, { padding: [100, 100] });
      }
    }, [map, route]); // No need to include juazeiroCoordinates or salvadorCoordinates as they are constants
    return null;
  }

  const handleSelectRoute = useCallback((routeId: number) => {
    const routeToSelect = routesList.find(r => r.routeId === routeId);
    if (routeToSelect) {
      setSelectedRoute(routeToSelect);
      setIsPlaying(false); // Stop any ongoing animation when a new route is selected
    }
  }, [routesList]);

  const handleTripEnd = useCallback(() => {
    setIsPlaying(false);
    alert('Viagem concluída!');
    // Optional: reset truck position or selected route if desired
  }, []);

  // Calcula o custo total da rota (pedágios + combustível)
  const calculateTotalCost = (route: Route): number => {
    const totalToll = route.tollBooths.reduce((sum, toll) => sum + toll.totalCost, 0);
    // Usa a distância atualizada pela API se disponível, senão a distância estática
    const dist = route.actualDistance || route.distance;
    const totalFuelCost = dist * route.fuelCostPerKm;
    return totalToll + totalFuelCost;
  };

  // Determinar a cor da rota com base nas condições
  const getRouteColor = (route: Route, isSelected: boolean): string => {
    if (isSelected) {
      return '#1e40af'; // Azul escuro mais forte
    }
    return '#94a3b8'; // Cinza claro para rotas não selecionadas
  };

  // Ícone para POI
  const getPoiIcon = (type: 'construction' | 'danger' | 'rest' | 'gas'): L.Icon => {
    switch (type) {
      case 'construction': return constructionIcon;
      case 'danger': return dangerIcon;
      case 'rest': return restStopIcon;
      case 'gas': return gasStationIcon;
      default: return DefaultIcon; // Fallback
    }
  };

 return (
  <div className="flex flex-col lg:flex-row h-screen p-4 font-['Silkscreen'] bg-[#200259]">
    {/* Cabeçalho superior - "Rotas Disponíveis" e Saldo */}
    <div className="absolute top-0 left-0 w-full flex items-center justify-between px-8 py-4 z-50">
      {/* Botão TROCAR CARRO */}
      <button
        className="flex items-center px-6 py-2 bg-[#E3922A] text-black font-bold text-lg rounded-md shadow-lg
                   hover:bg-[#FFC06F] transition-all duration-200 border-2 border-black"
        onClick={() => alert('Funcionalidade "Trocar Carro" ainda não implementada!')} // Substitua pela sua função
      >
        <img src="/back_arrow_pixel.png" alt="Trocar Carro" className="h-5 mr-2" />
        TROCAR CARRO
      </button>

      {/* Título Rotas Disponíveis */}
      <h1 className="text-4xl font-bold text-[#E3922A] text-center flex-1 -ml-40">
        ROTAS DISPONÍVEIS
      </h1>

      {/* Saldo */}
      <div className="bg-[#E3922A] text-black text-2xl font-bold px-6 py-2 rounded-md shadow-lg border-2 border-black">
        R$ 6.500
      </div>
    </div>

    {/* Área do Mapa e Detalhes da Rota Selecionada */}
    <div className="flex-1 rounded-lg shadow-lg p-4 flex flex-col mt-24 lg:mr-4">
      {/* Botões de controle da simulação */}
      {selectedRoute && ( // Apenas exibe os botões se uma rota estiver selecionada
        <div className="flex justify-center mb-4 space-x-4">
          <button
            className="px-6 py-2 bg-green-500 text-white font-bold text-lg rounded-md shadow-lg hover:bg-green-600 transition-all duration-200 border-2 border-black"
            onClick={() => setIsPlaying(true)}
            disabled={isPlaying || !selectedRoute.pathCoordinates || selectedRoute.pathCoordinates.length < 2}
          >
            {isPlaying ? 'Viagem em Andamento...' : 'INICIAR SIMULAÇÃO'}
          </button>
          <button
            className="px-6 py-2 bg-yellow-500 text-black font-bold text-lg rounded-md shadow-lg hover:bg-yellow-600 transition-all duration-200 border-2 border-black"
            onClick={() => setIsPlaying(false)}
            disabled={!isPlaying}
          >
            PAUSAR
          </button>
          <button
            className="px-6 py-2 bg-red-500 text-white font-bold text-lg rounded-md shadow-lg hover:bg-red-600 transition-all duration-200 border-2 border-black"
            onClick={() => { setIsPlaying(false); /* Adicione lógica para resetar a simulação aqui, se necessário */ }}
          >
            REINICIAR SIMULAÇÃO
          </button>
        </div>
      )}
      {/* Contêiner do Mapa */}
      <div className="flex-1 w-full relative bg-gray-200 rounded-lg shadow-inner border-4 border-black">
        <MapContainer
          center={juazeiroCoordinates} // Centraliza em Juazeiro por padrão
          zoom={7} // Zoom inicial para ver uma área maior
          scrollWheelZoom={true}
          className="w-full h-full rounded-lg"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Controle de Visão do Mapa - ajusta o zoom e centraliza a rota selecionada */}
          <MapViewControl route={selectedRoute} />

          {selectedRoute && selectedRoute.pathCoordinates && selectedRoute.pathCoordinates.length > 1 && (
            <Polyline
              key={`selected-${selectedRoute.routeId}`}
              positions={selectedRoute.pathCoordinates}
              color={getRouteColor(selectedRoute, true)}
              weight={6}
              opacity={1}
              dashArray={selectedRoute.dirtRoad ? '5, 10' : undefined}
            >
              <Popup>
                <div className="font-bold text-blue-700">{selectedRoute.name}</div>
                <div>Distância: {selectedRoute.actualDistance ? `${selectedRoute.actualDistance.toFixed(0)}` : selectedRoute.distance} km</div>
                <div>Tempo: {parseEstimatedTime(selectedRoute.estimatedTime)} horas</div>
                <div>Risco: {selectedRoute.safety.robberyRisk}</div>
                <div>Condição: {selectedRoute.roadConditions}</div>
                {selectedRoute.dirtRoad && <div className="text-red-600">Estrada de Terra</div>}
              </Popup>
            </Polyline>
          )}

          {/* Renderizar TODAS as rotas para contexto, mas destacar a selecionada */}
          {routesList.map((route) => {
            if (route.routeId === selectedRoute?.routeId || !route.pathCoordinates || route.pathCoordinates.length < 2) {
              return null;
            }

            return (
              <Polyline
                key={route.routeId}
                positions={route.pathCoordinates}
                color={getRouteColor(route, false)}
                weight={3}
                opacity={0.3}
                dashArray={route.dirtRoad ? '5, 10' : undefined}
              >
                <Popup>
                  <div className="font-bold text-blue-700">{route.name}</div>
                  <div>Distância: {route.actualDistance ? `${route.actualDistance.toFixed(0)}` : route.distance} km</div>
                  <div>Tempo: {parseEstimatedTime(route.estimatedTime)} horas</div>
                  <div>Risco: {route.safety.robberyRisk}</div>
                  <div>Condição: {route.roadConditions}</div>
                  {route.dirtRoad && <div className="text-red-600">Estrada de Terra</div>}
                </Popup>
              </Polyline>
            );
          })}

          {/* Marcadores de Pedágio para a Rota Selecionada */}
          {selectedRoute?.tollBooths.map((toll, index) => (
            <Marker key={`toll-${selectedRoute.routeId}-${index}`} position={toll.coordinates} icon={tollIcon}>
              <Popup>
                <span className="font-bold">Pedágio:</span> {toll.location}<br />
                Custo por eixo: R$ {toll.costPerAxle.toFixed(2)}
              </Popup>
            </Marker>
          ))}

          {/* Marcadores de POIs para a Rota Selecionada */}
          {selectedRoute?.pois && selectedRoute.pois.map((poi, index) => (
            <Marker key={`poi-${selectedRoute.routeId}-${index}`} position={poi.coordinates} icon={getPoiIcon(poi.type)}>
              <Popup>
                <span className="font-bold">{poi.location} ({poi.type === 'construction' ? 'Obra' : poi.type === 'danger' ? 'Perigo' : poi.type === 'rest' ? 'Descanso' : 'Combustível'})</span><br />
                {poi.description}
              </Popup>
            </Marker>
          ))}

          {/* Marcadores de Início e Fim (sempre visíveis) */}
          <Marker position={juazeiroCoordinates}>
            <Popup><span className="font-bold">Juazeiro</span><br />(Ponto de Partida)</Popup>
          </Marker>
          <Marker position={salvadorCoordinates}>
            <Popup><span className="font-bold">Salvador</span><br />(Destino)</Popup>
          </Marker>

          {/* Animação do Caminhão na Rota Selecionada */}
          {selectedRoute && isPlaying && selectedRoute.pathCoordinates && selectedRoute.pathCoordinates.length > 1 && (
            <TruckAnimation
              routePath={selectedRoute.pathCoordinates}
              // Use a duração real (em segundos) se disponível, senão a estimada em horas
              speed={(selectedRoute.actualDistance || selectedRoute.distance) / (selectedRoute.actualDuration ? selectedRoute.actualDuration / 3600 : parseEstimatedTime(selectedRoute.estimatedTime))} // Velocidade média em km/h
              playing={isPlaying}
              onTripEnd={handleTripEnd}
            />
          )}
        </MapContainer>
      </div>
    </div>

    {/* Menu Lateral (Painel de Combustível e Seleção de Rotas) */}
    <div className="lg:w-1/4 w-full p-4 rounded-lg shadow-lg overflow-y-auto mb-4 lg:mb-0 lg:ml-4 mt-24"> {/* Alterado para lg:ml-4 para alinhar à direita */}
      {/* Painel de Combustível */}
      <div className="bg-[#FFC06F] p-4 rounded-lg shadow-md border-2 border-black mb-6">
        <h2 className="text-2xl font-['Silkscreen'] font-bold mb-3 text-black text-center border-b-2 border-black pb-2">
          COMBUSTÍVEL
        </h2>
        <p className="font-sans text-black text-lg mb-2"> {/* Fonte normal para o conteúdo */}
          <span className="font-bold">CUSTO COMBUSTÍVEL:</span> R$ 6,00 por litro
        </p>
        <div className="bg-black h-px my-2"></div> {/* Linha divisória pixelada */}
        <h3 className="font-['Silkscreen'] text-lg font-bold text-black mb-2">VEÍCULO: CARRETA</h3> {/* Fonte pixelada para o título */}
        <p className="font-sans text-black text-md mb-1">- ASFALTO: 2KM/L</p> {/* Fonte normal para o conteúdo */}
        <p className="font-sans text-black text-md mb-3">- TERRA: 2KM/L</p> {/* Fonte normal para o conteúdo */}

        <button className="bg-[#E3922A] text-black font-bold py-2 px-4 rounded-md w-full mb-3 shadow-md border-2 border-black hover:bg-[#FFC06F]">
          ABASTECER
        </button>

        <p className="font-sans text-black text-md mb-2">CAPACIDADE(L)</p> {/* Fonte normal para o conteúdo */}
        <div className="w-full bg-gray-300 rounded-full h-6 border-2 border-black">
          <div
            className="bg-green-500 h-full rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ width: `${(220 / 495) * 100}%` }} // Exemplo: 220/495 litros
          >
            220/495
          </div>
        </div>
      </div>

      {/* Título "ESCOLHA UMA ROTA" */}
      <h2 className="text-2xl font-['Silkscreen'] font-bold mb-4 text-white text-center border-b-2 border-white pb-2"> {/* Título em branco com fonte pixelada */}
        ESCOLHA UMA ROTA
      </h2>

      {/* Lista de Rotas */}
      {routesList.map((route) => (
        <div
          key={route.routeId}
          className={`p-4 mb-3 rounded-lg cursor-pointer transition-all duration-200
            ${selectedRoute?.routeId === route.routeId ? 'bg-yellow-400 border-4 border-black ring-4 ring-yellow-500' : 'bg-white border-2 border-black hover:bg-gray-200'}
            shadow-md`}
          onClick={() => handleSelectRoute(route.routeId)}
        >
          <h3 className="font-['Silkscreen'] font-bold text-2xl text-black mb-1">{route.name}</h3> {/* Título da rota pixelado */}
          <p className="font-sans text-black text-lg"> {/* Informações da rota normal */}
            <span className="font-bold">TEMPO ESTIMADO:</span> {route.estimatedTime}
          </p>
          <p className="font-sans text-black text-lg">
            <span className="font-bold">DISTÂNCIA:</span>{" "}
            {route.actualDistance ? `${route.actualDistance.toFixed(0)}` : route.distance} km
          </p>
          <p className="font-sans text-black text-lg flex items-center">
            <span className="font-bold">RISCO ENVOLVIDO:</span>{" "}
            {/* Ícone de pneu furado ou similar se houver risco */}
            <span className={`${route.safety.robberyRisk == 'Baixo' ? 'text-red-800' : 'text-green-800'} ml-1`}>
              PNEU FURAR {route.safety.roadHazards}% {route.safety.roadHazards =='Baixo' ? '⚠️': '✅'}
            </span>
          </p>
        </div>
      ))}
    </div>
  </div>
);
};