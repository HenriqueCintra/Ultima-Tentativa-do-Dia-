import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
} from "../../components/ui/card";
import { PlayIcon, Trophy, TruckIcon, MapPin, DollarSign, Camera } from 'lucide-react';

interface UserData {
  name: string;
  level: number;
  xp: number;
  maxXp: number;
  xpPercentage: number;
  team: string;
  avatar: string;
  stats: {
    deliveries: number;
    distance: number;
    earnings: number;
    victories: number;
  };
}

export const PerfilPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [userData, setUserData] = useState<UserData>({
    name: "Aurelio de Boa",
    level: 12,
    xp: 2450,
    maxXp: 3000,
    xpPercentage: 83,
    team: "Fruit Vale",
    avatar: "/mario.png",
    stats: {
      deliveries: 12,
      distance: 12,
      earnings: 12,
      victories: 12
    }
  });

  const handlePlayNow = () => {
    navigate("/select-vehicle"); 
  };
  
  const handleContinueGame = () => {
    navigate("/select-vehicle"); 
  };
  
  const handleCheckRanking = () => {
    navigate("/ranking"); 
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (typeof result === 'string') {
            setUserData(prev => ({
              ...prev,
              avatar: result
            }));
          }
        };
        reader.readAsDataURL(file);
      } else {
        alert('Por favor, selecione apenas arquivos de imagem (PNG, JPG, GIF, etc.)');
      }
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  const handleEditProfile = () => {
    navigate("/perfil/editar");
  };

  const handleChangePassword = () => {
    navigate("/mudar-senha"); 
  };

  const handleLogout = () => {
    navigate("/login");
  };

  const titleStyle = {
    color: "#E3922A",
    textShadow: "2px 3px 0.6px #000"
  };

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="w-full min-h-screen [background:linear-gradient(180deg,rgba(57,189,248,1)_0%,rgba(154,102,248,1)_100%)] relative overflow-hidden">
        {}
        <img
          className="w-[375px] h-[147px] absolute top-[120px] left-[157px] object-cover animate-float-right"
          alt="Cloud decoration"
          src="/nuvemleft.png"
        />
        <img
          className="w-[436px] h-[170px] absolute bottom-[30px] right-[27px] object-cover animate-float-left opacity-75 scale-110"
          alt="Cloud decoration"
          src="/nuvemright.png"
        />
        
        {}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handlePhotoUpload}
          accept="image/*"
          className="hidden"
        />
        
        {}
        <div className="max-w-5xl mx-auto pt-20 px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {}
            <div className="space-y-4">
              <Card className="border-2 border-solid border-black rounded-lg overflow-hidden">
                <CardContent className="p-4">
                  <div className="text-center">
                    <h2 className="[font-family:'Silkscreen',Helvetica] font-bold text-2xl pb-1 border-b-2 border-black" style={titleStyle}>
                      SEU PERFIL
                    </h2>
                    
                    {}
                    <div className="mt-3 flex justify-center">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-teal-100 border-4 border-teal-500 flex items-center justify-center overflow-hidden relative group">
                          <img 
                            src={userData.avatar} 
                            alt="Avatar" 
                            className="w-20 h-20 object-cover"
                          />
                          
                          {}
                          <div 
                            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer rounded-full"
                            onClick={handleClickUpload}
                          >
                            <Camera size={20} className="text-white" />
                          </div>
                        </div>
                        
                        {}
                      </div>
                    </div>
                    
                    {}
                    <h3 className="[font-family:'Silkscreen',Helvetica] font-bold text-center text-xl mt-2">
                      {userData.name}
                    </h3>
                    
                    {}
                    <div className="flex items-center justify-center mt-1">
                      <span className="text-yellow-500 mr-1">🏆</span>
                      <span className="[font-family:'Silkscreen',Helvetica]">
                        NÍVEL {userData.level}
                      </span>
                    </div>
                    
                    {}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs [font-family:'Silkscreen',Helvetica] mb-1">
                        <span>XP: {userData.xp}/{userData.maxXp}</span>
                        <span>{userData.xpPercentage}%</span>
                      </div>
                      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden border border-black">
                        <div 
                          className="h-full bg-yellow-500" 
                          style={{ width: `${userData.xpPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {}
                    <div className="mt-4 [font-family:'Silkscreen',Helvetica]">
                      <span className="font-bold">EQUIPE: </span>
                      <span className="text-orange-500 font-bold">{userData.team}</span>
                    </div>
                    
                    {}
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <Button 
                        variant="outline" 
                        className="flex flex-col items-center justify-center h-16 border-2 border-black"
                        onClick={handleEditProfile} 
                      >
                        <span className="text-2xl">👤</span>
                        <span className="text-xs [font-family:'Silkscreen',Helvetica]">EDITAR PERFIL</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex flex-col items-center justify-center h-16 border-2 border-black"
                        onClick={handleChangePassword}
                      >
                        <span className="text-2xl">🔑</span>
                        <span className="text-xs [font-family:'Silkscreen',Helvetica]">SENHA</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex flex-col items-center justify-center h-16 border-2 border-black"
                        onClick={handleLogout}
                      >
                        <span className="text-2xl">↪️</span>
                        <span className="text-xs [font-family:'Silkscreen',Helvetica]">SAIR</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {}
            <div className="space-y-4">
              {}
              <Card className="border-2 border-solid border-black rounded-lg overflow-hidden">
                <CardContent className="p-4">
                  {}
                  <div className="flex justify-between items-center">
                    {}
                    <div>
                      <h2 className="[font-family:'Silkscreen',Helvetica] font-bold text-2xl" style={titleStyle}>
                        ENTREGA EFICIENTE
                      </h2>
                      <p className="[font-family:'Silkscreen',Helvetica] text-sm mt-1">
                        CONTINUE SUA JORNADA DE ENTREGAS!
                      </p>
                    </div>
                    
                    {}
                    <Button 
                      onClick={handlePlayNow}
                      className="bg-orange-400 text-black hover:bg-orange-500 h-12 flex items-center justify-between px-4 rounded border-2 border-black [font-family:'Silkscreen',Helvetica] font-bold"
                    >
                      <span>JOGAR AGORA</span>
                      <PlayIcon className="ml-2" />
                    </Button>
                  </div>
                  
                  {}
                  <div className="text-center mt-1">
                    <button 
                      onClick={() => navigate("/games")}
                      className="text-xs underline [font-family:'Silkscreen',Helvetica] text-blue-500"
                    >
                      JOGAR OUTRO JOGO!
                    </button>
                  </div>
                </CardContent>
              </Card>
              
              {}
              <div className="grid grid-cols-4 gap-3">
                {/* Entregas */}
                <Card className="border-2 border-solid border-black rounded-lg overflow-hidden">
                  <CardContent className="py-3 px-4 flex flex-col items-center">
                    <TruckIcon size={24} />
                    <div className="[font-family:'Silkscreen',Helvetica] text-center mt-1">
                      <span className="text-xs">ENTREGAS</span>
                      <div className="font-bold">{userData.stats.deliveries}</div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Distância */}
                <Card className="border-2 border-solid border-black rounded-lg overflow-hidden">
                  <CardContent className="py-3 px-4 flex flex-col items-center">
                    <MapPin size={24} color="#4ade80" />
                    <div className="[font-family:'Silkscreen',Helvetica] text-center mt-1">
                      <span className="text-xs">DISTÂNCIA</span>
                      <div className="font-bold">{userData.stats.distance}</div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Ganhos */}
                <Card className="border-2 border-solid border-black rounded-lg overflow-hidden">
                  <CardContent className="py-3 px-4 flex flex-col items-center">
                    <DollarSign size={24} color="#eab308" />
                    <div className="[font-family:'Silkscreen',Helvetica] text-center mt-1">
                      <span className="text-xs">GANHOS</span>
                      <div className="font-bold">{userData.stats.earnings}</div>
                    </div>
                  </CardContent>
                </Card>
                
                {}
                <Card className="border-2 border-solid border-black rounded-lg overflow-hidden">
                  <CardContent className="py-3 px-4 flex flex-col items-center">
                    <span className="text-2xl">🏆</span>
                    <div className="[font-family:'Silkscreen',Helvetica] text-center mt-1">
                      <span className="text-xs">VITÓRIAS</span>
                      <div className="font-bold">{userData.stats.victories}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {}
              <div className="grid grid-cols-2 gap-3">
                {}
                <Card className="border-2 border-solid border-black rounded-lg overflow-hidden">
                  <CardContent className="p-4" onClick={handleCheckRanking}>
                    <div className="flex items-center">
                      <Trophy size={32} className="text-yellow-500" />
                      <div className="ml-3">
                        <h3 className="[font-family:'Silkscreen',Helvetica] font-bold" style={titleStyle}>
                          RANKING
                        </h3>
                        <p className="[font-family:'Silkscreen',Helvetica] text-xs">
                          VEJA OS MELHORES JOGADORES
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {}
                <Card className="border-2 border-solid border-black rounded-lg overflow-hidden">
                  <CardContent className="p-4" onClick={handleContinueGame}>
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center">
                        <span className="text-white text-2xl">⏱️</span>
                      </div>
                      <div className="ml-3">
                        <h3 className="[font-family:'Silkscreen',Helvetica] font-bold" style={titleStyle}>
                          CONTINUAR
                        </h3>
                        <p className="[font-family:'Silkscreen',Helvetica] text-xs">
                          RETOMAR A ÚLTIMA PARTIDA
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilPage;