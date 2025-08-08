import React, { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Vehicle } from '../../types/vehicle';

// Configuração do ícone padrão do Leaflet
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

interface GameMiniMapProps {
  pathCoordinates: [number, number][];
  currentPathIndex: number;
  pathProgress: number; // 0-1 progresso dentro do segmento atual
  vehicle: Vehicle;
  progress: number; // Progresso total em porcentagem
  className?: string;
}

// Componente para atualizar a posição do caminhão
const TruckMarker: React.FC<{
  pathCoordinates: [number, number][];
  currentPathIndex: number;
  pathProgress: number;
  vehicle: Vehicle;
}> = ({ pathCoordinates, currentPathIndex, pathProgress, vehicle }) => {
  const markerRef = useRef<L.Marker>(null);

  // Ícone personalizado do veículo
  const vehicleIcon = useMemo(() => {
    // Converter URL da imagem para uso no mapa
    let imageUrl = vehicle.image;
    if (imageUrl.startsWith('/src/assets/')) {
      imageUrl = imageUrl.replace('/src/assets/', '/assets/');
    }
    if (!imageUrl.startsWith('/assets/') && !imageUrl.startsWith('http')) {
      imageUrl = `/assets/${imageUrl.split('/').pop()}`;
    }

    return L.icon({
      iconUrl: imageUrl,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15]
    });
  }, [vehicle.image]);

  // Calcular posição atual do caminhão
  const currentPosition = useMemo(() => {
    if (!pathCoordinates || pathCoordinates.length < 2) {
      return pathCoordinates?.[0] || [0, 0];
    }

    const totalSegments = pathCoordinates.length - 1;
    
    // Garantir que o índice esteja dentro dos limites
    const segmentIndex = Math.min(currentPathIndex, totalSegments - 1);
    const nextIndex = Math.min(segmentIndex + 1, totalSegments);
    
    const startPoint = pathCoordinates[segmentIndex];
    const endPoint = pathCoordinates[nextIndex];
    
    // Interpolar entre os dois pontos com progresso suavizado
    const smoothProgress = Math.min(Math.max(0, pathProgress), 1);
    const lat = startPoint[0] + (endPoint[0] - startPoint[0]) * smoothProgress;
    const lng = startPoint[1] + (endPoint[1] - startPoint[1]) * smoothProgress;
    
    return [lat, lng] as [number, number];
  }, [pathCoordinates, currentPathIndex, pathProgress]);

  // Atualizar posição do marcador com transição suave
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng(currentPosition);
    }
  }, [currentPosition]);

  return (
    <Marker
      position={currentPosition}
      icon={vehicleIcon}
      ref={markerRef}
    />
  );
};

// Componente para mostrar a direção do caminhão
const TruckDirection: React.FC<{
  pathCoordinates: [number, number][];
  currentPathIndex: number;
  pathProgress: number;
}> = ({ pathCoordinates, currentPathIndex, pathProgress }) => {
  const directionPosition = useMemo(() => {
    if (!pathCoordinates || pathCoordinates.length < 2) {
      return null;
    }

    const totalSegments = pathCoordinates.length - 1;
    const segmentIndex = Math.min(currentPathIndex, totalSegments - 1);
    const nextIndex = Math.min(segmentIndex + 1, totalSegments);
    
    const startPoint = pathCoordinates[segmentIndex];
    const endPoint = pathCoordinates[nextIndex];
    
    // Calcular posição atual
    const smoothProgress = Math.min(Math.max(0, pathProgress), 1);
    const currentLat = startPoint[0] + (endPoint[0] - startPoint[0]) * smoothProgress;
    const currentLng = startPoint[1] + (endPoint[1] - startPoint[1]) * smoothProgress;
    
    // Calcular direção (próximo ponto)
    const directionLat = startPoint[0] + (endPoint[0] - startPoint[0]) * Math.min(smoothProgress + 0.1, 1);
    const directionLng = startPoint[1] + (endPoint[1] - startPoint[1]) * Math.min(smoothProgress + 0.1, 1);
    
    return {
      current: [currentLat, currentLng] as [number, number],
      direction: [directionLat, directionLng] as [number, number]
    };
  }, [pathCoordinates, currentPathIndex, pathProgress]);

  if (!directionPosition) return null;

  return (
    <>
      {/* Linha de direção */}
      <Polyline
        positions={[directionPosition.current, directionPosition.direction]}
        pathOptions={{
          color: '#ff6b35',
          weight: 3,
          opacity: 0.8,
          dashArray: '5,5'
        }}
      />
    </>
  );
};

// Componente para ajustar automaticamente o zoom do mapa
const MapViewAdjuster: React.FC<{ pathCoordinates: [number, number][] }> = ({ pathCoordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (pathCoordinates && pathCoordinates.length > 1) {
      const bounds = L.latLngBounds(pathCoordinates);
      map.fitBounds(bounds, { padding: [10, 10] });
    }
  }, [map, pathCoordinates]);

  return null;
};

export const GameMiniMap: React.FC<GameMiniMapProps> = ({
  pathCoordinates,
  currentPathIndex,
  pathProgress,
  vehicle,
  progress,
  className = ""
}) => {
  // Se não há coordenadas da rota, não renderizar o mapa
  if (!pathCoordinates || pathCoordinates.length < 2) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-800 text-white text-sm`}>
        <div className="text-center">
          <div>📍 Mapa</div>
          <div>Indisponível</div>
        </div>
      </div>
    );
  }

  // Coordenadas de início e fim
  const startCoord = pathCoordinates[0];
  const endCoord = pathCoordinates[pathCoordinates.length - 1];

  return (
    <div className={className} style={{ position: 'relative' }}>
      {/* ✅ MELHORIA: Overlay com informações de progresso */}
      <div style={{
        position: 'absolute',
        top: '5px',
        left: '5px',
        right: '5px',
        zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        textAlign: 'center',
        fontFamily: "'Silkscreen', monospace"
      }}>
        <div>{progress.toFixed(1)}% Concluído</div>
      </div>

      <MapContainer
        center={startCoord}
        zoom={10}
        scrollWheelZoom={false}
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        style={{ width: '100%', height: '100%', borderRadius: '50%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Ajustar visualização automaticamente */}
        <MapViewAdjuster pathCoordinates={pathCoordinates} />
        
        {/* Desenhar a rota completa */}
        <Polyline
          positions={pathCoordinates}
          pathOptions={{
            color: '#0077cc',
            weight: 4,
            opacity: 0.7
          }}
        />
        
        {/* Parte da rota já percorrida */}
        {currentPathIndex > 0 && (
          <Polyline
            positions={pathCoordinates.slice(0, currentPathIndex + 1)}
            pathOptions={{
              color: '#00cc66',
              weight: 5,
              opacity: 0.9
            }}
          />
        )}
        
        {/* Marcadores de início e fim */}
        <Marker
          position={startCoord}
          icon={L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })}
        />
        
        <Marker
          position={endCoord}
          icon={L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684879.png',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })}
        />
        
        {/* Caminhão na posição atual */}
        <TruckMarker
          pathCoordinates={pathCoordinates}
          currentPathIndex={currentPathIndex}
          pathProgress={pathProgress}
          vehicle={vehicle}
        />

        {/* Direção do caminhão */}
        <TruckDirection
          pathCoordinates={pathCoordinates}
          currentPathIndex={currentPathIndex}
          pathProgress={pathProgress}
        />
      </MapContainer>
    </div>
  );
}; 