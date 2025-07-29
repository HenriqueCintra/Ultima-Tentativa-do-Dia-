// src/hooks/useRanking.ts

import { useQuery } from '@tanstack/react-query';
import { TeamData, RankingApiResponse } from '../types/ranking';
import { GameService } from '../api/gameService';

export const useRanking = () => {
  // Busca os dados brutos da API usando react-query
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery<RankingApiResponse>({
    queryKey: ['ranking'],
    queryFn: GameService.getRanking,
    initialData: [], // Garante que sempre temos um array
  });

  // Garantir que data é sempre um array de TeamData
  const teamData: TeamData[] = Array.isArray(data) ? data : [];

  // Função para encontrar a posição de uma equipe pelo nome
  const getUserPosition = (teamName: string): number | null => {
    const index = teamData.findIndex((team: TeamData) => team.nome === teamName);
    return index !== -1 ? index + 1 : null;
  };

  // Função para obter os dados completos de uma equipe pelo nome
  const getUserTeamData = (teamName: string): TeamData | null => {
    return teamData.find((team: TeamData) => team.nome === teamName) || null;
  };

  return {
    teamData,
    loading: isLoading,
    error: isError ? (error as Error).message : null,
    refetch,
    getUserPosition,
    getUserTeamData,
  };
};