import React from 'react';
import { useNavigate } from "react-router-dom";
import GameCard from './components/GameCard';
import PixelHeading from './components/PixelHeading';
import Footer from './components/Footer';
import { ArrowLeft, ImageIcon } from 'lucide-react';
import { ButtonHomeBack } from '@/components/ButtonHomeBack';


const GameSelectionScreen= () => {
  const [selectedCardIndex, setSelectedCardIndex] = React.useState(0);
  //se o usuario clicar no primeiro jogo ele é redirecionado para tela de tutorial
  const navigate = useNavigate();
  const handleGameClick = (index: number) => {
    if (index === 1) {
      navigate('/tutorial');
    }
  };
  const games = [
    {
      id: 1,
      title: 'ENTREGA EFICIENTE',
      description: 'GERENCIE SUA FROTA DE CAMINHÕES, ESCOLHA AS MELHORES ROTAS E FAÇA ENTREGAS COM EFICIÊNCIA.',
      color: 'yellow',
      borderColor: 'border-yellow-500',
      buttonBgColor: 'bg-yellow-500',
      buttonHoverColor: 'hover:bg-yellow-600',
      isActive: true,
    },
    {
      id: 2,
      title: 'Centro de Distribuição',
      description: 'Gerencie o fluxo de produtos em seu centro de distribuição, otimizando a logística e reduzindo custos.',
      color: 'green',
      borderColor: 'border-green-200',
      buttonBgColor: 'bg-green-200',
      buttonHoverColor: 'hover:bg-green-300',
      isActive: false,
    },
    {
      id: 3,
      title: 'Gestão de Estoque',
      description: 'Gerencie o estoque de produtos, otimizando a distribuição e reduzindo custos.',
      color: 'blue',
      borderColor: 'border-blue-200',
      buttonBgColor: 'bg-blue-200',
      buttonHoverColor: 'hover:bg-blue-300',
      isActive: false,
    },
  ];

  
  
  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-purple-900 to-indigo-800 flex flex-col items-center justify-between py-12 px-4"
      style={{ fontFamily: "'Press Start 2P', cursive" }}
    >
       <div className="flex gap-5 absolute top-14 left-[33px]">
              <ButtonHomeBack onClick={() => navigate(-1)}><ArrowLeft /></ButtonHomeBack>
              {/* <ButtonHomeBack onClick={() => navigate("/")}><House /></ButtonHomeBack> */}
            </div>
      <div className="w-full max-w-6xl flex flex-col items-center">
        <PixelHeading text="ESCOLHA SEU JOGO" className="mb-12 mt-8" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {games.map((game, index) => (
            <GameCard
              key={game.id}
              title={game.title}
              description={game.description}
              isActive={game.isActive}
              onClick={() => handleGameClick(game.id)}
              borderColor={game.borderColor}
              buttonBgColor={game.buttonBgColor}
              buttonHoverColor={game.buttonHoverColor}
              icon={<ImageIcon className="w-12 h-12" />}
            />
          ))}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default GameSelectionScreen;