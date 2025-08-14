import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../../contexts/GameContext.tsx";
import Header from "../../components/refuel/Header.tsx";
import VehiclePanel from "../../components/refuel/VehiclePanel.tsx";
import FuelPanel from "../../components/refuel/FuelPanel.tsx";
import Modal from "../../components/refuel/Modal.tsx";
import "../../styles/refuel.css"; // Importa o nosso CSS customizado

const FUEL_PRICES = { diesel: 5.5, gasolina: 7.29, alcool: 5.49 };
const WRONG_FUEL_PENALTY = 500.0;

const RefuelScreen = () => {
  const navigate = useNavigate();
  const { vehicle, playerBalance, setPlayerBalance, formatCurrency } =
    useGame();

  const [selectedFuel, setSelectedFuel] = useState("diesel");
  const [selectedFraction, setSelectedFraction] = useState(0.5);
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);

  const totalCost = useMemo(() => {
    return FUEL_PRICES[selectedFuel] * (vehicle.maxCapacity * selectedFraction);
  }, [selectedFuel, selectedFraction, vehicle.maxCapacity]);

  const finalBalance = playerBalance - totalCost;
  const canAfford = finalBalance >= 0;

  const handleRefuel = () => {
    const vehicleFuelType = "diesel"; // Simplificando, assumimos que o caminhão é a diesel
    if (selectedFuel !== vehicleFuelType) {
      setPlayerBalance(playerBalance - WRONG_FUEL_PENALTY);
      setShowPenaltyModal(true);
    } else {
      navigate("/minigame", {
        state: {
          refuelInfo: {
            fuelType: selectedFuel,
            fraction: selectedFraction,
            cost: totalCost,
          },
        },
      });
    }
  };

  return (
    <div className="refuel-container">
      <Modal
        show={showPenaltyModal}
        onClose={() => setShowPenaltyModal(false)}
        title="COMBUSTÍVEL ERRADO!"
        message={`Multa de ${formatCurrency(
          WRONG_FUEL_PENALTY
        )} aplicada por usar ${selectedFuel.toUpperCase()} em um veículo a ${vehicleFuelType.toUpperCase()}.`}
      />
      <Header finalBalance={finalBalance} />
      <main className="main-container">
        <VehiclePanel />
        <FuelPanel
          fuelPrices={FUEL_PRICES}
          selectedFuel={selectedFuel}
          onFuelSelect={setSelectedFuel}
          selectedFraction={selectedFraction}
          onQuantitySelect={setSelectedFraction}
          totalCost={totalCost}
          onRefuel={handleRefuel}
          canRefuel={canAfford}
          formatCurrency={formatCurrency}
        />
      </main>
    </div>
  );
};

export default RefuelScreen;
