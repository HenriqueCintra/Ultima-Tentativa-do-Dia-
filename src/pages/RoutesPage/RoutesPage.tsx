// src/pages/RoutesPage/RoutesPage.tsx

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { routes, Route } from '../mapaRota/routesData';
import { MapComponent } from '../mapaRota/MapComponent';

export const RoutesPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Dados recebidos da tela anterior
  const vehicle = location.state?.selectedVehicle || { id: 'carreta', name: 'Carreta', capacity: 60, consumption: { asphalt: 2, dirt: 1.5 }, image: '/carreta.png', maxCapacity: 495, currentFuel: 120, cost: 4500 };
  const availableMoney = location.state?.availableMoney || 5500;

  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [routesList] = useState<Route[]>(routes);

  const handleSelectRoute = (routeId: number) => {
    const routeToSelect = routesList.find(r => r.routeId === routeId);
    if (routeToSelect) {
      setSelectedRoute(routeToSelect);
    }
  };

  const handleContinue = () => {
    if (selectedRoute) {
      // Navegar para a tela de abastecimento
      navigate('/fuel', {
        state: {
          vehicle,
          availableMoney,
          selectedRoute
        }
      });
    }
  };

  const goBack = () => {
    navigate('/select-vehicle');
  };

  return (
    <div className="min-h-screen bg-[#200259] p-4 font-['Silkscreen']">
      <div className="absolute top-0 left-0 w-full flex items-center justify-between px-8 py-4 z-40">
        <button
          className="flex items-center px-6 py-2 bg-[#E3922A] text-black font-bold text-lg rounded-md shadow-lg
                   hover:bg-[#FFC06F] transition-all duration-200 border-2 border-black"
          onClick={goBack}
        >
          <ArrowLeft /> VOLTAR
        </button>
        <h1 className="text-3xl font-bold text-[#E3922A] text-center flex-1 -ml-16">
          ESCOLHA SUA ROTA
        </h1>
        <div className="bg-[#E3922A] text-black text-2xl font-bold px-6 py-2 rounded-md shadow-lg border-2 border-black">
          R$ {availableMoney.toFixed(2)}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 pt-20 h-screen">
        {/* Mapa usando o MapComponent existente */}
        <div className="lg:w-2/3 h-full">
          <div className="h-full">
            {selectedRoute ? (
              <div className="h-full">
                <MapComponent 
                  preSelectedRoute={selectedRoute}
                  preSelectedVehicle={vehicle}
                  preAvailableMoney={availableMoney}
                  showControls={false}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center bg-gray-200 rounded-lg border-4 border-black">
                <div className="text-center text-gray-600 font-['Silkscreen']">
                  <p className="text-2xl mb-4">🗺️</p>
                  <p className="text-lg font-bold">Selecione uma rota</p>
                  <p className="text-md">para visualizar no mapa</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Rotas */}
        <div className="lg:w-1/3 overflow-y-auto">
          <div className="grid gap-4">
            <h2 className="text-2xl font-['Silkscreen'] font-bold mb-4 text-white text-center border-b-2 border-white pb-2">
              ROTAS DISPONÍVEIS
            </h2>
            
            {routesList.map((route) => (
              <div
                key={route.routeId}
                className={`p-4 rounded-lg cursor-pointer transition-all duration-200
                  ${selectedRoute?.routeId === route.routeId 
                    ? 'bg-yellow-400 border-4 border-black ring-4 ring-yellow-500' 
                    : 'bg-white border-2 border-black hover:bg-gray-200'}
                  shadow-md`}
                onClick={() => handleSelectRoute(route.routeId)}
              >
                <h3 className="font-['Silkscreen'] font-bold text-2xl text-black mb-2">
                  {route.name}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-sans text-black text-lg">
                      <span className="font-bold">TEMPO ESTIMADO:</span> {route.estimatedTime}
                    </p>
                    <p className="font-sans text-black text-lg">
                      <span className="font-bold">DISTÂNCIA:</span> {route.actualDistance ? `${route.actualDistance.toFixed(0)}` : route.distance} km
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-sans text-black text-lg flex items-center">
                      <span className="font-bold">RISCO:</span>
                      <span className={`${route.safety.robberyRisk === 'Baixo' ? 'text-green-800' : 'text-red-800'} ml-1`}>
                        {route.safety.robberyRisk} {route.safety.robberyRisk === 'Baixo' ? '✅' : '⚠️'}
                      </span>
                    </p>
                    {route.dirtRoad && (
                      <p className="font-sans text-black text-lg flex items-center">
                        <span className="font-bold">TERRENO:</span>
                        <span className="text-yellow-800 ml-1">Estrada de Terra 🏞️</span>
                      </p>
                    )}
                  </div>
                </div>

                

                {selectedRoute?.routeId === route.routeId && (
                  <div className="mt-4 p-3 bg-black bg-opacity-20 rounded-md">
                    <h4 className="font-bold text-black mb-2">DETALHES DA ROTA:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {route.tollBooths.length > 0 && (
                        <p>• <span className="font-bold">Pedágios:</span> {route.tollBooths.length}</p>
                      )}
                      {route.dangerZones && route.dangerZones.length > 0 && (
                        <p>• <span className="font-bold">Zonas de Risco:</span> {route.dangerZones.length}</p>
                      )}
                      {route.speedLimits.length > 0 && (
                        <p>• <span className="font-bold">Limites de Velocidade:</span> Variados</p>
                      )}
                      {route.dirtSegments && route.dirtSegments.length > 0 && (
                        <p>• <span className="font-bold">Trechos de Terra:</span> {route.dirtSegments.length}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedRoute && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleContinue}
                className="bg-[#E3922A] text-black font-bold py-4 px-8 text-xl rounded-md shadow-lg border-2 border-black hover:bg-[#FFC06F] transition-all duration-200"
              >
                CONTINUAR COM ESTA ROTA
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 