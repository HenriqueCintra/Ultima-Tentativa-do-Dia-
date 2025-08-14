import React from "react";

interface FuelPanelProps {
  fuelPrices: Record<string, number>;
  selectedFuel: string;
  onFuelSelect: (fuel: string) => void;
  selectedFraction: number;
  onQuantitySelect: (fraction: number) => void;
  totalCost: number;
  onRefuel: () => void;
  canRefuel: boolean;
  formatCurrency: (value: number) => string;
}

const FuelPanel: React.FC<FuelPanelProps> = ({
  fuelPrices,
  selectedFuel,
  onFuelSelect,
  selectedFraction,
  onQuantitySelect,
  totalCost,
  onRefuel,
  canRefuel,
  formatCurrency,
}) => {
  const quantities = [
    { label: "1/4 TANQUE", value: 0.25 },
    { label: "1/2 TANQUE", value: 0.5 },
    { label: "TANQUE CHEIO", value: 1 },
  ];
  return (
    <section className="panel right-panel">
      <div className="fuel-station-header">POSTO DE COMBUSTÍVEL</div>
      <div className="fuel-type-selector">
        <p>ESCOLHA O COMBUSTÍVEL:</p>
        <div className="fuel-type-buttons">
          {Object.keys(fuelPrices).map((type) => (
            <button
              key={type}
              className={`btn btn-fuel-type ${
                selectedFuel === type ? "active" : ""
              }`}
              onClick={() => onFuelSelect(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
      <div className="price-info">
        <span>
          {selectedFuel.toUpperCase()}:{" "}
          {formatCurrency(fuelPrices[selectedFuel])} / LITRO
        </span>
      </div>
      <div className="quantity-selector">
        <p>ESCOLHA A QUANTIDADE:</p>
        <div className="quantity-buttons">
          {quantities.map((q) => (
            <button
              key={q.value}
              className={`btn btn-quantity ${
                selectedFraction === q.value ? "active" : ""
              }`}
              onClick={() => onQuantitySelect(q.value)}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>
      <div className="total-display">
        <p>
          TOTAL: <span>{formatCurrency(totalCost)}</span>
        </p>
      </div>
      <button
        className="btn btn-refuel"
        onClick={onRefuel}
        disabled={!canRefuel}
      >
        ABASTECER AGORA
      </button>
    </section>
  );
};

export default FuelPanel;
