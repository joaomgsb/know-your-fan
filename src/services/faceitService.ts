export interface FaceitPlayer {
  player_id: string;
  nickname: string;
  avatar: string;
  country: string;
  games: {
    cs2?: {
      skill_level: number;
      faceit_elo: number;
    };
  };
}

export interface FaceitPlayerStats {
  lifetime: {
    'Matches': string;
    'Win Rate %': string;
    'Current Win Streak': string;
    'Longest Win Streak': string;
    'K/D Ratio': string;
    'Average K/D Ratio': string;
    'Average Headshots %': string;
    'Total Headshots %': string;
    'Win Rate': string;
    'Recent Results': string[];
    'Average Kills': string;
    'Average Deaths': string;
    'Average MVPs': string;
    'Average Assists': string;
  };
}

export interface FaceitMatch {
  match_id: string;
  started_at: number;
  finished_at: number;
  game_mode: string;
  map: string;
  results: {
    score: {
      faction1: number;
      faction2: number;
    };
    winner: 'faction1' | 'faction2';
  };
  stats: {
    Kills: string;
    'K/D Ratio': string;
    'K/R Ratio': string;
    Assists: string;
    Deaths: string;
    'Average Damage per Round': string;
    Headshots: string;
    'Headshots %': string;
  };
  elo: number;
  elo_change: number;
  playerTeam: 'faction1' | 'faction2';
}

export interface FaceitMatchHistory {
  items: FaceitMatch[];
}

export interface MatchPlayerStats {
  player_stats: {
    Kills: string;
    Deaths: string;
    Assists: string;
    'K/D Ratio': string;
    'K/R Ratio': string;
    'Average Damage per Round': string;
    'Headshots %': string;
  };
  player_id: string;
}

export interface MatchTeam {
  players: MatchPlayerStats[];
}

export interface MatchRound {
  teams: MatchTeam[];
}

export interface MatchStats {
  rounds: MatchRound[];
}

export interface RosterPlayer {
  player_id: string;
  nickname: string;
}

export interface TeamRoster {
  roster: RosterPlayer[];
}

export interface MatchDetails {
  teams: {
    faction1: TeamRoster;
    faction2: TeamRoster;
  };
  results: {
    score: {
      faction1: number;
      faction2: number;
    };
    winner: 'faction1' | 'faction2';
  };
  voting: {
    map: {
      pick: string[];
    };
  };
}

class FaceitService {
  private readonly API_URL = 'https://open.faceit.com/data/v4';
  private readonly API_KEY = import.meta.env.VITE_FACEIT_API_KEY;
  private readonly GAME_ID = 'cs2';

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.API_KEY}`,
      'Accept': 'application/json'
    };
  }

  /**
   * Busca um jogador pelo nickname
   */
  async getPlayer(nickname: string): Promise<FaceitPlayer> {
    const response = await fetch(`${this.API_URL}/players?nickname=${encodeURIComponent(nickname)}&game=${this.GAME_ID}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Jogador não encontrado');
    }

    return response.json();
  }

  /**
   * Busca estatísticas de um jogador
   */
  async getPlayerStats(playerId: string): Promise<FaceitPlayerStats> {
    const response = await fetch(`${this.API_URL}/players/${playerId}/stats/${this.GAME_ID}`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      throw new Error('Estatísticas não encontradas');
    }

    return response.json();
  }

  /**
   * Busca os detalhes de uma partida específica
   */
  async getMatchStats(matchId: string, playerId: string): Promise<MatchPlayerStats | null> {
    const response = await fetch(`${this.API_URL}/matches/${matchId}/stats`, {
      headers: this.getHeaders()
    });

    if (!response.ok) {
      return null;
    }

    const data: MatchStats = await response.json();
    
    // Encontrar as estatísticas do jogador específico
    const playerStats = data.rounds[0]?.teams
      .flatMap(team => team.players)
      .find(player => player.player_id === playerId);

    if (playerStats) {
      // Garantir que o ADR seja um número
      const adr = playerStats.player_stats['Average Damage per Round'];
      playerStats.player_stats['Average Damage per Round'] = adr ? String(Math.round(Number(adr))) : '0';
    }

    return playerStats || null;
  }

  /**
   * Busca o histórico de partidas de um jogador com estatísticas detalhadas
   */
  async getPlayerHistory(playerId: string, limit: number = 20): Promise<FaceitMatchHistory> {
    const response = await fetch(
      `${this.API_URL}/players/${playerId}/history?game=${this.GAME_ID}&offset=0&limit=${limit}`,
      {
        headers: this.getHeaders()
      }
    );

    if (!response.ok) {
      throw new Error('Histórico não encontrado');
    }

    const history = await response.json();

    // Buscar estatísticas detalhadas para cada partida
    const matchesWithStats = await Promise.all(
      history.items.map(async (match: FaceitMatch) => {
        const matchDetails: MatchDetails = await fetch(`${this.API_URL}/matches/${match.match_id}`, {
          headers: this.getHeaders()
        }).then(res => res.json());

        const stats = await this.getMatchStats(match.match_id, playerId);
        const playerTeam = matchDetails.teams.faction1.roster.some(p => p.player_id === playerId) ? 'faction1' : 'faction2';
        
        if (stats) {
          return {
            ...match,
            results: {
              score: {
                faction1: matchDetails.results.score.faction1,
                faction2: matchDetails.results.score.faction2
              },
              winner: matchDetails.results.winner
            },
            map: matchDetails.voting.map.pick[0],
            stats: {
              Kills: stats.player_stats.Kills || '0',
              Deaths: stats.player_stats.Deaths || '0',
              Assists: stats.player_stats.Assists || '0',
              'K/D Ratio': stats.player_stats['K/D Ratio'] || '0',
              'K/R Ratio': stats.player_stats['K/R Ratio'] || '0',
              'Average Damage per Round': stats.player_stats['Average Damage per Round'] || '0',
              'Headshots %': stats.player_stats['Headshots %'] || '0'
            },
            playerTeam
          };
        }
        return match;
      })
    );

    return {
      items: matchesWithStats
    };
  }
}

export const faceitService = new FaceitService(); 