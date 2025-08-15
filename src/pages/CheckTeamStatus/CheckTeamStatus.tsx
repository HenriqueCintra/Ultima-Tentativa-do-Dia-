import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const CheckTeamStatus = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      if (user.equipe) {
        // Se tem equipe, vai direto para aceitar o desafio
        navigate('/desafio');
      } else {
        // Se não tem equipe, vai para escolher equipe
        navigate('/choose-team');
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-sky-300 to-purple-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black mx-auto mb-4"></div>
          <p className="[font-family:'Silkscreen',Helvetica] text-black text-lg">VERIFICANDO EQUIPE...</p>
        </div>
      </div>
    );
  }

  return null;
};