// components/TruckMarkerSync.tsx
import React, { useEffect, useMemo, useRef } from 'react';
import { Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Vehicle } from '../types/vehicle';

// Configurações do caminhão no mapa
const SHOW_TRUCK_DIRECTION = true;
const TRUCK_SPEED_FACTOR = 0.002; // Fator de desaceleração (quanto menor, mais lento o caminhão se move)

interface TruckMarkerSyncProps {
  pathCoordinates: [number, number][];
  currentPathIndex: number;
  pathProgress: number; // 0-1
  totalProgress: number; // 0-100
  vehicle: Vehicle;
  showPopup?: boolean;
  iconSize?: [number, number];
  showDirection?: boolean;
}

export const TruckMarkerSync: React.FC<TruckMarkerSyncProps> = ({
  pathCoordinates,
  currentPathIndex,
  pathProgress,
  totalProgress,
  vehicle,
  showPopup = true,
  iconSize = [40, 40],
   showDirection = SHOW_TRUCK_DIRECTION
}) => {
  const markerRef = useRef<L.Marker>(null);

  // Ícone personalizado do veículo
  const vehicleIcon = useMemo(() => {
    let imageUrl = vehicle.image;
    
    // Normalizar URL da imagem
    if (imageUrl.startsWith('/src/assets/')) {
      imageUrl = imageUrl.replace('/src/assets/', '/assets/');
    }
    if (!imageUrl.startsWith('/assets/') && !imageUrl.startsWith('http')) {
      const fileName = imageUrl.split('/').pop() || 'truck.png';
      imageUrl = `/assets/${fileName}`;
    }

    return L.icon({
      iconUrl: imageUrl,
      iconSize: iconSize,
      iconAnchor: [iconSize[0] / 2, iconSize[1] / 2],
      popupAnchor: [0, -iconSize[1] / 2]
    });
  }, [vehicle.image, iconSize]);

  // Calcular posição atual com validação robusta
  const currentPosition = useMemo(() => {
    // Validações básicas
    if (!pathCoordinates || pathCoordinates.length < 2) {
      return pathCoordinates?.[0] || [0, 0];
    }

    const totalSegments = pathCoordinates.length - 1;
    
    // Garantir índices válidos
    const safeIndex = Math.max(0, Math.min(currentPathIndex, totalSegments - 1));
    const nextIndex = Math.min(safeIndex + 1, totalSegments);
    
    // Garantir progresso válido
    // Aplicar o fator de desaceleração ao progresso
    const adjustedProgress = (pathProgress || 0) * TRUCK_SPEED_FACTOR;
    const safeProgress = Math.max(0, Math.min(adjustedProgress, 1));
    
    const startPoint = pathCoordinates[safeIndex];
    const endPoint = pathCoordinates[nextIndex];
    
    // Validar pontos
    if (!startPoint || !endPoint) {
      console.warn("Pontos inválidos detectados:", { safeIndex, nextIndex, startPoint, endPoint });
      return pathCoordinates[0] || [0, 0];
    }
    
    // Interpolar entre os pontos
    const lat = startPoint[0] + (endPoint[0] - startPoint[0]) * safeProgress;
    const lng = startPoint[1] + (endPoint[1] - startPoint[1]) * safeProgress;
    
    return [lat, lng] as [number, number];
  }, [pathCoordinates, currentPathIndex, pathProgress]);

  // Calcular direção para rotação do ícone (opcional)
  const truckRotation = useMemo(() => {
    if (!showDirection || !pathCoordinates || pathCoordinates.length < 2) {
      return 0;
    }

    const totalSegments = pathCoordinates.length - 1;
    const safeIndex = Math.max(0, Math.min(currentPathIndex, totalSegments - 1));
    const nextIndex = Math.min(safeIndex + 1, totalSegments);
    
    const startPoint = pathCoordinates[safeIndex];
    const endPoint = pathCoordinates[nextIndex];
    
    if (!startPoint || !endPoint) return 0;
    
    // Calcular ângulo entre dois pontos
    const deltaLng = endPoint[1] - startPoint[1];
    const deltaLat = endPoint[0] - startPoint[0];
    const angle = Math.atan2(deltaLng, deltaLat) * (180 / Math.PI);
    
    return angle;
  }, [pathCoordinates, currentPathIndex, showDirection]);

  // Atualizar posição do marcador suavemente (sem acumular rotações)
  useEffect(() => {
    if (markerRef.current) {
      const newLatLng = L.latLng(currentPosition[0], currentPosition[1]);
      markerRef.current.setLatLng(newLatLng);
      
      // Aplicar rotação se necessário
      if (showDirection && truckRotation !== 0) {
        const element = markerRef.current.getElement();
        if (element) {
          // Preservar o translate do Leaflet e substituir qualquer rotate anterior
          const prev = element.style.transform || '';
          const withoutRotate = prev.replace(/\s*rotate\([^)]*\)/, '');
          element.style.transform = `${withoutRotate} rotate(${truckRotation}deg)`;
        }
      }
    }
  }, [currentPosition, truckRotation, showDirection]);

  // Log para debug (remover em produção)
  useEffect(() => {
    console.log("🚛 TruckMarkerSync atualizado:", {
      currentPathIndex,
      pathProgress: (pathProgress * 100).toFixed(1) + "%",
      totalProgress: totalProgress.toFixed(1) + "%",
      position: `[${currentPosition[0].toFixed(6)}, ${currentPosition[1].toFixed(6)}]`,
      pathLength: pathCoordinates?.length || 0
    });
  }, [currentPathIndex, pathProgress, totalProgress, currentPosition, pathCoordinates?.length]);

  return (
    <Marker
      position={currentPosition}
      icon={vehicleIcon}
      ref={markerRef}
    >
      {showPopup && (
        <Popup>
          <div className="text-sm font-mono">
            <p className="font-bold text-blue-600">🚛 {vehicle.name}</p>
            <div className="mt-2 space-y-1">
              <p><strong>Progresso Total:</strong> {totalProgress.toFixed(1)}%</p>
              <p><strong>Segmento:</strong> {currentPathIndex + 1}/{pathCoordinates?.length - 1 || 0}</p>
              <p><strong>Progresso do Segmento:</strong> {(pathProgress * 100).toFixed(1)}%</p>
              <p><strong>Posição:</strong> [{currentPosition[0].toFixed(4)}, {currentPosition[1].toFixed(4)}]</p>
              {vehicle.currentFuel !== undefined && (
                <p><strong>Combustível:</strong> {Math.round(vehicle.currentFuel)}/{vehicle.maxCapacity}L</p>
              )}
            </div>
          </div>
        </Popup>
      )}
    </Marker>
  );
};

