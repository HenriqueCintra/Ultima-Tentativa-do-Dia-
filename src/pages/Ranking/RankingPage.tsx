import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "../../components/ui/button"; 
import {
  Card,
  CardContent,
} from "../../components/ui/card"; 
import {
  ArrowLeft,
  Trophy,
  TrendingUp,
  Package,
  Target,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface TeamRanking {
  position: number;
  name: string;
  points: number;
  deliveries: number;
  efficiency: number;
  icon: string;
}

interface UserStats {
  position: number;
  points: number;
  deliveries: number;
  efficiency: number;
}

export const RankingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'PONTOS' | 'ENTREGAS' | 'EFICIENCIA'>('PONTOS');
  
  // Verifica se veio da tela de perfil através do state da navegação
  const cameFromProfile = location.state?.from === 'profile';
  
  const userStats: UserStats = {
    position: 4,
    points: 1000,
    deliveries: 4,
    efficiency: 95
  };

  const teamRankings: TeamRanking[] = [
    {
      position: 1,
      name: "FRUIT VALE",
      points: 1200,
      deliveries: 126,
      efficiency: 98,
      icon: "🏆"
    },
    {
      position: 2,
      name: "DEU VALE",
      points: 1000,
      deliveries: 110,
      efficiency: 92,
      icon: "🥈"
    },
    {
      position: 3,
      name: "DEU MOLE",
      points: 999,
      deliveries: 99,
      efficiency: 89,
      icon: "🥉"
    },
    {
      position: 4,
      name: "É VAPO",
      points: 935,
      deliveries: 95,
      efficiency: 100,
      icon: "4"
    },
    {
      position: 5,
      name: "SCAN AI",
      points: 940,
      deliveries: 60,
      efficiency: 100,
      icon: "5"
    },
    {
      position: 6,
      name: "SACI",
      points: 299,
      deliveries: 10,
      efficiency: 80,
      icon: "6"
    }
  ];

  const handleNavigateBack = () => {
    if (cameFromProfile) {
      // Se veio do perfil, volta para o perfil
      navigate("/perfil");
    } else {
      // Caso contrário, usa a navegação padrão (voltar na história)
      navigate(-1);
    }
  };

  const handleOkClick = () => {
    if (cameFromProfile) {
      // Se veio do perfil, volta para o perfil
      navigate("/perfil");
    } else {
      // Se veio do login, decide para onde ir baseado na equipe
      if (user?.equipe) {
        navigate("/game-selection");
      } else {
        navigate("/choose-team");
      }
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return "🏆";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return position.toString();
    }
  };

  const getRowColor = (position: number) => {
    switch (position) {
      case 1:
        return "bg-yellow-100 border-yellow-300";
      case 2:
        return "bg-gray-100 border-gray-300";
      case 3:
        return "bg-orange-100 border-orange-300";
      default:
        return "bg-white border-gray-200";
    }
  };

  const getSortedData = () => {
    switch (activeTab) {
      case 'ENTREGAS':
        return [...teamRankings].sort((a, b) => b.deliveries - a.deliveries);
      case 'EFICIENCIA':
        return [...teamRankings].sort((a, b) => b.efficiency - a.efficiency);
      default:
        return [...teamRankings].sort((a, b) => b.points - a.points);
    }
  };

  const getValueByTab = (team: TeamRanking) => {
    switch (activeTab) {
      case 'ENTREGAS':
        return team.deliveries;
      case 'EFICIENCIA':
        return `${team.efficiency}%`;
      default:
        return team.points;
    }
  };

  const silkscreenFont = "[font-family:'Silkscreen',Helvetica]";
  const buttonBaseStyle = `${silkscreenFont} border-2 border-black rounded-md px-4 py-2 text-xs font-bold flex items-center justify-center transition-all`;

  return (
    <div className="bg-white w-full h-screen overflow-hidden">
      <div className={`w-full h-full [background:linear-gradient(180deg,rgba(57,189,248,1)_0%,rgba(154,102,248,1)_100%)] relative overflow-hidden ${silkscreenFont}`}>
        {/* Decorative clouds */}
        <img
          className="w-[375px] h-[147px] absolute top-[80px] left-[calc(50%_-_650px)] object-cover animate-float-right opacity-80 z-0"
          alt="Cloud decoration left"
          src="/nuvemleft.png"
        />
        <img
          className="w-[436px] h-[170px] absolute bottom-[30px] right-[calc(50%_-_700px)] object-cover animate-float-left opacity-75 scale-110 z-0"
          alt="Cloud decoration right"
          src="/nuvemright.png"
        />

        {/* Navigation buttons - só mostra se veio do perfil */}
        {cameFromProfile && (
          <div className="absolute top-4 left-4 z-20">
            <Button onClick={handleNavigateBack} variant="outline" className="p-2 bg-white border-2 border-black rounded-md hover:bg-gray-200">
              <ArrowLeft size={24} className="text-black" />
            </Button>
          </div>
        )}
        
        {/* Main content */}
        <div className="h-full flex items-center justify-center px-4 relative z-10">
          <div className="max-w-4xl w-full">
            <Card className="border-2 border-solid border-black rounded-lg overflow-hidden bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <CardContent className="p-4">
                {/* Header */}
                <div className="text-center mb-4">
                  <h1 className={`${silkscreenFont} text-xl font-bold text-[#E3922A]`} style={{textShadow: "2px 3px 0.6px #000"}}>
                    RANKING
                  </h1>
                </div>

                {/* User position card */}
                <div className="mb-4">
                  <Card className="bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-yellow-400 border-2 border-black rounded-full flex items-center justify-center">
                            <Trophy size={20} className="text-black" />
                          </div>
                          <div>
                            <p className={`${silkscreenFont} text-xs text-gray-600 mb-1`}>SUA POSIÇÃO</p>
                            <p className={`${silkscreenFont} text-lg font-bold text-black`}>{userStats.position}°</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="grid grid-cols-3 gap-3 text-center">
                            <div>
                              <p className={`${silkscreenFont} text-xs text-gray-600 mb-1`}>PONTOS</p>
                              <p className={`${silkscreenFont} text-sm font-bold text-black`}>{userStats.points}</p>
                            </div>
                            <div>
                              <p className={`${silkscreenFont} text-xs text-gray-600 mb-1`}>ENTREGAS</p>
                              <p className={`${silkscreenFont} text-sm font-bold text-black`}>{userStats.deliveries}</p>
                            </div>
                            <div>
                              <p className={`${silkscreenFont} text-xs text-gray-600 mb-1`}>EFICIÊNCIA</p>
                              <p className={`${silkscreenFont} text-sm font-bold text-black`}>{userStats.efficiency}%</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tab buttons */}
                <div className="flex justify-center mb-4">
                  <div className="flex border-2 border-black rounded-md overflow-hidden">
                    <Button
                      onClick={() => setActiveTab('PONTOS')}
                      className={`${silkscreenFont} text-xs font-bold px-3 py-2 border-r-2 border-black rounded-none ${
                        activeTab === 'PONTOS' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white text-black hover:bg-gray-100'
                      }`}
                    >
                      <TrendingUp size={12} className="mr-1" />
                      PONTOS
                    </Button>
                    <Button
                      onClick={() => setActiveTab('ENTREGAS')}
                      className={`${silkscreenFont} text-xs font-bold px-3 py-2 border-r-2 border-black rounded-none ${
                        activeTab === 'ENTREGAS' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white text-black hover:bg-gray-100'
                      }`}
                    >
                      <Package size={12} className="mr-1" />
                      ENTREGAS
                    </Button>
                    <Button
                      onClick={() => setActiveTab('EFICIENCIA')}
                      className={`${silkscreenFont} text-xs font-bold px-3 py-2 rounded-none ${
                        activeTab === 'EFICIENCIA' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-white text-black hover:bg-gray-100'
                      }`}
                    >
                      <Target size={12} className="mr-1" />
                      EFICIÊNCIA
                    </Button>
                  </div>
                </div>

                {/* Ranking table */}
                <div className="overflow-hidden border-2 border-black rounded-lg mb-4">
                  {/* Table header */}
                  <div className="grid grid-cols-4 bg-gray-200 border-b-2 border-black">
                    <div className={`${silkscreenFont} text-xs font-bold p-2 text-center border-r-2 border-black`}>#</div>
                    <div className={`${silkscreenFont} text-xs font-bold p-2 text-center border-r-2 border-black`}>EQUIPE</div>
                    <div className={`${silkscreenFont} text-xs font-bold p-2 text-center border-r-2 border-black`}>
                      {activeTab === 'PONTOS' ? 'PONTOS' : activeTab === 'ENTREGAS' ? 'ENTREGAS' : 'EFICIÊNCIA'}
                    </div>
                    <div className={`${silkscreenFont} text-xs font-bold p-2 text-center`}>
                      {activeTab === 'PONTOS' ? 'ENTREGAS' : activeTab === 'ENTREGAS' ? 'EFICIÊNCIA' : 'PONTOS'}
                    </div>
                  </div>

                  {/* Table rows */}
                  {getSortedData().map((team, index) => (
                    <div 
                      key={team.name} 
                      className={`grid grid-cols-4 border-b border-gray-300 last:border-b-0 ${getRowColor(index + 1)}`}
                    >
                      <div className={`${silkscreenFont} text-sm font-bold p-2 text-center border-r border-gray-300 flex items-center justify-center`}>
                        <span className="text-lg">{getPositionIcon(index + 1)}</span>
                      </div>
                      <div className={`${silkscreenFont} text-sm font-bold p-2 border-r border-gray-300 flex items-center`}>
                        {team.name}
                      </div>
                      <div className={`${silkscreenFont} text-sm p-2 text-center border-r border-gray-300 flex items-center justify-center`}>
                        {getValueByTab(team)}
                      </div>
                      <div className={`${silkscreenFont} text-sm p-2 text-center flex items-center justify-center`}>
                        {activeTab === 'PONTOS' ? team.deliveries : 
                         activeTab === 'ENTREGAS' ? `${team.efficiency}%` : 
                         team.points}
                      </div>
                    </div>
                  ))}
                </div>

                {/* OK button */}
                <div className="flex justify-center">
                  <Button 
                    onClick={handleOkClick}
                    className={`${buttonBaseStyle} px-6 py-2 bg-[#E3922A] hover:bg-[#D4821A] text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]`}
                  >
                    OK
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankingPage;