import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trophy, Star, Users, Activity } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { toast } from 'react-hot-toast';
import { faceitService } from '../services/faceitService';
import type { FaceitMatch } from '../services/faceitService';
import FaceitLevel from '../components/FaceitLevel';

interface PlayerDisplayData {
  player_id: string;
  nickname: string;
  avatar: string;
  country: string;
  games: {
    csgo?: {
      skill_level: number;
      faceit_elo: number;
    };
    cs2?: {
      skill_level: number;
      faceit_elo: number;
    };
  };
  statistics: {
    matches: number;
    winrate: number;
    kd_ratio: number;
    hs_ratio: number;
    history: FaceitMatch[];
    longest_win_streak: number;
  };
}

const FaceitPage: React.FC = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [playerData, setPlayerData] = useState<PlayerDisplayData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirecionar se não estiver logado
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname) {
      toast.error('Por favor, insira um nickname');
      return;
    }

    setIsLoading(true);
    try {
      // Buscar dados do jogador usando o serviço
      const data = await faceitService.getPlayer(nickname);
      
      // Se encontrou o jogador, buscar estatísticas
      if (data.player_id) {
        const stats = await faceitService.getPlayerStats(data.player_id);
        const history = await faceitService.getPlayerHistory(data.player_id);

        console.log(history)
        
        // Processar os valores numéricos corretamente
        const kdRatio = parseFloat(stats.lifetime['Average K/D Ratio']);
        const hsPercent = parseFloat(stats.lifetime['Average Headshots %']);
        const winRate = parseFloat(stats.lifetime['Win Rate %']);
        
        // Combinar todos os dados
        setPlayerData({
          ...data,
          statistics: {
            matches: Number(stats.lifetime['Matches']),
            winrate: winRate,
            kd_ratio: kdRatio,
            hs_ratio: hsPercent,
            history: history.items,
            longest_win_streak: Number(stats.lifetime['Longest Win Streak'])
          }
        });
        
        toast.success('Jogador encontrado!');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Erro ao buscar jogador: ${error.message}`);
      } else {
        toast.error('Erro ao buscar jogador. Verifique o nickname e tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderCountryFlag = (countryCode: string) => {
    return (
      <img
        src={`https://flagcdn.com/${countryCode.toLowerCase()}.svg`}
        alt={`Bandeira de ${countryCode}`}
        className="w-6 h-4 inline-block mr-2"
      />
    );
  };

  const renderMatchHistory = (matches: FaceitMatch[]) => {
    const getMapImage = (mapName: string | undefined) => {
      if (!mapName) return '/images/maps/default.jpg';
      
      const normalizedMapName = mapName.toLowerCase();
      const availableMaps = [
        'de_anubis',
        'de_inferno',
        'de_nuke',
        'de_dust2',
        'de_mirage'
      ];
      
      if (availableMaps.includes(normalizedMapName)) {
        return `/images/maps/${normalizedMapName}.jpeg`;
      }
      
      return '/images/maps/default.jpg';
    };

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b border-gray-200">
              <th className="py-4 px-6 text-left font-medium">DATA</th>
              <th className="py-4 px-6 text-left font-medium">MODE</th>
              <th className="py-4 px-6 text-left font-medium">RESULT</th>
              <th className="py-4 px-6 text-center font-medium">SCORE</th>
              <th className="py-4 px-6 text-center font-medium whitespace-nowrap">K / A / D</th>
              <th className="py-4 px-6 text-center font-medium">K/D</th>
              <th className="py-4 px-6 text-center font-medium">K/R</th>
              <th className="py-4 px-6 text-center font-medium">ADR</th>
              <th className="py-4 px-6 text-center font-medium">HS%</th>
              <th className="py-4 px-6 text-left font-medium">MAP</th>
              <th className="py-4 px-6 text-right font-medium">ELO</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => {
              const isWin = match.results.winner === match.playerTeam;
              const date = new Date(match.started_at * 1000);
              const formattedDate = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} - ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
              
              console.log(match)
              // Ajusta o placar baseado em qual time o jogador estava
              const myScore = match.playerTeam === 'faction1' ? match.results.score.faction1 : match.results.score.faction2;
              const enemyScore = match.playerTeam === 'faction1' ? match.results.score.faction2 : match.results.score.faction1;
              const score = `${myScore} / ${enemyScore}`;

              // Formata as estatísticas com espaçamento adequado
              const kills = match.stats?.Kills?.padStart(2, ' ') || '-';
              const assists = match.stats?.Assists?.padStart(2, ' ') || '-';
              const deaths = match.stats?.Deaths?.padStart(2, ' ') || '-';
              const kdr = match.stats?.['K/D Ratio'] ? Number(match.stats['K/D Ratio']).toFixed(2) : '-';
              const kr = match.stats?.['K/R Ratio'] ? Number(match.stats['K/R Ratio']).toFixed(2) : '-';
              const adr = match.stats?.['Average Damage per Round'] ? Math.round(Number(match.stats['Average Damage per Round'])) : '-';
              const hs = match.stats?.['Headshots %'] ? Math.round(Number(match.stats['Headshots %'])) : '-';
              
              return (
                <tr key={match.match_id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6 text-gray-600">{formattedDate}</td>
                  <td className="px-6 text-gray-600">5v5</td>
                  <td className="px-6">
                    <span className={`font-medium ${isWin ? 'text-green-500' : 'text-red-500'}`}>
                      {isWin ? 'WIN' : 'LOSS'}
                    </span>
                  </td>
                  <td className="px-6 text-center font-medium whitespace-nowrap">{score}</td>
                  <td className="px-6 text-center tabular-nums whitespace-nowrap">
                    {kills} / {assists} / {deaths}
                  </td>
                  <td className="px-6 text-center tabular-nums">{kdr}</td>
                  <td className="px-6 text-center tabular-nums">{kr}</td>
                  <td className="px-6 text-center tabular-nums">{adr}</td>
                  <td className="px-6 text-center tabular-nums">{hs}%</td>
                  <td className="px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 overflow-hidden rounded">
                        <img 
                          src={getMapImage(match.map)}
                          alt={match.map || 'Mapa desconhecido'} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-gray-600">{match.map}</span>
                    </div>
                  </td>
                  <td className="px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="tabular-nums">{match.elo || '-'}</span>
                      {match.elo_change && (
                        <span className={`tabular-nums ${match.elo_change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {match.elo_change > 0 ? `+${match.elo_change}` : match.elo_change}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Perfil Faceit</h1>
          <p className="mb-6 text-gray-600">
            Conecte sua conta Faceit para acompanhar suas estatísticas, histórico de partidas
            e receber recomendações personalizadas baseadas no seu perfil de jogador.
          </p>

          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                Nickname Faceit
              </label>
              <div className="flex gap-4">
                <input
                  id="nickname"
                  type="text"
                  className="input flex-1"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Digite seu nickname da Faceit"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary py-2 px-6 flex items-center"
                >
                  {isLoading ? (
                    <>
                      <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {playerData && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start gap-6">
              <img
                src={playerData.avatar || 'https://assets.faceit-cdn.net/avatars/default_avatar.jpg'}
                alt="Avatar"
                className="w-24 h-24 rounded-lg"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold text-gray-900">{playerData.nickname}</h2>
                  {playerData.country && renderCountryFlag(playerData.country)}
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Trophy className="h-4 w-4" />
                      <span className="text-sm">Nível</span>
                    </div>
                    <div className="flex items-center justify-center">
                      <FaceitLevel level={playerData.games?.cs2?.skill_level || 1} size="lg" />
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Star className="h-4 w-4" />
                      <span className="text-sm">ELO</span>
                    </div>
                    <p className="text-xl font-bold">{playerData.games?.cs2?.faceit_elo || '-'}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">Partidas</span>
                    </div>
                    <p className="text-xl font-bold">{playerData.statistics?.matches || '-'}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Activity className="h-4 w-4" />
                      <span className="text-sm">Win Rate</span>
                    </div>
                    <p className="text-xl font-bold">
                      {playerData.statistics?.winrate 
                        ? `${Math.round(playerData.statistics.winrate)}%` 
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Estatísticas Detalhadas</h3>
              <div className="bg-gray-50 rounded-lg">
                <div>
                  <div className="bg-black p-6 rounded-t-lg">
                    <h4 className="text-gray-300 text-sm font-medium mb-4">MAIN STATISTICS</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div className="bg-[#1F1F1F] p-4 rounded">
                        <p className="text-[#7B7A80] text-xs uppercase mb-4">Matches</p>
                        <p className="text-[#FBFBFB] text-2xl font-medium tabular-nums">
                          {playerData.statistics?.matches || '-'}
                        </p>
                      </div>

                      <div className="bg-[#1F1F1F] p-4 rounded">
                        <p className="text-[#7B7A80] text-xs uppercase mb-4">Win Rate %</p>
                        <p className="text-[#FBFBFB] text-2xl font-medium tabular-nums">
                          {playerData.statistics?.winrate
                            ? Math.round(playerData.statistics.winrate)
                            : '-'}
                        </p>
                      </div>

                      <div className="bg-[#1F1F1F] p-4 rounded">
                        <p className="text-[#7B7A80] text-xs uppercase mb-4">Longest Win Streak</p>
                        <p className="text-[#FBFBFB] text-2xl font-medium tabular-nums">
                          {playerData.statistics?.longest_win_streak || '10'}
                        </p>
                      </div>

                      <div className="bg-[#1F1F1F] p-4 rounded">
                        <p className="text-[#7B7A80] text-xs uppercase mb-4">Recent Results</p>
                        <div className="flex gap-2">
                          {(playerData.statistics?.history || []).slice(0, 5).map((match, index) => {
                            const isWin = match.results.winner === match.playerTeam;
                            return (
                              <span
                                key={index}
                                className={`text-lg font-medium ${isWin ? 'text-green-500' : 'text-red-500'}`}
                              >
                                {isWin ? 'W' : 'L'}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      <div className="bg-[#1F1F1F] p-4 rounded">
                        <p className="text-[#7B7A80] text-xs uppercase mb-4">Average K/D Ratio</p>
                        <p className="text-[#FBFBFB] text-2xl font-medium tabular-nums">
                          {playerData.statistics?.kd_ratio
                            ? Number(playerData.statistics.kd_ratio).toFixed(2)
                            : '-'}
                        </p>
                      </div>

                      <div className="bg-[#1F1F1F] p-4 rounded">
                        <p className="text-[#7B7A80] text-xs uppercase mb-4">Average Headshots %</p>
                        <p className="text-[#FBFBFB] text-2xl font-medium tabular-nums">
                          {playerData.statistics?.hs_ratio
                            ? Math.round(playerData.statistics.hs_ratio)
                            : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <h4 className="text-sm font-medium text-gray-700 p-4 border-y border-gray-200">Últimas 20 Partidas</h4>
                  <div className="bg-white rounded-md">
                    {playerData.statistics?.history && renderMatchHistory(playerData.statistics.history)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <Trophy className="h-6 w-6 text-gray-600" />
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Por que conectar sua conta Faceit?</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Acompanhe suas estatísticas em tempo real</li>
                <li>• Receba recomendações personalizadas baseadas no seu nível</li>
                <li>• Participe de torneios exclusivos para sua skill</li>
                <li>• Conecte-se com outros jogadores do seu nível</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaceitPage; 