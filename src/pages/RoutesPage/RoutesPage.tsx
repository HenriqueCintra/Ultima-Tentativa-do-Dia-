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
  const vehicle = location.state?.selectedVehicle || { id: 'carreta', name: 'Carreta', capacity: 60, consumption: { asphalt: 2, dirt: 1.5 }, image: '/carreta.png', maxCapacity: 495, currentFuel: 0, cost: 4500 };
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
    <div className="min-h-screen bg-[#200259] font-['Silkscreen']">
      {/* Header compacto */}
      <div className="bg-[#200259] border-b-2 border-[#E3922A] px-3 py-2">
        <div className="flex items-center justify-between mx-auto">
          <button
            className="flex items-center gap-1 px-3 py-1.5 bg-[#E3922A] text-black font-bold text-sm rounded-md shadow-lg
                     hover:bg-[#FFC06F] transition-all duration-200 border-2 border-black"
            onClick={goBack}
          >
            <ArrowLeft size={16} /> VOLTAR
          </button>
          
          <h1 className="text-lg lg:text-xl font-bold text-[#E3922A] text-center">
            ESCOLHA SUA ROTA
          </h1>
          
          <div className="bg-[#E3922A] text-black text-sm lg:text-base font-bold px-3 py-1.5 rounded-md shadow-lg border-2 border-black">
            R$ {availableMoney.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex flex-col lg:flex-row gap-3 p-3 h-[calc(100vh-60px)] max-h-[calc(100vh-60px)] overflow-hidden">
        {/* Mapa usando o MapComponent existente */}
        <div className="lg:w-2/3 h-full lg:h-full flex flex-col min-h-[300px] lg:min-h-0">
          <div className="flex-1 min-h-0 overflow-hidden rounded-lg border-2 border-gray-300">
                          {selectedRoute ? (
               <div className="w-full h-full max-h-full overflow-hidden">
                <div className="w-full h-full">
                  <MapComponent 
                    preSelectedRoute={selectedRoute}
                    preSelectedVehicle={vehicle}
                    preAvailableMoney={availableMoney}
                    showControls={false}
                  />
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="text-center text-gray-600 font-['Silkscreen'] p-4">
                  <div className="text-4xl mb-3">🗺️</div>
                  <p className="text-lg font-bold mb-1 text-gray-700">Selecione uma rota</p>
                  <p className="text-sm text-gray-500">para visualizar no mapa</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Rotas */}
        <div className="lg:w-2/5 flex flex-col h-full lg:h-full min-h-[400px] lg:min-h-0">
          {/* Header da seção */}
          <div className="bg-[#E3922A] text-black p-2 rounded-t-lg border-2 border-black mb-0 flex-shrink-0">
            <h2 className="text-lg font-['Silkscreen'] font-bold text-center">
              ROTAS DISPONÍVEIS
            </h2>
          </div>
          
          {/* Lista scrollável */}
          <div className="flex-1 min-h-0 overflow-y-auto bg-gray-100 border-x-2 border-black p-2 space-y-2">
            
            {routesList.map((route) => (
              <div
                key={route.routeId}
                className={`p-2 rounded-lg cursor-pointer transition-all duration-200 border-2
                  ${selectedRoute?.routeId === route.routeId 
                    ? 'bg-yellow-300 border-yellow-600 shadow-lg' 
                    : 'bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400'}
                  `}
                onClick={() => handleSelectRoute(route.routeId)}
              >
                <h3 className="font-['Silkscreen'] font-bold text-sm text-black mb-2 border-b border-gray-300 pb-1">
                  {route.name}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <p className="font-['Silkscreen'] text-black text-xs">
                      <span className="font-['Silkscreen']">⏱️ TEMPO:</span> {route.estimatedTime}
                    </p>
                    <p className="font-['Silkscreen'] text-black text-xs">
                      <span className="font-['Silkscreen']">📏 DISTÂNCIA:</span> {route.actualDistance ? `${route.actualDistance.toFixed(0)}` : route.distance} km
                    </p>
                  </div>
                  
                  <div className="space-y-0.5">
                    <p className="font-['Silkscreen'] text-black text-xs flex items-center">
                      <span className="font-['Silkscreen']">🛡️ RISCO:</span>
                      <span className={`${route.safety.robberyRisk === 'Baixo' ? 'text-green-700' : 'text-red-700'} ml-1 font-['Silkscreen']`}>
                        {route.safety.robberyRisk} {route.safety.robberyRisk === 'Baixo' ? '✅' : '⚠️'}
                      </span>
                    </p>
                    {route.dirtRoad && (
                      <p className="font-['Silkscreen'] text-black text-xs flex items-center">
                        <span className="font-['Silkscreen']">🛤️ TERRENO:</span>
                        <span className="text-yellow-700 ml-1 font-['Silkscreen']">Estrada de Terra</span>
                      </p>
                    )}
                  </div>
                </div>

                

                {selectedRoute?.routeId === route.routeId && (
                  <div className="mt-2 p-2 bg-blue-50 border-l-4 border-blue-400 rounded-r-md">
                    <h4 className="font-bold text-blue-800 mb-1 text-xs">📋 DETALHES:</h4>
                    <div className="grid grid-cols-2 gap-1 text-xs text-blue-700">
                      {route.tollBooths.length > 0 && (
                        <p>🛣️ Pedágios: {route.tollBooths.length}</p>
                      )}
                      {route.dangerZones && route.dangerZones.length > 0 && (
                        <p>⚠️ Riscos: {route.dangerZones.length}</p>
                      )}
                      {route.speedLimits.length > 0 && (
                        <p>🚦 Velocidade: Variada</p>
                      )}
                      {route.dirtSegments && route.dirtSegments.length > 0 && (
                        <p>🌄 Terra: {route.dirtSegments.length}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Footer com botão de continuar */}
          <div className="bg-[#E3922A] border-2 border-black rounded-b-lg p-2 flex-shrink-0">
            {selectedRoute ? (
              <button
                onClick={handleContinue}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 text-sm rounded-md 
                         shadow-lg border-2 border-green-800 transition-all duration-200"
              >
                🚛 CONTINUAR COM ESTA ROTA
              </button>
            ) : (
              <div className="text-center text-black font-bold py-2 text-sm">
                👆 Selecione uma rota para continuar
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 