// Versão otimizada para o minimapa
export const TruckMarkerMini: React.FC<Omit<TruckMarkerSyncProps, 'showPopup' | 'iconSize'>> = (props) => {
  return (
    <TruckMarkerSync
      {...props}
      showPopup={false}
      iconSize={[20, 20]}
    />
  );
};

// Componente para mostrar linha do progresso percorrido
interface ProgressLineProps {
  pathCoordinates: [number, number][];
  currentPathIndex: number;
  pathProgress: number;
  totalProgress: number;
  color?: string;
  weight?: number;
}

export const ProgressLine: React.FC<ProgressLineProps> = ({
  pathCoordinates,
  currentPathIndex,
  pathProgress,
  totalProgress,
  color = '#00cc66',
  weight = 5
}) => {
  const progressPath = useMemo(() => {
    if (!pathCoordinates || pathCoordinates.length < 2 || totalProgress <= 0) {
      return [];
    }

    const segments = pathCoordinates.length - 1;
    const progressIndex = Math.min(currentPathIndex, segments - 1);
    
    // Caminho base até o segmento atual
    const basePath = pathCoordinates.slice(0, Math.max(1, progressIndex + 1));
    
    // Se há progresso no segmento atual, adicionar ponto interpolado
    if (pathProgress > 0 && progressIndex < segments) {
      const startPoint = pathCoordinates[progressIndex];
      const endPoint = pathCoordinates[progressIndex + 1];
      
      if (startPoint && endPoint) {
        const adjustedProgress = pathProgress * TRUCK_SPEED_FACTOR;
        const interpolatedLat = startPoint[0] + (endPoint[0] - startPoint[0]) * adjustedProgress;
        const interpolatedLng = startPoint[1] + (endPoint[1] - startPoint[1]) * adjustedProgress;
        
        return [...basePath, [interpolatedLat, interpolatedLng] as [number, number]];
      }
    }
    
    return basePath;
  }, [pathCoordinates, currentPathIndex, pathProgress, totalProgress]);

  if (progressPath.length < 2) return null;

  return (
    <Polyline
      positions={progressPath}
      pathOptions={{
        color: color,
        weight: weight,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round'
      }}
    />
  );
};