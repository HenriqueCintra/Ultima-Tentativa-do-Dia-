import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import kaboom from "kaboom";
import './game.css'
import { Vehicle } from "../../types/vehicle";
import { GameMiniMap } from "./GameMiniMap";

import type {
  GameObj,
  SpriteComp,
  PosComp,
  ZComp,
  AreaComp,
  BodyComp,
  ScaleComp
} from "kaboom";


export function GameScene() {
  const location = useLocation();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [playerChoice, setPlayerChoice] = useState<string | null>(null);
  const gamePaused = useRef(false);
  const collidedObstacle = useRef<GameObj | null>(null);
  const destroyRef = useRef<((obj: GameObj) => void) | null>(null); // <-- Aqui
  const [eventoAtual, setEventoAtual] = useState<{ texto: string; desc: string, opcoes: string[] } | null>(null);
  const processingEvent = useRef(false); // Flag para evitar eventos duplicados
  const [gameEnded, setGameEnded]  = useState(false);
  const [showEndMessage, setShowEndMessage] = useState(false);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const gameInitialized = useRef(false); // Flag para evitar múltiplas inicializações
  const progressRef = useRef(0);
  const [progress, setProgress] = useState(0);
  const distanceTravelled = useRef(0);
  
  // Novos estados para progresso baseado nos pontos do caminho
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const pathProgressRef = useRef(0); // Progresso dentro do segmento atual (0-1)
  const currentPathIndexRef = useRef(0); // Ref para uso dentro do onUpdate do Kaboom
  const gameSpeedMultiplier = useRef(1); // Multiplicador de velocidade baseado na rota
  const obstacleTimerRef = useRef(0); // Timer para criação de obstáculos
  // Cooldown curto após uma colisão para evitar detecções duplicadas
  const collisionCooldownRef = useRef(0);
  const obstacleSystemLockedRef = useRef(false); // Sistema travado durante eventos
  const handleResizeRef = useRef<(() => void) | null>(null); // Ref para função de resize
  
  // Novos estados para melhorias
  const [gameTime, setGameTime] = useState(0); // Tempo decorrido em segundos
  const gameStartTime = useRef<number>(Date.now());
  const manualTimeAdjustment = useRef<number>(0); // Ajuste manual do tempo pelos eventos
  const [currentFuel, setCurrentFuel] = useState<number>(() => {
    // Inicializar com o combustível do veículo desde o início
    const vehicleData = location.state?.selectedVehicle || location.state?.vehicle;
    return vehicleData?.currentFuel || 0;
  });
  const [totalDistance, setTotalDistance] = useState<number>(500); // Distância padrão

  // Estados que agora vêm dos parâmetros de navegação
  const [vehicle, setVehicle] = useState<Vehicle>(() => {
    console.log("Estado recebido no jogo:", location.state);
    
    if (location.state && location.state.selectedVehicle) {
      console.log("Veículo encontrado:", location.state.selectedVehicle);
      return location.state.selectedVehicle;
    }
    
    console.warn("Nenhum veículo encontrado, redirecionando...");
    // Se não houver dados, redirecionar para seleção de veículo
    navigate('/select-vehicle');
    return { id: 'default', name: 'Caminhão Padrão', capacity: 1000, consumption: { asphalt: 3, dirt: 2 }, image: '/assets/truck.png', maxCapacity: 100, currentFuel: 0, cost: 1000 };
  });

  const [money, setMoney] = useState(() => {
    const money = location.state?.availableMoney;
    console.log("Dinheiro recebido:", money);
    return money !== undefined ? money : 1000;
  });

  const [selectedRoute, setSelectedRoute] = useState(() => {
    const route = location.state?.selectedRoute;
    console.log("Rota recebida:", route);
    return route || null;
  });

  // Inicializar estados baseados nos dados recebidos
  useEffect(() => {
    console.log("Inicializando currentFuel com:", vehicle.currentFuel);
    
    // Verificar se há progresso salvo sendo carregado
    const savedProgressData = location.state?.savedProgress;
    
    if (savedProgressData) {
      // Log de carregamento removido
      
      // Restaurar estados salvos
      setCurrentFuel(savedProgressData.currentFuel);
      setProgress(savedProgressData.progress);
      setCurrentPathIndex(savedProgressData.currentPathIndex);
      setGameTime(savedProgressData.gameTime);
      
      // Restaurar refs
      progressRef.current = savedProgressData.progress;
      currentPathIndexRef.current = savedProgressData.currentPathIndex;
      pathProgressRef.current = savedProgressData.pathProgress;
      
      // Ajustar o tempo de início do jogo para considerar o tempo já jogado
      gameStartTime.current = Date.now() - (savedProgressData.gameTime * 1000);
      manualTimeAdjustment.current = savedProgressData.manualTimeAdjustment || 0; // Restaurar ajuste manual
      
      console.log("Estados restaurados do save:", {
        currentFuel: savedProgressData.currentFuel,
        progress: savedProgressData.progress,
        currentPathIndex: savedProgressData.currentPathIndex,
        gameTime: savedProgressData.gameTime,
        manualTimeAdjustment: manualTimeAdjustment.current
      });
      console.log(`🕐 gameStartTime ajustado para save: ${new Date(gameStartTime.current).toLocaleTimeString()}`);
      console.log(`🔧 Ajuste manual restaurado: ${manualTimeAdjustment.current}s`);
    } else {
      // Inicialização normal
    setCurrentFuel(vehicle.currentFuel || vehicle.maxCapacity);
    }
    
    if (selectedRoute) {
      console.log("Definindo distância total:", selectedRoute.actualDistance || selectedRoute.distance);
      setTotalDistance(selectedRoute.actualDistance || selectedRoute.distance);
      
      // Calcular multiplicador de velocidade baseado no tempo estimado da rota
      const estimatedHours = selectedRoute.estimatedTimeHours || 7.5; // Padrão 7.5 horas
      const targetGameDurationMinutes = 3; // Queremos que o jogo dure ~3 minutos
      gameSpeedMultiplier.current = (estimatedHours * 60) / targetGameDurationMinutes;
      
      console.log("Rota estimada:", estimatedHours, "horas");
      console.log("Multiplicador de velocidade:", gameSpeedMultiplier.current);
      console.log("PathCoordinates disponíveis:", selectedRoute.pathCoordinates?.length, "pontos");
    }
  }, [vehicle, selectedRoute, location.state]);

  const [gasoline, setGasoline] = useState(() => {
    // Calcular porcentagem do combustível com base no veículo
    const fuelPercent = (currentFuel / vehicle.maxCapacity) * 100;
    console.log("Inicializando gasoline com:", fuelPercent, "%");
    return fuelPercent;
  });

  // Debug dos dados recebidos
  useEffect(() => {
    // Verificar se todos os dados essenciais estão presentes apenas na primeira execução
    if (!vehicle || !vehicle.name || !vehicle.image) {
      console.error("ERRO: Dados do veículo incompletos!");
      console.log("Redirecionando para seleção de veículo...");
      setTimeout(() => {
        navigate('/select-vehicle');
      }, 1000);
    }
  }, []); // Executar apenas uma vez

  // Timer do jogo
  useEffect(() => {
    const interval = setInterval(() => {
      if (!gamePaused.current && !gameEnded && !processingEvent.current) {
        const currentTime = Date.now();
        const baseElapsedSeconds = Math.floor((currentTime - gameStartTime.current) / 1000);
        const finalElapsedSeconds = baseElapsedSeconds + manualTimeAdjustment.current;
        
        // Log apenas a cada 30 segundos para não poluir o console
        if (finalElapsedSeconds % 30 === 0 && finalElapsedSeconds > 0) {
          console.log(`🕐 Timer: ${formatTime(finalElapsedSeconds)} (base: ${baseElapsedSeconds}s + ajuste: ${manualTimeAdjustment.current}s)`);
        }
        
        setGameTime(finalElapsedSeconds);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameEnded]);

  // Sincronizar progresso para debug
  useEffect(() => {
    // Debug removido
  }, [progress, currentPathIndex]);

  // Verificar condições de game over
  const checkGameOver = () => {
    // Só verificar game over se o jogo estiver carregado e inicializado
    if (!gameLoaded || !gameInitialized.current) {
      console.log("Game Over check skipped - jogo não carregado ainda");
      return false;
    }
    
    // Aguardar pelo menos 1 segundo após carregar para evitar false positives
    if (Date.now() - gameStartTime.current < 1000) {
      console.log("Game Over check skipped - aguardando estabilização");
      return false;
    }
    
    if (currentFuel <= 0) {
      console.log("Game Over: Combustível esgotado - currentFuel:", currentFuel);
      gamePaused.current = true;
      alert("Combustível esgotado! Jogo encerrado.");
      navigate('/routes');
      return true;
    }
    
    if (money <= 0) {
      console.log("Game Over: Sem recursos financeiros - money:", money);
      gamePaused.current = true;
      alert("Sem recursos financeiros! Jogo encerrado.");
      navigate('/routes');
      return true;
    }
    
    return false;
  };

  // Formatar tempo para exibição (HH:MM:SS)
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calcular progresso baseado nos pontos reais do caminho
  const calculatePathProgress = (deltaTime: number) => {
    if (!selectedRoute?.pathCoordinates || selectedRoute.pathCoordinates.length < 2) {
      // Fallback para lógica antiga se não houver pathCoordinates
      console.log("Usando fallback - sem pathCoordinates");
      return calculateFallbackProgress(deltaTime);
    }

    const pathCoords = selectedRoute.pathCoordinates;
    const totalSegments = pathCoords.length - 1;
    
    // Velocidade calibrada para completar a rota em ~3 minutos (180 segundos) AJUSTE DE DURAÇÃO DO JOGO
    const targetDurationSeconds = 180;
    const segmentsPerSecond = totalSegments / targetDurationSeconds;
    const segmentSpeed = segmentsPerSecond * deltaTime; // Segmentos por frame
    
    // Avançar progresso no segmento atual
    pathProgressRef.current += segmentSpeed;
    
    // Se completou o segmento atual, avançar para o próximo
    if (pathProgressRef.current >= 1.0 && currentPathIndexRef.current < totalSegments - 1) {
      currentPathIndexRef.current += 1;
      setCurrentPathIndex(currentPathIndexRef.current);
      pathProgressRef.current = 0;
      // Log de segmento removido
    }
    
    // Calcular progresso total: (segmentos completos + progresso no segmento atual) / total
    const totalProgress = (currentPathIndexRef.current + pathProgressRef.current) / totalSegments;
    const progressPercent = Math.min(100, Math.max(0, totalProgress * 100));
    
    // Log de progresso removido
    
    return progressPercent;
  };

  // Fallback para quando não há pathCoordinates
  const calculateFallbackProgress = (deltaTime: number) => {
    const routeDistance = totalDistance || 500;
    distanceTravelled.current += deltaTime * gameSpeedMultiplier.current * 0.1;
    const progressKm = (distanceTravelled.current * routeDistance) / 5000; // Ajustado para ser mais lento
    return Math.min(100, Math.max(0, (progressKm / routeDistance) * 100));
  };

  // Converter caminho da imagem do veículo para URL pública
  const getVehicleImageUrl = (vehicleImage: string) => {
    console.log("Convertendo imagem do veículo:", vehicleImage);
    
    // Se já é uma URL que começa com /assets/, usar diretamente
    if (vehicleImage.startsWith('/assets/')) {
      console.log("Já é uma URL pública:", vehicleImage);
      return vehicleImage;
    }
    
    // Se é um caminho de módulo (/src/assets/), extrair o nome do arquivo
    if (vehicleImage.startsWith('/src/assets/')) {
      const fileName = vehicleImage.replace('/src/assets/', '');
      console.log("Nome do arquivo extraído de /src/assets/:", fileName);
      return `/assets/${fileName}`;
    }
    
    // Se é uma URL completa (ESModule import ou blob), extrair o nome do arquivo
    const fileName = vehicleImage.split('/').pop()?.split('?')[0]; // Remove query params se houver
    console.log("Nome do arquivo extraído da URL:", fileName);
    
    // Mapear os nomes dos arquivos para URLs públicas
    const imageMap: { [key: string]: string } = {
      'caminhao_medio.png': '/assets/caminhao_medio.png',
      'caminhao_pequeno.png': '/assets/caminhao_pequeno.png', 
      'caminhonete.png': '/assets/caminhonete.png',
      'carreta.png': '/assets/carreta.png',
      'truck.png': '/assets/truck.png'
    };
    
    if (fileName && imageMap[fileName]) {
      console.log("URL encontrada no mapeamento:", imageMap[fileName]);
      return imageMap[fileName];
    }
    
    // Fallback para truck.png se não encontrar
    console.log("Usando fallback truck.png");
    return '/assets/truck.png';
  };



  useEffect(() => {
    if (!vehicle || !vehicle.name) {
      console.error("Dados do veículo não encontrados");
      return;
    }

    // Evitar múltiplas inicializações
    if (gameInitialized.current) {
      console.log("Jogo já foi inicializado, pulando...");
      return;
    }

    // Aguardar o canvas estar completamente montado
    const initializeGame = () => {
      if (!canvasRef.current) {
        console.error("Canvas não encontrado, tentando novamente...");
        setTimeout(initializeGame, 100);
        return;
      }

      console.log("Canvas encontrado:", canvasRef.current);
      console.log("Canvas dimensões:", canvasRef.current.width, "x", canvasRef.current.height);

      // Verificar se o canvas está no DOM
      if (!document.contains(canvasRef.current)) {
        console.error("Canvas não está no DOM, aguardando...");
        setTimeout(initializeGame, 100);
        return;
      }

      // Marcar como inicializado para evitar re-execuções
      gameInitialized.current = true;

      // Resetar flag do kaboom para permitir reinicialização
      if ((window as any).__kaboom_initiated__) {
        (window as any).__kaboom_initiated__ = false;
      }

      console.log("Inicializando jogo com veículo:", vehicle.name, "Imagem:", vehicle.image);
      console.log("Combustível atual no início:", currentFuel);

      // Definir função de resize fora do try/catch para acessibilidade no cleanup
      handleResizeRef.current = () => {
        if (canvasRef.current) {
          canvasRef.current.width = window.innerWidth;
          canvasRef.current.height = window.innerHeight;
          // Reinicializar o jogo com as novas dimensões seria complexo,
          // então vamos manter as dimensões fixas durante a sessão
        }
      };

      try {
        setGameLoaded(false);
        setLoadingError(null);
        
        // Verificar suporte WebGL
        const testContext = canvasRef.current!.getContext('webgl') || canvasRef.current!.getContext('experimental-webgl');
        if (!testContext) {
          throw new Error("WebGL não suportado neste navegador");
        }
        
        const k = kaboom({
          canvas: canvasRef.current!,
          width: window.innerWidth,
          height: window.innerHeight,
          background: [0, 0, 0],
          crisp: true, // Para imagens mais nítidas em diferentes escalas
        });

        // Adicionar listener para redimensionamento da janela
        window.addEventListener('resize', handleResizeRef.current!);

        (window as any).__kaboom_initiated__ = true;

    const {
      loadSprite,
      scene,
      go,
      add,
      sprite,
      pos,
      area,
      body,
      isKeyDown,
      width,
      height,
      dt,
      onUpdate,
      z,
      scale,
      destroy,
    } = k;

    // Minimap removido - agora usando GameMiniMap component
    
   
   

    // Armazena a função destroy fora do useEffect
    destroyRef.current = destroy;

    // Carregar sprites com tratamento de erro
    try {
      console.log("Tentando carregar sprites...");
      loadSprite("background", "/assets/backgroundd.png");
      
      const vehicleImageUrl = getVehicleImageUrl(vehicle.image);
      console.log("Imagem original do veículo:", vehicle.image);
      console.log("URL convertida para kaboom:", vehicleImageUrl);
      loadSprite("car", vehicleImageUrl);
      
      loadSprite("obstacle", "/assets/obstaclee.png");
      
      console.log("Todos os sprites carregados com sucesso");
      console.log("Veículo carregado:", vehicle.name, "Imagem URL:", vehicleImageUrl);
    } catch (error) {
      console.error("Erro ao carregar sprites:", error);
    }

    const eventos = [
      // EVENTOS NEGATIVOS (Problemas)
      {texto: "Pneu Furado 🚛💥", 
      desc:"Você precisa chamar o borracheiro!" , 
      opcoes: ["Borracheiro próximo - R$300 | 1h | 0L", "Borracheiro barato - R$100 | 3h | 0L"]},
      
      {texto: "Greve dos caminhoneiros 🚧🚛", 
      desc:"Caminhoneiros bloquearam a rota!" , 
      opcoes: ["Contratar motoristas extras - R$300 | 0h | 0L", "Esperar acabar - R$0 | 6h | 0L"]},

      {texto: "Aumento de pedágio 💸🛣️", 
      desc:"Houve um ajuste inesperado no pedágio!" , 
      opcoes: ["Pagar o pedágio - R$120 | 0h | 0L", "Mudar de rota - R$0 | 2h | -5L"]},

      {texto: "Combustível adulterado ⚠️⛽", 
      desc:"O caminhão apresentou falhas por combustível adulterado!" , 
      opcoes: ["Consertar no mecânico - R$800 | 8h | -10L", "Trocar de veículo - R$700 | 4h | 0L"]},
    
      {texto: "Eixo Quebrado 🛠️🚛", 
      desc:"O eixo quebrou e o veículo não pode continuar!" , 
      opcoes: ["Socorro mecânico - R$1000 | 6h | 0L", "Outro caminhão - R$900 | 4h | 0L"]},
    
      {texto: "Rota Interditada 🚧🛣️", 
      desc:"Acidente grave interditou a rota!" , 
      opcoes: ["Rota alternativa - R$200 | 3h | -8L", "Aguardar liberação - R$0 | 5h | 0L"]},
    
      {texto: "Carga Molhada 🌧️📦", 
      desc:"Chuva danificou parte da carga!" , 
      opcoes: ["Reembalar carga - R$150 | 2h | 0L", "Seguir mesmo assim - R$0 | 0h | 0L"]},

      {texto: "Fiscalização Rodoviária 🚔📋", 
      desc:"Fiscalização detectou documentação irregular!" , 
      opcoes: ["Regularizar documentos - R$400 | 3h | 0L", "Multa e seguir - R$600 | 1h | 0L"]},

      {texto: "Problema Mecânico 🔧⚙️", 
      desc:"O motor apresentou superaquecimento!" , 
      opcoes: ["Oficina especializada - R$500 | 4h | 0L", "Reparo improvisado - R$200 | 2h | -12L"]},

      // EVENTOS POSITIVOS (Oportunidades)
      {texto: "Promoção de Combustível ⛽🎉", 
      desc:"Posto oferece desconto especial no diesel!" , 
      opcoes: ["Abastecer completo - R$-200 | 1h | +30L", "Abastecer parcial - R$-100 | 0h | +15L"]},
    
      {texto: "Estrada Reformada 🛣️🎉", 
      desc:"Trecho recém asfaltado permite maior velocidade!" , 
      opcoes: ["Acelerar e ganhar tempo - R$0 | -2h | -6L", "Velocidade normal - R$0 | 0h | +2L"]},

      {texto: "Clima Favorável 🌤️🎉", 
      desc:"Vento a favor e clima seco!" , 
      opcoes: ["Aproveitar e acelerar - R$0 | -1h | -3L", "Economizar combustível - R$0 | 0h | +8L"]},

      {texto: "Pedágio Gratuito 🛣️🎉", 
      desc:"Promoção liberou o pedágio!" , 
      opcoes: ["Usar rota liberada - R$-120 | 0h | 0L", "Rota alternativa - R$-60 | +1h | -3L"]},

      {texto: "Carona Solidária 👥🚛", 
      desc:"Outro motorista ofereceu ajuda com combustível!" , 
      opcoes: ["Aceitar ajuda - R$0 | 0h | +20L", "Recusar educadamente - R$0 | 0h | 0L"]},

      {texto: "Desconto na Manutenção 🔧💰", 
      desc:"Oficina parceira oferece desconto!" , 
      opcoes: ["Fazer manutenção preventiva - R$-150 | 2h | +5L", "Não fazer agora - R$0 | 0h | 0L"]},
    ];



scene("main", () => {
  const speed = 5000;

  // Calcular escala para o background cobrir toda a tela
  // Assumindo que a imagem original do background é 1365x762
  const bgScaleX = width() / 1365;
  const bgScaleY = height() / 762;
  const bgScale = Math.max(bgScaleX, bgScaleY); // Usar o maior para cobrir toda a tela

  // Ajustar posição Y do background para alinhar a pista com o caminhão
  const bgOffsetY = -height() * 0.15; // Subir o background 15% da altura da tela

  const bg1 = add([
    sprite("background"),
    pos(0, bgOffsetY),
    scale(bgScale),
    z(0),
    { speed },
  ]);

  const bg2 = add([
    sprite("background"),
    pos(1365 * bgScale, bgOffsetY), // Posicionar baseado no tamanho escalado da imagem original
    scale(bgScale),
    z(0),
    { speed },
  ]);

  // Posicionar o caminhão na pista (ajustar com base no offset do background)
  // Ajustar a posição Y baseada no tamanho da tela e no offset do background
  const roadYPosition = height() * 0.68; // Ajustar para 68% devido ao background ter subido
  const carScale = Math.min(width() / 1365, height() / 762) * 0.6; // Escala um pouco menor para proporção melhor

  const car = add([
    sprite("car"),
    pos(width() * 0.08, roadYPosition), // 8% da largura da tela, um pouco mais à direita
    area(),
    body(),
    z(2),
    scale(carScale),
  ]);

  type Obstacle = GameObj<
    SpriteComp |
    PosComp |
    ZComp |
    AreaComp |
    BodyComp |
    ScaleComp
  > & { collided: boolean; };

  // Sistema de gestão de obstáculos mais robusto
  const obstacles: Obstacle[] = [];
  const maxObstacles = 1;
  const obstacleSpawnInterval = 10; // Aumentar para 10 segundos
  let lastObstacleCreatedTime = 0; // Timestamp da última criação
  
  // Função para criar um novo obstáculo (simplificada)
  const createObstacle = () => {
    const currentTime = Date.now();
    
    // Verificações básicas (sistema já deve estar travado quando chega aqui)
    if (obstacles.length >= maxObstacles) {
      console.log("🚫 Limite de obstáculos atingido:", obstacles.length);
      return;
    }
    
    // Verificar tempo mínimo entre criações
    if (currentTime - lastObstacleCreatedTime < 3000) {
      console.log("🚫 Muito cedo para criar obstáculo:", currentTime - lastObstacleCreatedTime, "ms");
      return;
    }
    
    // Posicionar obstáculo bem longe da tela inicial para evitar colisão imediata
    const roadYPosition = height() * 0.68; // Mesma posição Y da pista do caminhão (ajustada)
    const obstacleScale = Math.min(width() / 1365, height() / 762) * 0.12; // Escala um pouco menor
    const safeDistance = width() + 300; // Distância segura da borda direita da tela
    
    const obs = add([
      sprite("obstacle"),
      pos(safeDistance + Math.random() * 200, roadYPosition + Math.random() * 40 - 20), // Posição mais distante e com variação
      area(),
      body(),
      z(1),
      scale(obstacleScale),
      "obstacle",
      { collided: false },
    ]) as Obstacle;

    obstacles.push(obs);
    lastObstacleCreatedTime = Date.now();
    console.log("🔴 Novo obstáculo criado. Total:", obstacles.length, "Posição:", obs.pos.x, obs.pos.y);
  };

  onUpdate(() => {
    // DEBUG: Verificar se o jogo está pausado
    if (gamePaused.current) {
      return; // Não processar se o jogo estiver pausado
    }

    const deltaTime = dt();

    // Reduzir o cooldown (se houver) a cada frame, mas não deixar ficar negativo
    if (collisionCooldownRef.current > 0) {
      collisionCooldownRef.current = Math.max(0, collisionCooldownRef.current - deltaTime);
    }

    const moveAmount = -speed * deltaTime;

    bg1.move(moveAmount, 0);
    bg2.move(moveAmount, 0);

    // Atualizar timer para criação de obstáculos
    obstacleTimerRef.current += deltaTime;
    
    // Sistema de criação de obstáculos ULTRA rigoroso - apenas UM por vez
    const canCreateObstacle = (
      obstacleTimerRef.current >= obstacleSpawnInterval &&
      obstacles.length === 0 &&
      !eventoAtual &&
      !processingEvent.current &&
      !obstacleSystemLockedRef.current &&
      collisionCooldownRef.current === 0
    );
    
    if (canCreateObstacle) {
      // TRAVAR IMEDIATAMENTE para evitar criações múltiplas
      obstacleSystemLockedRef.current = true;
      console.log("⏰ Condições atendidas - TRAVANDO sistema e criando obstáculo");
      console.log("📊 Estado atual:", {
        timer: obstacleTimerRef.current.toFixed(2),
        obstaculos: obstacles.length,
        evento: !!eventoAtual,
        processing: processingEvent.current,
        cooldown: collisionCooldownRef.current
      });
      
      createObstacle();
      obstacleTimerRef.current = -10; // Resetar com delay muito longo
      
      // Destravar após o obstáculo ser criado e posicionado
      setTimeout(() => {
        obstacleSystemLockedRef.current = false;
        console.log("🔓 Sistema destravado após criação de obstáculo");
      }, 2000); // 2 segundos para garantir que o obstáculo foi criado e posicionado
    }

    // Processar obstáculos existentes (iteração reversa para remoção segura)
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i];
      
      obs.move(moveAmount, 0);

      // Remover obstáculos que saíram completamente da tela
      if (obs.pos.x < -obs.width - 100) {
        obs.destroy(); // Destruir o objeto do jogo
        obstacles.splice(i, 1); // Remover do array
        console.log("🗑️ Obstáculo removido da tela. Total restante:", obstacles.length);
        continue;
      }

      // Verificar colisão apenas para obstáculos que estão efetivamente na área de jogo
      // e não colididos, com verificações mais rigorosas
      const obstacleInGameArea = obs.pos.x > 0 && obs.pos.x < width() - 50; // Margem de segurança
      const obstacleVisible = obs.pos.x > -obs.width && obs.pos.x < width();
      
      if (
        collisionCooldownRef.current === 0 &&
        obstacleVisible &&
        obstacleInGameArea &&
        !obs.collided &&
        !eventoAtual &&
        !processingEvent.current &&
        car.isColliding(obs)
      ) {
        const eventoSorteado = eventos[Math.floor(Math.random() * eventos.length)];

        // TRAVAR SISTEMA COMPLETAMENTE durante colisão
        obstacleSystemLockedRef.current = true;
        processingEvent.current = true; // Marcar que está processando evento
        setEventoAtual(eventoSorteado);
        obs.collided = true; // Marcar como colidido
        gamePaused.current = true; // Pausar o jogo
        collidedObstacle.current = obs; // Armazenar o obstáculo colidido

        console.log("💥 COLISÃO DETECTADA! Obstáculo pos:", obs.pos.x, obs.pos.y, "Caminhão pos:", car.pos.x, car.pos.y);
        console.log("🔍 Estado antes da colisão - cooldown:", collisionCooldownRef.current, "eventoAtual:", !!eventoAtual, "processing:", processingEvent.current);

        // Remover o obstáculo imediatamente para evitar detecção dupla
        obs.destroy();
        obstacles.splice(i, 1);

        console.log("🧹 Obstáculo removido após colisão. Total restante:", obstacles.length);
        console.log("🎲 Evento disparado:", eventoSorteado.texto);
        setShowPopup(true); // Mostrar o popup
        break; // Sair do loop após detectar a colisão
      }
    }

    // Reposicionar os fundos para criar o efeito de loop
    // Considerar a escala aplicada aos backgrounds
    const bgWidth = bg1.width * bgScale;
    
    if (bg1.pos.x + bgWidth <= 0) {
      bg1.pos.x = bg2.pos.x + bgWidth;
    }
    if (bg2.pos.x + bgWidth <= 0) {
      bg2.pos.x = bg1.pos.x + bgWidth;
    }

    // Calcular progresso baseado nos pontos reais do caminho da rota (APENAS quando não pausado)
    const progressPercent = calculatePathProgress(deltaTime);
    const previousProgress = progressRef.current;
    progressRef.current = progressPercent;
    setProgress(progressPercent);
    
    // Debug inicial do movimento removido

    // Consumir combustível de forma mais realista baseado no progresso
    const routeDistance = totalDistance || 500; // Usar distância da rota ou padrão
    const progressDelta = progressPercent - previousProgress; // Mudança no progresso
    const distanceInKm = (progressDelta / 100) * routeDistance; // Distância percorrida em km
    const consumptionRate = vehicle.consumption?.asphalt || 10; // km/L
    const fuelConsumption = Math.abs(distanceInKm) / consumptionRate; // Litros consumidos
    
    if (fuelConsumption > 0.001) { // Só processar se houver consumo significativo
      const newFuelLevel = Math.max(0, currentFuel - fuelConsumption);
      
      setCurrentFuel((prevFuel) => {
        const updatedFuel = Math.max(0, prevFuel - fuelConsumption);
        setGasoline((updatedFuel / vehicle.maxCapacity) * 100);
        
        // Verificar game over apenas se combustível mudou significativamente
        if (prevFuel > 0 && updatedFuel <= 0) {
          setTimeout(() => checkGameOver(), 100); // Delay para garantir atualização do estado
        }
        
        return updatedFuel;
      });
    }

    // Verificar se chegou ao destino
    if (progressPercent >= 100) {
      setGameEnded(true);
      gamePaused.current = true;
    }

  });

  // Minimap canvas removido - agora usando GameMiniMap component

});

    go("main");
    
    // Resetar estados de progresso para nova partida
    setCurrentPathIndex(0);
    currentPathIndexRef.current = 0;
    pathProgressRef.current = 0;
    progressRef.current = 0;
    setProgress(0);
    distanceTravelled.current = 0;
    
    // Resetar timer de criação de obstáculos para dar um tempo antes do próximo
    obstacleTimerRef.current = 0;
    
    // Garantir que o jogo não esteja pausado ao inicializar
    gamePaused.current = false;
    
    // DEBUG: Log inicial removido
    
    // Marcar jogo como carregado após tudo estar configurado
    setGameLoaded(true);
    
    // Só resetar gameStartTime se não houver progresso salvo
    if (!location.state?.savedProgress) {
      gameStartTime.current = Date.now();
      manualTimeAdjustment.current = 0; // Reset adjustment para novo jogo
      console.log("🕐 gameStartTime inicializado para novo jogo:", new Date(gameStartTime.current).toLocaleTimeString());
    } else {
      console.log("🕐 gameStartTime mantido do save carregado:", new Date(gameStartTime.current).toLocaleTimeString());
    }
    
    console.log("Jogo inicializado com sucesso!");

      } catch (error) {
        console.error("Erro ao inicializar o jogo:", error);
        setLoadingError(`Erro ao carregar o jogo: ${error}`);
        setGameLoaded(false);
        (window as any).__kaboom_initiated__ = false;
      }
    };

    // Iniciar o jogo após um pequeno delay para garantir que o DOM esteja pronto
    setTimeout(initializeGame, 50);

    // Cleanup function
    return () => {
      console.log("Limpando recursos do jogo...");
      (window as any).__kaboom_initiated__ = false;
      gameInitialized.current = false;
      setGameLoaded(false);
      
      // Remover listener de resize
      if (handleResizeRef.current) {
        window.removeEventListener('resize', handleResizeRef.current);
      }
    };
    
  }, [vehicle.image, vehicle.name, vehicle.id]); // Dependências corretas

  useEffect(() => {
  if (gameEnded) {
    console.log("Jogo finalizado. Mostrando mensagem final.");
    // Limpar progresso salvo quando o jogo terminar
    localStorage.removeItem('savedGameProgress');
    // Log de progresso removido
    setShowEndMessage(true);
  }
}, [gameEnded]);


  const handleOptionClick = (choice: string) => {
    console.log("🎯 Processando escolha do evento:", choice);
    console.log("🔧 Cooldown atual:", collisionCooldownRef.current);
    setPlayerChoice(choice);
    
    // Novo formato: "Descrição - R$valor | tempo | combustível"
    // Extrair os valores usando regex
    const eventMatch = choice.match(/R\$(-?\d+)\s*\|\s*([+-]?\d+(?:\.\d+)?)h\s*\|\s*([+-]?\d+)L/);
    
    if (eventMatch) {
      const moneyChange = parseInt(eventMatch[1]);
      const timeChange = parseFloat(eventMatch[2]);
      const fuelChange = parseInt(eventMatch[3]);
      
             console.log("✅ Impactos do evento:", { 
         dinheiro: moneyChange !== 0 ? `${moneyChange > 0 ? '+' : ''}${-moneyChange}` : '0',
         tempo: timeChange !== 0 ? `${timeChange > 0 ? '+' : ''}${timeChange}h` : '0h',
         combustível: fuelChange !== 0 ? `${fuelChange > 0 ? '+' : ''}${fuelChange}L` : '0L'
       });
       
       // Aplicar mudança no dinheiro
       if (moneyChange !== 0) {
         setMoney((prev: number) => {
           const newMoney = Math.max(0, prev - moneyChange); // Negativo pra custo, positivo pra economia
           const impact = -moneyChange;
           console.log(`💰 Dinheiro: R$${prev.toFixed(2)} → R$${newMoney.toFixed(2)} (${impact > 0 ? '+' : ''}${impact})`);
           return newMoney;
         });
       }
       
       // Aplicar mudança no tempo
       if (timeChange !== 0) {
         const secondsChange = timeChange * 3600; // Converter horas para segundos
         
         // Aplicar ajuste manual que será somado ao tempo base
         const oldAdjustment = manualTimeAdjustment.current;
         manualTimeAdjustment.current += secondsChange;
         
         setGameTime((prev: number) => {
           const newTime = Math.max(0, prev + secondsChange);
           
           console.log(`⏱️ Evento aplicado - Tempo: ${formatTime(prev)} → ${formatTime(newTime)} (${timeChange > 0 ? '+' : ''}${timeChange}h)`);
           console.log(`🔧 Ajuste manual: ${oldAdjustment}s → ${manualTimeAdjustment.current}s (${secondsChange > 0 ? '+' : ''}${secondsChange}s)`);
           console.log(`🔒 Mudança de tempo permanente aplicada: ${timeChange}h`);
           
           return newTime;
         });
         
         // Log adicional para verificar se o ajuste permanece
         setTimeout(() => {
           console.log(`🔍 Verificação pós-evento - Ajuste manual mantido: ${manualTimeAdjustment.current}s`);
           console.log(`🔍 Tempo atual no estado: ${formatTime(gameTime)}`);
         }, 2000);
       }
       
       // Aplicar mudança no combustível
       if (fuelChange !== 0) {
        setCurrentFuel((prev: number) => {
          const newFuel = Math.max(0, Math.min(vehicle.maxCapacity, prev + fuelChange));
          setGasoline((newFuel / vehicle.maxCapacity) * 100);
           console.log(`⛽ Combustível: ${prev.toFixed(1)}L → ${newFuel.toFixed(1)}L (${fuelChange > 0 ? '+' : ''}${fuelChange}L)`);
          return newFuel;
        });
      }

       // Mostrar notificação visual dos impactos
       const showImpactNotification = () => {
         const impacts = [];
         if (moneyChange !== 0) {
           const impact = -moneyChange;
           impacts.push(`💰 ${impact > 0 ? '+' : ''}R$${impact}`);
         }
         if (timeChange !== 0) {
           impacts.push(`⏱️ ${timeChange > 0 ? '+' : ''}${timeChange}h`);
         }
         if (fuelChange !== 0) {
           impacts.push(`⛽ ${fuelChange > 0 ? '+' : ''}${fuelChange}L`);
         }

         if (impacts.length > 0) {
           const notification = document.createElement('div');
           notification.innerHTML = `<strong>Impactos:</strong><br>${impacts.join('<br>')}`;
           notification.style.cssText = `
             position: fixed;
             top: 20%;
             left: 50%;
             transform: translateX(-50%);
             background: rgba(0, 0, 0, 0.9);
             color: white;
             padding: 15px 20px;
             border-radius: 10px;
             z-index: 3000;
             font-family: "Silkscreen", sans-serif;
             font-size: 14px;
             text-align: center;
             border: 2px solid #ffcc00;
             animation: impactFade 3s ease-in-out;
           `;

           const style = document.createElement('style');
           style.textContent = `
             @keyframes impactFade {
               0% { opacity: 0; transform: translateX(-50%) scale(0.8); }
               15% { opacity: 1; transform: translateX(-50%) scale(1); }
               85% { opacity: 1; transform: translateX(-50%) scale(1); }
               100% { opacity: 0; transform: translateX(-50%) scale(0.8); }
             }
           `;
           document.head.appendChild(style);
           document.body.appendChild(notification);

           setTimeout(() => {
             notification.remove();
             style.remove();
           }, 3000);
         }
       };

       // Mostrar notificação após pequeno delay para garantir que os estados foram atualizados
       setTimeout(showImpactNotification, 100);
       
     } else {
       console.warn("Formato de evento não reconhecido:", choice);
    }
    
    setEventoAtual(null);
    setShowPopup(false);
      collidedObstacle.current = null;
    processingEvent.current = false; // Resetar flag de processamento

    // Verificar condições de game over após processar evento
    if (gameLoaded && checkGameOver()) {
      return;
    }

    if (gameEnded) {
      console.log("Jogo finalizado após evento");
      setShowEndMessage(true);
      return;
    }

    // Despausar o jogo e resetar timer para dar um tempo maior ao jogador
    gamePaused.current = false;
    obstacleTimerRef.current = -8; // Dar 8 segundos antes do próximo obstáculo

    // Ativar um cooldown longo e destravar sistema depois de um tempo
    collisionCooldownRef.current = 3.0; // 3 segundos de cooldown
    
    // Destravar sistema de obstáculos após 8 segundos
    setTimeout(() => {
      obstacleSystemLockedRef.current = false;
      console.log("🔓 Sistema de obstáculos destravado após evento");
    }, 8000);

    console.log("🎮 Jogo despausado - sistema travado por 5s, cooldown:", collisionCooldownRef.current);
  };

  return (

    <div style={{ position: "relative" }}>
      
      {/* Indicador de carregamento */}
      {!gameLoaded && !loadingError && (
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 2000,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          color: "white",
          padding: "20px",
          borderRadius: "10px",
          textAlign: "center",
          fontSize: "18px"
        }}>
          <div>🎮 Carregando jogo...</div>
          <div style={{ fontSize: "14px", marginTop: "10px" }}>
            Veículo: {vehicle.name}
          </div>
        </div>
      )}
      
      {/* Indicador de erro */}
      {loadingError && (
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 2000,
          backgroundColor: "rgba(220, 20, 60, 0.9)",
          color: "white",
          padding: "20px",
          borderRadius: "10px",
          textAlign: "center",
          fontSize: "16px"
        }}>
          <div>❌ Erro ao carregar o jogo</div>
          <div style={{ fontSize: "12px", marginTop: "10px" }}>
            {loadingError}
          </div>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: "15px",
              padding: "8px 16px",
              backgroundColor: "white",
              color: "red",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Recarregar
          </button>
        </div>
      )}

     <div style={{
        position: "fixed",
        top: "2vh",
        left: "2vw",
        zIndex: 1000
      }}>
      <button
        onClick={() => {
          // Salvar progresso do jogo antes de sair
          const gameProgress = {
            vehicle, 
            money,
            selectedRoute,
            currentFuel,
            progress,
            currentPathIndex,
            pathProgress: pathProgressRef.current,
            gameTime,
            manualTimeAdjustment: manualTimeAdjustment.current,
            timestamp: Date.now()
          };
          localStorage.setItem('savedGameProgress', JSON.stringify(gameProgress));
          // Log de progresso removido
          
          // Mostrar confirmação ao usuário
          const saveConfirmation = document.createElement('div');
          saveConfirmation.innerHTML = '💾 Progresso Salvo!';
          saveConfirmation.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #00cc66;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 3000;
            font-family: "Silkscreen", sans-serif;
            font-size: 14px;
            font-weight: bold;
            animation: fadeInOut 2s ease-in-out;
          `;
          
          // Adicionar animação CSS
          const style = document.createElement('style');
          style.textContent = `
            @keyframes fadeInOut {
              0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
              20% { opacity: 1; transform: translateX(-50%) translateY(0); }
              80% { opacity: 1; transform: translateX(-50%) translateY(0); }
              100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            }
          `;
          document.head.appendChild(style);
          document.body.appendChild(saveConfirmation);
          
          setTimeout(() => {
            saveConfirmation.remove();
            style.remove();
            navigate('/perfil');
          }, 2000);
        }}
        style={{
          backgroundColor: "#E3922A",
          border: "2px solid #000",
          borderRadius: "8px",
          padding: "min(1.5vh, 10px)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "2px 2px 4px rgba(0,0,0,0.3)",
          transition: "all 0.2s ease",
          width: "min(6vh, 50px)",
          height: "min(6vh, 50px)"
        }}
        title="Voltar ao Perfil (Progresso Salvo)"
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#FFC06F"}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#E3922A"}
      >
        <img 
          src="/assets/backArrow.png" 
          alt="Voltar" 
          style={{ 
            width: 'min(3vh, 24px)', 
            height: 'min(3vh, 24px)' 
          }}
        />
      </button>

    </div>


{/* Barra de progresso  */}
<div style={{
  position: "fixed",
  top: "2vh", // 2% da altura da viewport
  left: "50%",
  transform: "translateX(-50%)",
  width: "min(60vw, 800px)", // Máximo de 800px ou 60% da largura
  height: "min(4vh, 30px)", // Máximo de 30px ou 4% da altura
  backgroundColor: "#eee",
  zIndex: 1000,
  overflow: "hidden",
  borderRadius: "20px",
  padding: "2px"
}}>
  {/* Barra de progresso azul */}
  <div style={{
    width: `${progress}%`,
    height: "100%",
    backgroundColor: "#0077cc",
    transition: "width 0.2s ease",
    borderRadius: "20px 20px"
  }}></div>

  {/* Checkpoints fixos */}
  {[25, 50, 75].map((p) => (
    <div key={p} style={{
      position: "absolute",
      left: `${p}%`,
      top: "15%",
      transform: "translateX(-50%)",
      width: "20px",
      height: "20px",
      backgroundColor: "#fff",
      border: "2px solid #999",
      borderRadius: "50%",
      zIndex: 101,
    }}></div>
  ))}

  {/* Porcentagem atual */}
  <span style={{
    position: "absolute",
    right: "10px",
    top: "7px",
    fontSize: "12px",
    fontWeight: "bold",
    color: "#333",
    zIndex: 102,
    display: "flex",
    alignItems: "center"
  }}>
    {Math.floor(progress)}%
  </span>
</div>

  {/* Container para minimapa e informações no canto superior direito */}
  <div style={{
    position: "fixed",
    top: "2vh",
    right: "2vw",
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    gap: "1vh",
    alignItems: "flex-end"
  }}>
    {/* Mapa em tempo real mostrando a posição do caminhão na rota */}
    {selectedRoute?.pathCoordinates && (
      <div style={{
        width: "min(12vw, 180px)",
        height: "min(12vw, 180px)"
      }}>
      <GameMiniMap
        pathCoordinates={selectedRoute.pathCoordinates}
        currentPathIndex={currentPathIndex}
        pathProgress={pathProgressRef.current}
        vehicle={vehicle}
        progress={progress}
          className="w-full h-full border-2 border-white rounded-full overflow-hidden"
      />
      </div>
    )}

    {/* Informações do jogo: dinheiro, combustível e tempo */}
    <div style={{
      padding: "min(2vh, 15px)",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderRadius: "12px",
      fontFamily: "monospace",
      width: "min(18vw, 220px)",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      fontSize: "min(2vw, 16px)"
    }}>
      {/* Dinheiro */}
      <div style={{ fontSize: "16px", marginBottom: "10px", color: "#333" }}>
        💰 <strong>R$ {money.toFixed(2)}</strong>
      </div>
      
      {/* Combustível */}
      <div style={{ marginBottom: "10px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "4px"
        }}>
          <span style={{ fontSize: "16px" }}>⛽</span>
          <div style={{
            height: "10px",
            width: "120px",
            backgroundColor: "#ddd",
            borderRadius: "5px",
            overflow: "hidden"
          }}>
            <div style={{
              width: `${gasoline}%`,
              height: "100%",
              backgroundColor: gasoline > 30 ? "#00cc66" : gasoline > 15 ? "#ffaa00" : "#cc3300",
              transition: "width 0.3s ease"
            }}></div>
          </div>
        </div>
        <div style={{ fontSize: "12px", color: "#666", paddingLeft: "24px" }}>
          {currentFuel.toFixed(1)}L / {vehicle.maxCapacity}L
        </div>
      </div>

      {/* Tempo de viagem */}
      <div style={{ fontSize: "14px", color: "#333" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>⏱️</span>
          <strong>{formatTime(gameTime)}</strong>
        </div>
      </div>

      {/* Informações da rota */}
      {selectedRoute && (
        <div style={{ fontSize: "12px", color: "#666", marginTop: "8px", borderTop: "1px solid #eee", paddingTop: "8px" }}>
          <div>{selectedRoute.name}</div>
          <div>{selectedRoute.distance} km</div>
        </div>
      )}
    </div>
  </div>

      <canvas 
        ref={canvasRef} 
        width={window.innerWidth} 
        height={window.innerHeight}
        style={{
          display: "block",
          width: "100vw",
          height: "100vh",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1
        }}
      />

      
  
    {eventoAtual && !gameEnded && (

  <div
    style={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#f9f9f9",
      padding: "30px",
      borderRadius: "15px",
      boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
      textAlign: "center",
      minWidth: "400px",
      maxWidth: "600px",
      zIndex: 2000,
      border: "3px solid #333"
    }}
  >
   
    {/* Texto e descrição separados */}
    <div className="tittle" style={{ marginBottom: "10px" }}>
      <p style={{ fontSize: "28px",
        color: "#333",
        marginBottom: "5px",
        fontWeight: "bold" }}>
        {eventoAtual.texto}
      </p>
      <p style={{ fontSize: "16px",
         color: "#555" }}>
        {eventoAtual.desc}
      </p>
    </div>

    {/* Botões separados */}
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        flexWrap: "wrap",
        marginTop: "20px"
      }}
    >
      {eventoAtual.opcoes.map((opcao, index) => {
        // Extrair descrição e impactos para melhor formatação
        const parts = opcao.split(' - ');
        const description = parts[0];
        const impacts = parts[1] || '';
        
        return (
        <button
          key={index}
          onClick={() => handleOptionClick(opcao)}
          style={{
              padding: "15px 20px",
              borderRadius: "10px",
              border: "2px solid #fff",
            backgroundColor: index % 2 === 0 ? "#0077cc" : "#e63946",
            color: "white",
              fontSize: "14px",
            cursor: "pointer",
              transition: "all 0.3s ease",
              minWidth: "200px",
              textAlign: "center",
              lineHeight: "1.4",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#005fa3" : "#c92a2a";
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = index % 2 === 0 ? "#0077cc" : "#e63946";
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "5px" }}>
              {description}
            </div>
            <div style={{ 
              fontSize: "12px", 
              opacity: "0.9", 
              fontFamily: "monospace",
              backgroundColor: "rgba(255,255,255,0.1)",
              padding: "4px 8px",
              borderRadius: "4px",
              letterSpacing: "0.5px"
            }}>
              {impacts}
            </div>
        </button>
        );
      })}
    </div>
  </div>
)}
{showEndMessage && (
  <div className="endMessage"
    style={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "white",
      padding: "30px",
      borderRadius: "15px",
      boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
      zIndex: 2000,
      textAlign: "center",
      maxWidth: "400px",
      minWidth: "350px"
    }}
  >
    <h2 style={{ color: "#00cc66", marginBottom: "20px" }}>🏁 Parabéns!</h2>
    <p style={{ fontSize: "18px", marginBottom: "20px" }}>Você completou a viagem com sucesso!</p>
    
    <div style={{ 
      backgroundColor: "#f8f9fa", 
      padding: "15px", 
      borderRadius: "8px", 
      marginBottom: "20px",
      textAlign: "left"
    }}>
      <h3 style={{ margin: "0 0 10px 0", color: "#333" }}>Resultados Finais:</h3>
      <p style={{ margin: "5px 0" }}>🚛 Veículo: <strong>{vehicle.name}</strong></p>
      {selectedRoute && (
        <p style={{ margin: "5px 0" }}>🗺️ Rota: <strong>{selectedRoute.name}</strong></p>
      )}
      <p style={{ margin: "5px 0" }}>⏱️ Tempo total: <strong>{formatTime(gameTime)}</strong></p>
      <p style={{ margin: "5px 0" }}>💰 Dinheiro final: <strong>R$ {money.toFixed(2)}</strong></p>
      <p style={{ margin: "5px 0" }}>⛽ Combustível restante: <strong>{currentFuel.toFixed(1)}L ({gasoline.toFixed(1)}%)</strong></p>
    </div>
    
    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
      <button
        onClick={() => navigate('/routes')}
        style={{
          padding: "12px 20px",
          backgroundColor: "#0077cc",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold"
        }}
      >
        Nova Viagem
      </button>
      <button
        onClick={() => navigate('/select-vehicle')}
        style={{
          padding: "12px 20px",
          backgroundColor: "#6c757d",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px"
        }}
      >
        Trocar Veículo
      </button>
    </div>
  </div>
)}
</div>


  );
}