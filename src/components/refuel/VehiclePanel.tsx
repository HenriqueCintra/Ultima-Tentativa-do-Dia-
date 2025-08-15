import React from "react";
import { useGame } from "../../contexts/GameContext.tsx";
import { useNavigate } from "react-router-dom";
// CORREÇÃO: A linha de importação da imagem foi REMOVIDA.

const VehiclePanel = () => {
  const { vehicle } = useGame();
  const navigate = useNavigate();
  const fuelPercentage = (vehicle.currentFuel / vehicle.maxCapacity) * 100;
  return (
    <section className="panel left-panel">
      <button className="btn btn-top-left" onClick={() => navigate('/routes')}>< VOLTAR</button>
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
      <button className="btn btn-bottom-left" onClick={() => {
        // Pular abastecimento e ir direto para o jogo
        navigate('/mapa-rota', {
          state: {
            selectedVehicle: vehicle,
            availableMoney: 10000, // valor padrão
            selectedRoute: null // será definido no mapa
          }
        });
      }}>PULAR ABASTECIMENTO</button>
    </section>
  )
  );
};

export default VehiclePanel;
