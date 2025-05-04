import { validateProfileWithAI } from './openaiService';

interface ValidationResponse {
  isValid: boolean;
  confidence: number;
  reason?: string;
}

interface ProfileValidationData {
  platform: string;
  username: string;
  profileUrl: string;
  userInterests: string[];
}

// Função que simula uma validação com IA
export const validateProfileRelevance = async (data: ProfileValidationData): Promise<ValidationResponse> => {
  const { platform, username, profileUrl, userInterests } = data;
  
  // Primeiro, validar formato básico da URL
  const urlPatterns = {
    'FACEIT': /faceit\.com\/([\w-]+)/i,
    'GamersClub': /gamersclub\.com\.br\/player/i,
    'Steam': /steamcommunity\.com\/(?:id|profiles)/i,
    'Riot Games': /tracker\.gg\/valorant\/profile/i
  };

  const pattern = urlPatterns[platform as keyof typeof urlPatterns];
  if (!pattern?.test(profileUrl)) {
    return {
      isValid: false,
      confidence: 0.9,
      reason: `URL inválida para a plataforma ${platform}. O sistema detectou com alta certeza que este não é um link válido do ${platform}.`
    };
  }

  // Se a URL é válida, usar IA para análise mais profunda
  try {
    const aiValidation = await validateProfileWithAI(
      platform,
      username,
      profileUrl,
      userInterests
    );

    return aiValidation;
  } catch (error) {
    console.error('Erro na validação com IA, usando validação básica:', error);
    
    // Fallback para validação básica em caso de erro
    const platformGames: Record<string, string[]> = {
      'FACEIT': ['CS2'],
      'GamersClub': ['CS2'],
      'Steam': ['CS2', 'Rainbow Six'],
      'Riot Games': ['Valorant', 'League of Legends']
    };

    const relevantGames = platformGames[platform as keyof typeof platformGames] || [];
    const hasRelevantInterests = relevantGames.some(game => userInterests.includes(game));

    if (!hasRelevantInterests) {
      return {
        isValid: false,
        confidence: 0.7,
        reason: `Esta plataforma é mais relacionada a ${relevantGames.join(', ')}, que não estão nos seus interesses.`
      };
    }

    return {
      isValid: true,
      confidence: 0.6,
      reason: 'Validação básica aplicada devido a erro na IA'
    };
  }
}; 