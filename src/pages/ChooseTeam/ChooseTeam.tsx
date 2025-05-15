import { useState } from 'react';
import Navigation from '../../components/Navigation';
import TeamCard from '../../components/TeamCard';
import CreateTeamButton from '../../components/CreateTeamButton';
import SelectTeamButton from '../../components/SelectTeamButton';
import Cloud from '../../components/Cloud';
import { TEAMS } from '../../constants/teams';
import { Team } from '../../types';

export const ChooseTeam = () =>{
  const [teams] = useState<Team[]>(TEAMS);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const handleTeamClick = (id: string) => {
    setSelectedTeamId(id);
  };

  const handleCreateTeam = () => {
    alert('Create new team functionality would be implemented here');
  };

  const handleSelectTeam = () => {
    if (selectedTeamId) {
      alert(`Selected team: ${teams.find(team => team.id === selectedTeamId)?.name}`);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-b from-indigo-900 to-purple-700 font-pixel relative overflow-hidden flex flex-col">
      {/* Pixel Clouds */}
      <Cloud position="top-10 left-20" className="opacity-50 absolute" />
      <Cloud position="bottom-20 right-10" className="opacity-50 absolute" />
      
      {/* Navigation */}
      <Navigation />
      
      <div className="flex-1 overflow-auto container mx-auto px-4 py-4">
        {/* Title */}
        <h1
          className="text-2xl md:text-2xl text-yellow-300 font-bold text-center mt-2 mb-8 tracking-wide"
          style={{ textShadow: '2px 3px 2px black' }}
        >
          ESCOLHA SUA EQUIPE
        </h1>

        
        {/* Create Team Button */}
        <div className="bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-lg p-2.5 mb-2">
          <CreateTeamButton onClick={handleCreateTeam} />
        </div>
        
        {/* Team List Section */}
        <div className="mb-6">
          <h2 className="text-2xl text-center text-yellow-300 font-bold mb-4"
              style={{ textShadow: '2px 3px 2px black' }}>EQUIPES</h2>
          <div className="space-y-4">
            {teams.map(team => (
              <TeamCard
                key={team.id}
                team={team}
                onClick={handleTeamClick}
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
  );
}
