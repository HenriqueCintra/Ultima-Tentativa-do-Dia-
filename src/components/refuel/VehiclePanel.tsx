import React from "react";
import { useGame } from "../../contexts/GameContext.tsx";
// CORREÇÃO: A linha de importação da imagem foi REMOVIDA.

const VehiclePanel = () => {
  const { vehicle } = useGame();
  const fuelPercentage = (vehicle.currentFuel / vehicle.maxCapacity) * 100;
  return (
    <section className="panel left-panel">
      <button className="btn btn-top-left">&lt; VOLTAR</button>
      <div className="panel-title">ABASTECER VEÍCULO?</div>
      <div className="vehicle-card">
        <div className="vehicle-info">
          <div className="vehicle-name">
            <p>{vehicle.name}</p>
          </div>
          <div className="vehicle-stats">
            <p>
              CONSUMO
              <br />
              <span>{vehicle.consumption.asphalt.toFixed(1)} KM/L</span>
            </p>
            <p>
              C. TANQUE
              <br />
              <span>
                {vehicle.currentFuel.toFixed(0)}L / {vehicle.maxCapacity}L
              </span>
            </p>
          </div>
          <div className="fuel-level">
            <p>NÍVEL DO TANQUE</p>
            <div className="fuel-level-bar">
              <div
                className="fuel-level-progress"
                style={{ width: `${fuelPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
        <div className="vehicle-image-container">
          {/* CORREÇÃO: Usando caminho absoluto a partir da pasta public */}
          <img src="/caminhao.png" alt="Caminhão" className="truck-image" />
        </div>
      </div>
      <button className="btn btn-bottom-left">PULAR ABASTECIMENTO</button>
    </section>
  );
};

export default VehiclePanel;
