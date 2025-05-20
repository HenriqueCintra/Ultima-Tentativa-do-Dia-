import React, { useState, useEffect } from 'react';
import { ArrowRightIcon, ArrowLeftIcon } from 'lucide-react';

// Tipos de veículos
interface Vehicle {
  id: string;
  name: string;
  capacity: number;
  consumption: {
    asphalt: number;
    dirt: number;
  };
  image: string;
  maxCapacity: number;
  currentFuel: number;
}

// Propriedades do componente
interface VehicleSelectionProps {
  onSelectVehicle: (vehicle: Vehicle) => void;
  onClose: () => void;
  availableMoney: number;
  initialSelectedVehicle?: Vehicle;
}

const vehicles: Vehicle[] = [
  {
    id: 'caminhao_pequeno',
    name: 'Caminhão Pequeno',
    capacity: 20,
    consumption: {
      asphalt: 4,
      dirt: 3
    },
    image: '/caminhao_pequeno.png',
    maxCapacity: 200,
    currentFuel: 100
  },
  {
    id: 'carreta',
    name: 'Carreta',
    capacity: 60,
    consumption: {
      asphalt: 2,
      dirt: 1.5
    },
    image: '/carreta.png',
    maxCapacity: 495,
    currentFuel: 220
  },
  {
    id: 'caminhao_medio',
    name: 'Caminhão Médio',
    capacity: 40,
    consumption: {
      asphalt: 3,
      dirt: 2
    },
    image: '/caminhao_medio.png',
    maxCapacity: 300,
    currentFuel: 150
  },
  {
    id: 'caminhonete',
    name: 'Caminhonete',
    capacity: 10,
    consumption: {
      asphalt: 8,
      dirt: 6
    },
    image: '/caminhonete.png',
    maxCapacity: 100,
    currentFuel: 60
  }
];

