import React, { useState } from 'react';
import { Vehicle } from '../../types/vehicle';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const FuelPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Dados recebidos da tela anterior
  const vehicle = location.state?.selectedVehicle || location.state?.vehicle || { id: 'carreta', name: 'Carreta', capacity: 60, consumption: { asphalt: 2, dirt: 1.5 }, image: '/carreta.png', maxCapacity: 495, currentFuel: 120, cost: 4500 };
  const availableMoney = location.state?.availableMoney || 5500;
  const selectedRoute = location.state?.selectedRoute;

  // Debug dos dados recebidos
  console.log("=== DEBUG FUEL PAGE ===");
  console.log("Location state:", location.state);
  console.log("Vehicle received:", vehicle);
  console.log("Available money:", availableMoney);
  console.log("Selected route:", selectedRoute);
  console.log("======================");

  const [selectedVehicle] = useState<Vehicle>({ ...vehicle });
  const [fuelAmount, setFuelAmount] = useState<'full' | 'half' | 'quarter'>('full');
  const [availableBalance] = useState(availableMoney);
  const [previewFuel, setPreviewFuel] = useState<number>(vehicle.currentFuel);

  const fuelCostPerLiter = 5.5;

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

      const updatedVehicle = {
        ...selectedVehicle,
        currentFuel: newCurrentFuel
      };

      const newBalance = availableBalance - cost;

      // Navegar para o jogo 2D com os dados atualizados
      navigate('/game', {
        state: {
          selectedVehicle: updatedVehicle,
          availableMoney: newBalance,
          selectedRoute: selectedRoute
        }
      });
    } else {
      alert('Saldo insuficiente para abastecer!');
    }
  };

  const handleSkipFuel = () => {
    // Navegar para o jogo 2D sem abastecer
    navigate('/game', {
      state: {
        selectedVehicle: selectedVehicle,
        availableMoney: availableBalance,
        selectedRoute: selectedRoute
      }
    });
  };

  const calculatePreviewFuel = (option: 'full' | 'half' | 'quarter'): number => {
    const max = selectedVehicle.maxCapacity;

    switch (option) {
      case 'full':
        return max;
      case 'half':
        return max / 2;
      case 'quarter':
        return max / 4;
    }
    return selectedVehicle.currentFuel;
  };

  const goBack = () => {
    navigate('/routes');
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
          ABASTECIMENTO
        </h1>
        <div className="bg-[#E3922A] text-black text-2xl font-bold px-6 py-2 rounded-md shadow-lg border-2 border-black">
          R$ {availableBalance.toFixed(2)}
        </div>
      </div>

      <div className="flex items-center justify-center min-h-screen pt-20">
        <div className="bg-[#200259] rounded-lg shadow-2xl border-4 border-black max-w-4xl w-full p-6">
          <h2 className="text-2xl font-['Silkscreen'] font-bold text-[#E3922A] text-center mb-4">
            DESEJA ABASTECER SEU VEÍCULO?
          </h2>
          
          <div className="text-center mb-6">
            <p className="font-['Silkscreen'] text-white text-xl font-bold">
              Saldo após abastecimento: R$ {(availableBalance - calculateFuelCost(fuelAmount)).toFixed(2)}
            </p>
          </div>

          <div className="bg-[#FFC06F] p-4 rounded-lg shadow-md border-2 border-black mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex justify-center items-center md:w-1/3">
                <img
                  src={selectedVehicle.image}
                  alt={selectedVehicle.name}
                  className="h-40 object-contain"
                />
              </div>

              <div className="md:w-2/3">
                <h3 className="text-xl font-['Silkscreen'] font-bold mb-3 text-black text-center border-b-2 border-black pb-2">
                  {selectedVehicle.name.toUpperCase()}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-['Silkscreen'] text-lg font-bold text-black mb-2">CONSUMO</h4>
                    <p className="font-sans text-black text-md mb-1">- ASFALTO: {selectedVehicle.consumption.asphalt}KM/L</p>
                    <p className="font-sans text-black text-md mb-3">- TERRA: {selectedVehicle.consumption.dirt}KM/L</p>
                  </div>

                  <div>
                    <h4 className="font-['Silkscreen'] text-lg font-bold text-black mb-2">COMBUSTÍVEL</h4>
                    <p className="font-sans text-black text-md mb-1">ATUAL: {selectedVehicle.currentFuel.toFixed(0)}L</p>
                    <p className="font-sans text-black text-md mb-3">MÁXIMO: {selectedVehicle.maxCapacity}L</p>
                  </div>
                </div>

                <p className="font-sans text-black text-md mb-2">NÍVEL DO TANQUE</p>
                <div className="w-full bg-gray-300 rounded-full h-6 border-2 border-black mb-4 relative">
                  {/* Barra do combustível atual */}
                  <div
                    className="bg-green-500 h-full rounded-l-full transition-all duration-300"
                    style={{ width: `${(selectedVehicle.currentFuel / selectedVehicle.maxCapacity) * 100}%` }}
                  ></div>
                  {/* Barra da pré-visualização */}
                  <div
                    className="bg-yellow-400 h-full absolute top-0 left-0 rounded-full opacity-70 transition-all duration-300"
                    style={{ width: `${(previewFuel / selectedVehicle.maxCapacity) * 100}%` }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-black">
                    {selectedVehicle.currentFuel.toFixed(0)} / {selectedVehicle.maxCapacity}L
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="font-['Silkscreen'] text-lg font-bold text-black mb-2">OPÇÕES DE ABASTECIMENTO</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="font-sans text-black text-md mb-2">PREÇO DO DIESEL: R$ {fuelCostPerLiter.toFixed(2)}/L</p>
                </div>

                <div className="md:col-span-2">
                  <div className="flex space-x-2 mb-2">
                    <button
                      onClick={() => {
                        const newPreview = calculatePreviewFuel('quarter');
                        setFuelAmount('quarter');
                        setPreviewFuel(newPreview);
                      }}
                      className={`flex-1 py-2 border-2 border-black rounded-md font-bold ${fuelAmount === 'quarter' ? 'bg-[#E3922A] text-black' : 'bg-gray-200 text-black'}`}
                    >
                      1/4
                    </button>
                    <button
                      onClick={() => {
                        const newPreview = calculatePreviewFuel('half');
                        setFuelAmount('half');
                        setPreviewFuel(newPreview);
                      }}
                      className={`flex-1 py-2 border-2 border-black rounded-md font-bold ${fuelAmount === 'half' ? 'bg-[#E3922A] text-black' : 'bg-gray-200 text-black'}`}
                    >
                      1/2
                    </button>
                    <button
                      onClick={() => {
                        const newPreview = calculatePreviewFuel('full');
                        setFuelAmount('full');
                        setPreviewFuel(newPreview);
                      }}
                      className={`flex-1 py-2 border-2 border-black rounded-md font-bold ${fuelAmount === 'full' ? 'bg-[#E3922A] text-black' : 'bg-gray-200 text-black'}`}
                    >
                      CHEIO
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <p className="font-sans text-black text-md font-bold text-xl">
                  Custo: R$ {calculateFuelCost(fuelAmount).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={handleSkipFuel}
              className="bg-gray-600 text-white font-bold py-3 px-8 rounded-md shadow-md border-2 border-black hover:bg-gray-700 transition-all duration-200"
            >
              PULAR ABASTECIMENTO
            </button>
            <button
              onClick={handleRefuel}
              disabled={calculateFuelCost(fuelAmount) > availableBalance}
              className={`font-bold py-3 px-8 rounded-md shadow-md border-2 border-black transition-all duration-200 ${
                calculateFuelCost(fuelAmount) > availableBalance 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                  : 'bg-[#E3922A] text-black hover:bg-[#FFC06F]'
              }`}
            >
              ABASTECER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 