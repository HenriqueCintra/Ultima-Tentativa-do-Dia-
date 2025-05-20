import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Vehicle } from '../../types/vehicle';
import '../../styles/pixelArt.css';

// Lista de veículos disponíveis
const vehicles: Vehicle[] = [
  {
    id: 'caminhao_pequeno',
    name: 'Caminhão Pequeno',
    capacity: 20,
    consumption: {
      asphalt: 4,
      dirt: 3
    },
    image: 'src/assets/caminhao_medio.png',
    maxCapacity: 200,
    currentFuel: 50, // Começamos com 1/4 do tanque
    cost: 1500
  },
  {
    id: 'carreta',
    name: 'Carreta',
    capacity: 60,
    consumption: {
      asphalt: 2,
      dirt: 1.5
    },
    image: 'src/assets/carreta.png',
    maxCapacity: 495,
    currentFuel: 120, // Começamos com 1/4 do tanque
    cost: 4500
  },
  {
    id: 'caminhao_medio',
    name: 'Caminhão Médio',
    capacity: 40,
    consumption: {
      asphalt: 3,
      dirt: 2
    },
    image: 'src/assets/caminhao_medio.png',
    maxCapacity: 300,
    currentFuel: 75, // Começamos com 1/4 do tanque
    cost: 2500
  },
  {
    id: 'caminhonete',
    name: 'Caminhonete',
    capacity: 10,
    consumption: {
      asphalt: 8,
      dirt: 6
    },
    image: 'src/assets/caminhonete.png',
    maxCapacity: 100,
    currentFuel: 25, // Começamos com 1/4 do tanque
    cost: 800
  }
];

// Componente de Card do Veículo com estilo pixel art
const VehicleCard: React.FC<{
  vehicle: Vehicle,
  isSelected: boolean,
  onSelect: (id: string) => void
}> = ({ vehicle, isSelected, onSelect }) => {
  return (
    <div 
      className={`
        relative cursor-pointer transition-all duration-200
        ${isSelected ? 'scale-105' : 'hover:scale-102'}
      `}
      onClick={() => onSelect(vehicle.id)}
    >
      <div className={`
        bg-white p-4 rounded-lg shadow-lg
        ${isSelected ? 'border-4 border-orange-500' : 'border border-gray-200'}
      `}>
        {/* Imagem do Veículo */}
        <div className="flex justify-center mb-4">
          <img 
            src={vehicle.image} 
            alt={vehicle.name} 
            className="h-32 object-contain"
          />
        </div>
        
        {/* Detalhes do Veículo */}
        <div className="space-y-1 text-sm font-pixel">
          <p className="font-bold text-center">{vehicle.name}</p>
          <p>Capacidade: {vehicle.capacity} caixas</p>
          <p>Tanque: {vehicle.maxCapacity}L</p>
          <p>Consumo (Asfalto): {vehicle.consumption.asphalt}KM/L</p>
          <p>Consumo (Terra): {vehicle.consumption.dirt}KM/L</p>
          <p className="text-orange-600 font-bold">Custo: R$ {vehicle.cost.toLocaleString()}</p>
        </div>
      </div>
      
      {/* Ícone de selecionado */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-black">
          ✓
        </div>
      )}
    </div>
  );
};

export const VehicleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [availableMoney] = useState(10000); // Saldo disponível inicial: R$ 10.000
  const boxesCount = 40; // Número de caixas para transportar
  const lives = 3; // Vidas do jogador (elemento visual)

  // Selecionar veículo
  const handleVehicleSelect = (id: string) => {
    const vehicle = vehicles.find(v => v.id === id) || null;
    setSelectedVehicle(vehicle);
    setShowConfirmation(true);
  };

  // Calcular saldo restante após escolha do veículo
  const getRemainingBalance = (vehicle: Vehicle) => {
    return availableMoney - vehicle.cost;
  };

  // Confirmar escolha e avançar para a tela de rotas
  const handleConfirm = () => {
    if (selectedVehicle) {
      const remainingMoney = getRemainingBalance(selectedVehicle);
      
      // Redirecionar para a tela de rotas com o veículo selecionado e saldo restante
      navigate('/mapa-rota', { 
        state: { 
          selectedVehicle: selectedVehicle,
          availableMoney: remainingMoney
        } 
      });
    }
  };

  return (
    <div className="bg-sky-100 min-h-screen flex flex-col items-center justify-center px-4 py-8 relative">
      {/* Status Bar */}
      <div className="absolute top-4 right-4 flex items-center gap-4">
        <div className="font-pixel text-lg">R$ {availableMoney.toLocaleString()}</div>
      </div>

      {/* Main Title */}
      <h1 className="font-pixel text-xl mb-8 text-center max-w-2xl">
        ESCOLHA UM CAMINHÃO PARA O TRANSPORTE DE {boxesCount} CAIXAS
      </h1>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-5xl w-full">
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            isSelected={selectedVehicle?.id === vehicle.id}
            onSelect={handleVehicleSelect}
          />
        ))}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmation && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg font-pixel max-w-md w-full">
            <h2 className="text-xl mb-4">Você escolheu: {selectedVehicle.name}</h2>
            <p className="mb-2">Capacidade: {selectedVehicle.capacity} caixas</p>
            <p className="mb-2">Consumo (Asfalto): {selectedVehicle.consumption.asphalt}KM/L</p>
            <p className="mb-2">Consumo (Terra): {selectedVehicle.consumption.dirt}KM/L</p>
            <p className="mb-2">Tanque: {selectedVehicle.maxCapacity}L</p>
            <p className="mb-2">Valor: R$ {selectedVehicle.cost.toLocaleString()}</p>
            <p className="mb-6 font-bold">Saldo após compra: R$ {getRemainingBalance(selectedVehicle).toLocaleString()}</p>
            
            <div className="flex justify-center gap-4">
              <button 
                className="px-6 py-2 bg-green-500 text-white rounded transition-all hover:bg-green-600"
                onClick={handleConfirm}
              >
                Confirmar
              </button>
              <button 
                className="px-6 py-2 bg-red-500 text-white rounded transition-all hover:bg-red-600"
                onClick={() => setShowConfirmation(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ground/Grass Effect */}
      <div className="fixed bottom-0 left-0 right-0 h-8 bg-green-600 border-t-4 border-green-800"></div>
    </div>
  );
}; 