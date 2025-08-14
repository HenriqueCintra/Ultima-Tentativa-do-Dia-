import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  Tooltip,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Route } from "./routesData";
import { useLocation, useNavigate } from "react-router-dom";
import { Vehicle } from "../../types/vehicle";
import { ArrowLeft, Fuel } from "lucide-react";
import { GameService } from "../../api/gameService";
import {
  calculatePositionFromProgress,
  calculatePathFromProgress,
} from "../../utils/mapUtils";
import defaultIcon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: defaultIcon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface StaticTruckMarkerProps {
  routePath: [number, number][];
  totalProgress: number;
  vehicle: Vehicle;
}

// --- Ícones (sem alterações) ---
const tollIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2297/2297592.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const dangerIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1008/1008928.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const restStopIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/6807/6807796.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const constructionIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/4725/4725077.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const gasStationIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/465/465090.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const lowRiskIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/6276/6276686.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const mediumRiskIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/4751/4751259.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const highRiskIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/900/900532.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const speedLimitIcon20 = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/1670/1670172.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const speedLimitIcon40 = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/5124/5124881.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const speedLimitIcon50 = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/752/752738.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const speedLimitIcon60 = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/15674/15674424.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const speedLimitIcon80 = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3897/3897785.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const speedLimitIcon100 = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/10392/10392769.png",
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});
const getSpeedLimitIcon = (speed: number): L.Icon => {
  /* ... (código inalterado) ... */ return speedLimitIcon60;
};

// --- Outros componentes (sem alterações) ---
interface RenderSegment {
  /* ... */
}
interface TruckAnimationProps {
  /* ... */
}
const TruckAnimation: React.FC<TruckAnimationProps> = (props) => {
  /* ... (código inalterado) ... */ return null;
};
const StaticTruckMarker: React.FC<StaticTruckMarkerProps> = (props) => {
  /* ... (código inalterado) ... */ return null;
};

interface MapComponentProps {
  preSelectedRoute?: Route | null;
  preSelectedVehicle?: Vehicle | null;
  preAvailableMoney?: number;
  showControls?: boolean;
  externalProgress?: {
    currentPathIndex: number;
    pathProgress: number;
    totalProgress: number;
  };
}

export const MapComponent: React.FC<MapComponentProps> = ({
  preSelectedRoute = null,
  preSelectedVehicle = null,
  preAvailableMoney = null,
  showControls = true,
  externalProgress = null,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const juazeiroCoordinates: [number, number] = [
    -9.44977115369502, -40.52422616182216,
  ];
  const salvadorCoordinates: [number, number] = [
    -12.954121960174133, -38.47128319030249,
  ];

  // CORREÇÃO 1: Usar optional chaining (?.) para acessar `location.state` de forma segura.
  const selectedRoute = useMemo(() => {
    return preSelectedRoute ?? location.state?.selectedRoute ?? null;
  }, [preSelectedRoute, location.state?.selectedRoute]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(() => {
    return preSelectedVehicle ?? location.state?.selectedVehicle ?? null;
  });

  // CORREÇÃO 2: Adicionar um useEffect que redireciona se o veículo não existir.
  useEffect(() => {
    if (showControls && !vehicle) {
      console.error(
        "Nenhum veículo selecionado. Redirecionando para a seleção de veículo."
      );
      navigate("/select-vehicle");
    }
  }, [vehicle, showControls, navigate]);

  const [availableMoney] = useState<number>(() => {
    return preAvailableMoney ?? location.state?.availableMoney ?? 5500;
  });

  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [gameOverReason, setGameOverReason] = useState("");
  const [initialMapViewSet, setInitialMapViewSet] = useState(false);
  const [renderedSegments, setRenderedSegments] = useState<RenderSegment[]>([]);

  // CORREÇÃO 3: Se o veículo ainda não foi carregado, exibe uma tela de carregamento para evitar erros.
  if (showControls && !vehicle) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#200259] text-white font-['Silkscreen'] text-2xl">
        Carregando dados do veículo...
      </div>
    );
  }

  // O resto do código do seu componente (MapViewControl, useEffects, handlers, etc.) continua aqui...
  // ...

  // No JSX de retorno, certifique-se de que `vehicle` não é nulo antes de usá-lo.
  return (
    <div className="flex flex-col lg:flex-row h-screen p-4 font-['Silkscreen'] bg-[#200259]">
      {/* ... */}
      {showControls && (
        <div className="lg:w-1/4 ...">
          {/* ... */}
          {vehicle && ( // Verificação para garantir que vehicle não é nulo
            <>
              <h3 className="...">{vehicle.name.toUpperCase()}</h3>
              {/* Resto do JSX que usa 'vehicle' */}
              <div className="w-full ...">
                <div
                  className="..."
                  style={{
                    width: `${
                      (vehicle.currentFuel / vehicle.maxCapacity) * 100
                    }%`,
                  }}
                >
                  {vehicle.currentFuel.toFixed(0)}/{vehicle.maxCapacity}L
                </div>
              </div>
            </>
          )}
          <div className="bg-yellow-300 ...">
            <button className="..." onClick={() => navigate("/refuel")}>
              <Fuel className="mr-2" />
              IR PARA O POSTO
            </button>
          </div>
        </div>
      )}
      {/* ... resto do seu JSX ... */}
    </div>
  );
};
