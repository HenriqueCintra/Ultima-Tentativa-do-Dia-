// src/pages/ChooseTeam/ChooseTeam.tsx
import { useState } from 'react'; // <-- VERIFIQUE SE O useState ESTÁ IMPORTADO
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TeamService } from '../../api/teamService';
import { Team } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import TeamCard from '../../components/TeamCard';
import CreateTeamButton from '../../components/CreateTeamButton';
import SelectTeamButton from '../../components/SelectTeamButton';
import { ButtonHomeBack } from '@/components/ButtonHomeBack';
import { ArrowLeft, House, LogIn } from 'lucide-react'; // <-- IMPORTE O ÍCONE LogIn

export const ChooseTeam = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  // 1. ADICIONE UM ESTADO PARA GUARDAR O CÓDIGO DIGITADO
  const [inviteCode, setInviteCode] = useState('');

  // Busca as equipes da API
  const { data: teams, isLoading, isError } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: TeamService.getTeams,
  });

  // Mutação para entrar em uma equipe (esta lógica já existe no seu arquivo)
  const joinTeamMutation = useMutation({
    mutationFn: (code: string) => TeamService.joinTeam(code),
    onSuccess: async () => {
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      alert("Você entrou na equipe com sucesso!");
      navigate("/game-selection"); // Redireciona para a seleção de jogo
    },
    onError: (err: any) => alert(`Erro: ${err.response?.data?.detail || "Código inválido ou você já está em uma equipe."}`),
  });

  // 2. CRIE UMA FUNÇÃO PARA LIDAR COM O CLIQUE NO BOTÃO "ENTRAR"
  const handleJoinWithCode = () => {
    if (!inviteCode.trim()) {
      alert("Por favor, digite um código de convite.");
      return;
    }
    joinTeamMutation.mutate(inviteCode);
  };

  const handleTeamClick = (id: number) => {
    setSelectedTeamId(id);
  };

  const handleCreateTeam = () => {
    navigate("/perfil/criar-equipe"); // Corrigido para a rota correta de criação
  };

  const handleSelectTeam = () => {
    // Esta função é para selecionar uma equipe da lista, não para entrar com código.
    // A lógica aqui pode ser para "espectar" uma equipe, por exemplo.
    // Vamos manter o foco em entrar com código.
    if (selectedTeamId) {
      alert("Funcionalidade de selecionar equipe da lista a ser implementada.");
    }
  };

  if (isLoading) return <div className="text-white text-center">Carregando equipes...</div>;
  if (isError) return <div className="text-red-500 text-center">Erro ao carregar equipes.</div>;

  return (
    <div className="h-screen bg-gradient-to-b from-indigo-900 to-purple-700 font-pixel relative overflow-hidden flex flex-col">
      <img className="w-[375px] h-[147px] absolute top-[120px] left-[157px] object-cover animate-float-right z-0" alt="Nuvem" src="/nuvemleft.png" />
      <img className="w-[436px] h-[170px] absolute bottom-[30px] right-[27px] object-cover animate-float-left opacity-75 scale-110 z-0" alt="Nuvem" src="/nuvemright.png" />

      <div className="relative z-10 flex flex-col flex-1">
        <div className="flex gap-5 absolute top-14 left-[33px]">
          <ButtonHomeBack onClick={() => navigate(-1)}><ArrowLeft /></ButtonHomeBack>
          <ButtonHomeBack onClick={() => navigate("/perfil")}><House /></ButtonHomeBack>
        </div>
        <div className="flex-1 overflow-auto container mx-auto px-4 py-4">
          <h1 className="text-2xl md:text-2xl text-yellow-300 font-bold text-center mt-2 mb-8 tracking-wide" style={{ textShadow: '2px 3px 2px black' }}>
            ESCOLHA SUA EQUIPE
          </h1>

          {/* 3. ADICIONE A NOVA SEÇÃO DE UI AQUI */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Bloco de Criar Equipe */}
            <div className="bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-lg p-4">
              <CreateTeamButton onClick={handleCreateTeam} />
            </div>

            {/* Bloco de Entrar com Código */}
            <div className="bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-lg p-4 flex flex-col items-center justify-center">
              <h3 className="font-pixel text-cyan-400 text-center mb-4">ENTRAR COM CÓDIGO</h3>
              <div className="flex w-full gap-2">
                <input
                  type="text"
                  placeholder="DIGITE O CÓDIGO"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  maxLength={5}
                  className="flex-grow bg-white text-black font-bold p-2 border-2 border-black text-center text-xl tracking-widest"
                />
                <button
                  onClick={handleJoinWithCode}
                  disabled={joinTeamMutation.isPending}
                  className="bg-green-500 text-black font-bold p-3 border-2 border-black
                                   hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all 
                                   hover:-translate-x-[2px] hover:-translate-y-[2px] disabled:opacity-50"
                >
                  {joinTeamMutation.isPending ? '...' : <LogIn size={24} />}
                </button>
              </div>
            </div>
          </div>


          <div className="mb-6">
            <h2 className="text-2xl text-center text-yellow-300 font-bold mb-4 z-10" style={{ textShadow: '2px 3px 2px black' }}>OU ESCOLHA UMA EQUIPE DA LISTA</h2>
            <div className="space-y-4">
              {teams?.map(team => (
                <TeamCard
                  key={team.id}
                  team={team}
                  onClick={() => handleTeamClick(team.id)}
                  selected={team.id === selectedTeamId}
                />
              ))}
            </div>
          </div>
          <div className="justify-center flex">
            <SelectTeamButton onClick={handleSelectTeam} />
          </div>
        </div>
      </div>
    </div>
  );
};