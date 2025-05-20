// src/routesData.ts

export interface Route {
  routeId: number;
  name: string;
  distance: number; // Distância estática original
  estimatedTime: string; // Tempo estático original
  estimatedTimeHours: number; // Tempo estático original em horas
  cities: string[];
  roads: string[];
  startCoordinates: [number, number]; // [latitude, longitude]
  endCoordinates: [number, number];   // [latitude, longitude]
  waypoints?: [number, number][];      // [latitude, longitude][]
  tollBooths: { location: string; costPerAxle: number; totalCost: number; coordinates: [number, number] }[];
  speedLimits: { road: string; limit: string }[];
  safety: { robberyRisk: 'Baixo' | 'Médio' | 'Alto'; roadHazards: string };
  dirtRoad: boolean;
  dirtRoadDetails?: string;
  pois?: { type: 'construction' | 'danger' | 'rest' | 'gas'; location: string; description: string; coordinates: [number, number] }[];
  roadConditions: 'Boa' | 'Regular' | 'Ruim';
  constructionZones?: string;
  restStops?: string;
  fuelCostPerKm: number;
  dangerZonesDetails?: string;
  
  // NOVOS CAMPOS PARA DADOS DA API OSRM/ORS (pré-carregados)
  pathCoordinates?: [number, number][]; // Array de [latitude, longitude] da rota real
  actualDistance?: number; // Distância real da rota em km (da API)
  actualDuration?: number; // Duração real da rota em segundos (da API)
}

// Helper function to parse estimated time to hours for calculation
export const parseEstimatedTime = (timeStr: string): number => {
  const parts = timeStr.match(/(\d+)-?(\d+)?h/);
  if (parts) {
    const minHours = parseInt(parts[1], 10);
    const maxHours = parts[2] ? parseInt(parts[2], 10) : minHours;
    return (minHours + maxHours) / 2; // Average for calculation
  }
  return 0; // Default if format is not matched
};

export const routes: Route[] = [
  {
    "routeId": 1,
    "name": "Rota Principal: Juazeiro-Salvador via BR-407 e BR-324",
    "distance": 500,
    "estimatedTime": "8-9h",
    "estimatedTimeHours": parseEstimatedTime("8-9h"),
    "cities": ["Juazeiro", "Senhor do Bonfim", "Capim Grosso", "Feira de Santana", "Amélia Rodrigues", "Simões Filho", "Salvador"],
    "roads": ["BR-407", "BR-324"],
    "startCoordinates":  [-40.524226, -9.449771],
    "endCoordinates": [-38.471283, -12.954121],
    "waypoints": [
      [-12.227028337098638, -38.96483189578072]
    ],
    "tollBooths": [
      { "location": "BR-324 - Simões Filho", "costPerAxle": 5.80, "totalCost": 23.20, "coordinates": [-38.407040, -12.788113] },
      { "location": "BR-324 - Amélia Rodrigues", "costPerAxle": 4.90, "totalCost": 19.60, "coordinates": [-12.398770736606835, -38.763810991056346] }
    ],
    "speedLimits": [
      { "road": "BR-407", "limit": "80 km/h (rural), 60 km/h (urbano)" },
      { "road": "BR-324", "limit": "100 km/h (pista dupla), 80 km/h (pista simples), 60 km/h (trechos urbanos e acesso a cidades), 40 km/h (Salvador - Anel Viário)" }
    ],
    "safety": {
      "robberyRisk": "Médio",
      "roadHazards": "Tráfego intenso na BR-324, principalmente próximo a Feira de Santana e Salvador. Possíveis retenções e acidentes."
    },
    "dirtRoad": false,
    "pois": [
      { type: 'rest', location: 'Posto Laçador', description: 'Posto de combustível com restaurante e borracharia.', coordinates: [-10.829, -40.065] },
      { type: 'construction', location: 'Obras na BR-324', description: 'Duplicação de trecho, pode causar lentidão.', coordinates: [-12.550, -38.600] }
    ],
    "roadConditions": "Boa",
    "constructionZones": "Podem ocorrer obras pontuais na BR-324, verificar atualizações em tempo real.",
    "restStops": "Diversos postos de combustível e restaurantes ao longo da BR-324 e em Feira de Santana.",
    "fuelCostPerKm": 4.50,
    "dangerZonesDetails": "Pontos de lentidão e maior risco de colisões devido ao alto fluxo de veículos na BR-324 (Feira de Santana - Salvador).",
    
    // ** PREENCHA AQUI COM OS DADOS DA ROTA 1 DO SEU ARQUIVO rota1.json **
  "pathCoordinates": [],
    "actualDistance": 565.9576,
    "actualDuration": 29311.899999999998
  },
  {
    "routeId": 2,
    "name": "Rota Alternativa: Juazeiro-Salvador via BR-407, BA-131 e BR-116",
    "distance": 620,
    "estimatedTime": "10-11h",
    "estimatedTimeHours": parseEstimatedTime("10-11h"),
    "cities": ["Juazeiro", "Senhor do Bonfim", "Jacobina", "Capim Grosso", "Nova Fátima", "Riachão do Jacuípe", "Feira de Santana", "Salvador"],
    "roads": ["BR-407", "BA-131", "BR-116"],
     "startCoordinates":  [-40.524226, -9.449771],
    "endCoordinates": [-38.471283, -12.954121],
    "waypoints": [
      [-11.179317178432031, -40.522077494102646],
      [-11.379399144616343, -40.01228755126057]
    ],
    "tollBooths": [
      { "location": "BR-116 - Santa Bárbara", "costPerAxle": 6.20, "totalCost": 24.80, "coordinates": [-11.953338667402926, -38.976528563329694] },
      { "location": "BR-324 - Simões Filho", "costPerAxle": 5.80, "totalCost": 23.20, "coordinates": [-12.788113603594637, -38.40704037587636] },
      { "location": "BR-324 - Amélia Rodrigues", "costPerAxle": 4.90, "totalCost": 19.60, "coordinates": [-12.398770736606835, -38.763810991056346] }
    ],
    "speedLimits": [
      { "road": "BR-407", "limit": "80 km/h (rural), 60 km/h (urbano)" },
      { "road": "BA-131", "limit": "60 km/h (sinuoso), 40-50 km/h (trechos urbanos)" },
      { "road": "BR-116", "limit": "80 km/h (pista simples), 60 km/h (trechos urbanos)" }
    ],
    "safety": {
      "robberyRisk": "Alto",
      "roadHazards": "Muitas curvas sinuosas na BA-131, atenção redobrada. Trechos com menor fiscalização."
    },
    "dirtRoad": false,
    "pois": [
      { type: 'danger', location: 'Trecho isolado BA-131', description: 'Área com histórico de incidentes de segurança. Cuidado redobrado.', coordinates: [-10.800, -40.400] },
      { type: 'gas', location: 'Posto Boa Viagem (Jacobina)', description: 'Posto de combustível com conveniência.', coordinates: [-11.170, -40.500] }
    ],
    "roadConditions": "Regular",
    "constructionZones": "Possíveis obras na BA-131, verificar antes da viagem. BR-116 pode ter trechos em manutenção.",
    "restStops": "Menos opções de paradas e serviços na BA-131. Mais opções na BR-116 após Jacobina.",
    "fuelCostPerKm": 4.70,
    "dangerZonesDetails": "Curvas acentuadas na BA-131, trechos de serra e áreas mais isoladas com menor movimento.",

    // ** PREENCHA AQUI COM OS DADOS DA ROTA 2 DO SEU ARQUIVO rota2.json **
    "pathCoordinates": [],
    "actualDistance": 609.503,
    "actualDuration": 32844.4 
  },
  {
    "routeId": 3,
    "name": "Rota Litorânea: Juazeiro-Salvador via BA-210 e BR-101 (com trecho de terra)",
    "distance": 750,
    "estimatedTime": "12-13h",
    "estimatedTimeHours": parseEstimatedTime("12-13h"),
    "cities": ["Juazeiro", "Curaçá", "Paulo Afonso", "Jeremoabo", "Ribeira do Pombal", "Alagoinhas", "Entre Rios", "Esplanada", "Lauro de Freitas", "Salvador"],
    "roads": ["BR-407", "BA-210", "BR-110", "BR-101"],
    "startCoordinates": [-9.44977115369502, -40.52422616182216],
    "endCoordinates": [-12.954121960174133, -38.47128319030249],
    "waypoints": [
      [-9.39982948397807, -38.24030252226024],
      [-10.81411260222788, -38.52932390199075]
    ],
    "tollBooths": [
      { "location": "BR-101 - Entre Rios", "costPerAxle": 6.50, "totalCost": 26.00, "coordinates": [-11.946287684133058, -38.066988557628115] },
      { "location": "BR-101 - Camaçari", "costPerAxle": 5.20, "totalCost": 20.80, "coordinates": [-12.700189690314199, -38.32674177189969] }
    ],
    "speedLimits": [
      { "road": "BR-407", "limit": "80 km/h (rural), 60 km/h (urbano)" },
      { "road": "BA-210", "limit": "60 km/h (pavimentada), 30-40 km/h (trechos de terra/irregulares)" },
      { "road": "BR-110", "limit": "60-80 km/h (pista simples)" },
      { "road": "BR-101", "limit": "80 km/h (pista simples), 100 km/h (trechos duplicados), 60 km/h (trechos urbanos/acessos)" }
    ],
    "safety": {
      "robberyRisk": "Médio",
      "roadHazards": "Trechos da BA-210 podem ter muitas irregularidades e buracos, especialmente no trecho de terra. BR-101 com tráfego intenso em feriados."
    },
    "dirtRoad": true,
    "dirtRoadDetails": "Aproximadamente 40 km na BA-210, entre Paulo Afonso e Jeremoabo. Condições ruins, requer veículo adequado e atenção redobrada.",
    "pois": [
      { type: 'danger', location: 'Trecho de Terra BA-210', description: 'Estrada de terra com buracos e risco de atolamento em dias de chuva.', coordinates: [-9.750, -38.400] },
      { type: 'construction', location: 'Obras na BR-101', description: 'Duplicação de trecho, pode causar desvios e lentidão.', coordinates: [-12.500, -38.000] }
    ],
    "roadConditions": "Regular",
    "constructionZones": "Obras de manutenção e duplicação podem ocorrer na BR-101, causando lentidão.",
    "restStops": "Boas opções de paradas na BR-101. Menos opções na BA-210.",
    "fuelCostPerKm": 5.00,
    "dangerZonesDetails": "Trecho de terra e isolado na BA-210 (risco de atolamento em chuva), pontos de lentidão na BR-101 próximo a cidades.",

    // ** PREENCHA AQUI COM OS DADOS DA ROTA 3 DO SEU ARQUIVO rota3.json **
    "pathCoordinates": [],
    "actualDistance": 1289.4798,
    "actualDuration": 73213.79999999999
  }
];