export const VehicleSelection: React.FC<VehicleSelectionProps> = ({
  onSelectVehicle,
  onClose,
  availableMoney,
  initialSelectedVehicle
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle>(
    initialSelectedVehicle || vehicles[0]
  );
  const [fuelAmount, setFuelAmount] = useState<'full' | 'half' | 'quarter'>('full');
  const [availableBalance, setAvailableBalance] = useState(availableMoney);
  const fuelCostPerLiter = 6; // R$ 6,00 por litro

  // Navegar pelo carrossel
  const nextVehicle = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % vehicles.length);
    setSelectedVehicle(vehicles[(currentIndex + 1) % vehicles.length]);
  };

  const prevVehicle = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + vehicles.length) % vehicles.length);
    setSelectedVehicle(vehicles[(currentIndex - 1 + vehicles.length) % vehicles.length]);
  };

  // Cálculos de abastecimento
  const calculateFuelCost = (option: 'full' | 'half' | 'quarter') => {
    const maxCapacity = selectedVehicle.maxCapacity;
    const currentFuel = selectedVehicle.currentFuel;
    
    let fuelToAdd = 0;
    
    switch (option) {
      case 'full':
        fuelToAdd = maxCapacity - currentFuel;
        break;
      case 'half':
        fuelToAdd = (maxCapacity / 2) - currentFuel;
        if (fuelToAdd < 0) fuelToAdd = 0;
        break;
      case 'quarter':
        fuelToAdd = (maxCapacity / 4) - currentFuel;
        if (fuelToAdd < 0) fuelToAdd = 0;
        break;
    }
    
    return fuelToAdd * fuelCostPerLiter;
  };

  const handleRefuel = () => {
    const cost = calculateFuelCost(fuelAmount);
    
    if (cost <= availableBalance) {
      const newCurrentFuel = fuelAmount === 'full' 
        ? selectedVehicle.maxCapacity 
        : fuelAmount === 'half' 
          ? Math.max(selectedVehicle.currentFuel, selectedVehicle.maxCapacity / 2)
          : Math.max(selectedVehicle.currentFuel, selectedVehicle.maxCapacity / 4);
      
      setSelectedVehicle({
        ...selectedVehicle,
        currentFuel: newCurrentFuel
      });
      
      setAvailableBalance(prevBalance => prevBalance - cost);
    } else {
      alert('Saldo insuficiente para abastecer!');
    }
  };

  const handleConfirm = () => {
    // Atualizar o veículo com o combustível atual
    const updatedVehicle = {
      ...selectedVehicle,
      currentFuel: selectedVehicle.currentFuel
    };
    onSelectVehicle(updatedVehicle);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[9999] p-4">
      <div className="bg-[#200259] rounded-lg shadow-2xl border-4 border-black max-w-4xl w-full p-6">
        <h1 className="text-3xl font-['Silkscreen'] font-bold text-[#E3922A] text-center mb-4">
          ESCOLHA UM CAMINHÃO
        </h1>
        <p className="text-xl font-['Silkscreen'] text-white text-center mb-6">
          SALDO: R$ {availableBalance.toFixed(2)}
        </p>

        {/* Carrossel de veículos */}
        <div className="flex items-center justify-center mb-8">
          <button 
            onClick={prevVehicle} 
            className="bg-[#E3922A] text-black h-12 w-12 rounded-full flex items-center justify-center mr-4 border-2 border-black"
          >
            <ArrowLeftIcon />
          </button>
          
          <div className="relative">
            <div className="bg-[#FFC06F] p-6 rounded-lg border-4 border-black w-80 h-80 flex flex-col items-center justify-center">
              <img 
                src={selectedVehicle.image} 
                alt={selectedVehicle.name} 
                className="w-56 h-56 object-contain mb-4" 
              />
              <h3 className="text-xl font-['Silkscreen'] font-bold text-black text-center">
                {selectedVehicle.name}
              </h3>
              <p className="text-sm font-sans text-black">
                Capacidade: {selectedVehicle.capacity} caixas
              </p>
            </div>
            
            {/* Indicador de seleção */}
            <div className="absolute -bottom-6 left-0 right-0 flex justify-center">
              {vehicles.map((_, index) => (
                <div 
                  key={index} 
                  className={`h-3 w-3 rounded-full mx-1 ${
                    index === currentIndex ? 'bg-[#E3922A]' : 'bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <button 
            onClick={nextVehicle} 
            className="bg-[#E3922A] text-black h-12 w-12 rounded-full flex items-center justify-center ml-4 border-2 border-black"
          >
            <ArrowRightIcon />
          </button>
        </div>

        {/* Informações do veículo */}
        <div className="bg-[#FFC06F] p-4 rounded-lg shadow-md border-2 border-black mb-6">
          <h2 className="text-2xl font-['Silkscreen'] font-bold mb-3 text-black text-center border-b-2 border-black pb-2">
            ESPECIFICAÇÕES
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-['Silkscreen'] text-lg font-bold text-black mb-2">CONSUMO</h3>
              <p className="font-sans text-black text-md mb-1">- ASFALTO: {selectedVehicle.consumption.asphalt}KM/L</p>
              <p className="font-sans text-black text-md mb-3">- TERRA: {selectedVehicle.consumption.dirt}KM/L</p>
            </div>
            
            <div>
              <h3 className="font-['Silkscreen'] text-lg font-bold text-black mb-2">COMBUSTÍVEL</h3>
              <p className="font-sans text-black text-md mb-1">ATUAL: {selectedVehicle.currentFuel}L</p>
              <p className="font-sans text-black text-md mb-3">MÁXIMO: {selectedVehicle.maxCapacity}L</p>
            </div>
          </div>
          
          {/* Barra de combustível */}
          <p className="font-sans text-black text-md mb-2">NÍVEL DO TANQUE</p>
          <div className="w-full bg-gray-300 rounded-full h-6 border-2 border-black mb-4">
            <div
              className="bg-green-500 h-full rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ width: `${(selectedVehicle.currentFuel / selectedVehicle.maxCapacity) * 100}%` }}
            >
              {selectedVehicle.currentFuel}/{selectedVehicle.maxCapacity}
            </div>
          </div>
          
          {/* Abastecimento */}
          <div className="mb-4">
            <h3 className="font-['Silkscreen'] text-lg font-bold text-black mb-2">ABASTECER</h3>
            <div className="flex space-x-2 mb-2">
              <button 
                onClick={() => setFuelAmount('quarter')} 
                className={`flex-1 py-2 border-2 border-black rounded-md ${fuelAmount === 'quarter' ? 'bg-[#E3922A]' : 'bg-gray-200'}`}
              >
                1/4
              </button>
              <button 
                onClick={() => setFuelAmount('half')} 
                className={`flex-1 py-2 border-2 border-black rounded-md ${fuelAmount === 'half' ? 'bg-[#E3922A]' : 'bg-gray-200'}`}
              >
                1/2
              </button>
              <button 
                onClick={() => setFuelAmount('full')} 
                className={`flex-1 py-2 border-2 border-black rounded-md ${fuelAmount === 'full' ? 'bg-[#E3922A]' : 'bg-gray-200'}`}
              >
                CHEIO
              </button>
            </div>
            
            <p className="font-sans text-black text-md mb-2">
              Custo: R$ {calculateFuelCost(fuelAmount).toFixed(2)}
            </p>
            
            <button 
              onClick={handleRefuel}
              className="bg-[#E3922A] text-black font-bold py-2 px-4 rounded-md w-full shadow-md border-2 border-black hover:bg-[#FFC06F]"
            >
              ABASTECER
            </button>
          </div>
        </div>
        
        {/* Botões de ação */}
        <div className="flex space-x-4">
          <button 
            onClick={onClose}
            className="flex-1 bg-gray-600 text-white font-bold py-3 px-4 rounded-md shadow-md border-2 border-black hover:bg-gray-700"
          >
            CANCELAR
          </button>
          <button 
            onClick={handleConfirm}
            className="flex-1 bg-[#E3922A] text-black font-bold py-3 px-4 rounded-md shadow-md border-2 border-black hover:bg-[#FFC06F]"
          >
            CONFIRMAR
          </button>
        </div>
      </div>
    </div>
  );
}; 