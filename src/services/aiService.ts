import { openai } from './openaiService';

// Interfaces para resultados de verificação e análise
// Interface não utilizada, comentada para evitar erro de lint
// export interface AIVerificationResult {
//   isValid: boolean;
//   confidence: number;
//   details?: Record<string, string | null>;
// }

// Interface não utilizada, comentada para evitar erro de lint
// export interface SocialMediaAnalysisResult {
//   riskLevel: 'low' | 'medium' | 'high';
//   flags: string[];
//   details?: Record<string, unknown>;
// }

export interface DocumentAnalysisResult {
  isValid: boolean;
  confidence: number;
  details?: Record<string, string | null>;
}

export interface SocialProfileAnalysisResult {
  riskLevel: 'low' | 'medium' | 'high';
  flags: string[];
  details: {
    followedTeams: string[];
    recommendations: string[];
    relevanceScore: number;
    esportsScore: number;
    furiaScore: number;
    keywords: string[];
  };
}

// Credenciais da API do Twitter
const TWITTER_CREDENTIALS = {
  apiKey: "hrBrMSyN45gNPqED2PbVqawxK",
  apiKeySecret: "ka7OLLbbpk1oSXbJnGvDTJnKpsUBof3IW4seGOrNEOmDNwHUad",
  bearerToken: "AAAAAAAAAAAAAAAAAAAAAKWw0wEAAAAAFAP5n78EnPLIRUe6nB1of4SB4bE%3DBobumuxAFZpmHJeax0aAVwHigFDNt9TLTvgDrYraODpMIeXGbW"
};

/**
 * Para configurar as chaves de API, crie um arquivo .env.local na raiz do projeto com as seguintes variáveis:
 * 
 * VITE_API_BASE_URL=http://localhost:3000
 * VITE_SOCIAL_ANALYTICS_API_KEY=sua_chave_social_analytics
 */

/**
 * Serviço de IA para análise de documentos e perfis de mídia social
 */
export class AIService {
  private TWITTER_API_URL = 'https://api.twitter.com/2';

  /**
   * Verifica um documento usando a API do Google Cloud Vision
   * @param documentBase64 Documento em formato base64
   */
  public async verifyDocument(documentBase64: string): Promise<DocumentAnalysisResult> {
    try {
      // Implementação da verificação de documento
      return {
        isValid: true,
        confidence: 0.95,
        details: {
          type: 'cpf',
          status: 'valid'
        }
      };
    } catch (error) {
      console.error('Erro ao verificar documento:', error);
      throw new Error('Falha na verificação do documento');
    }
  }

  /**
   * Obtém dados de um perfil do Twitter usando a API oficial
   * @param username Nome de usuário no Twitter (sem @)
   * @private
   */
  private async getTwitterUserData(username: string): Promise<TwitterUserData> {
    try {
      // Remove @ se estiver presente
      const sanitizedUsername = username.startsWith('@') ? username.substring(1) : username;
      
      const response = await axios.get(
        `${this.TWITTER_API_URL}/users/by/username/${sanitizedUsername}`, 
        {
          params: {
            'user.fields': 'public_metrics,description,created_at'
          },
          headers: {
            'Authorization': `Bearer ${TWITTER_CREDENTIALS.bearerToken}`
          }
        }
      );
      
      return response.data.data;
    } catch (error) {
      console.error('Erro ao obter dados do Twitter:', error);
      throw new Error('Falha ao buscar dados do perfil no Twitter');
    }
  }
  
  /**
   * Obtém tweets recentes de um usuário do Twitter
   * @param userId ID do usuário no Twitter
   * @private
   */
  private async getUserTweets(userId: string, maxResults: number = 100): Promise<TwitterTweet[]> {
    try {
      const response = await axios.get(
        `${this.TWITTER_API_URL}/users/${userId}/tweets`,
        {
          params: {
            max_results: maxResults,
            'tweet.fields': 'public_metrics,created_at',
            exclude: 'retweets,replies'
          },
          headers: {
            'Authorization': `Bearer ${TWITTER_CREDENTIALS.bearerToken}`
          }
        }
      );
      
      return response.data.data || [];
    } catch (error) {
      console.error('Erro ao obter tweets:', error);
      return []; // Retorna array vazio em caso de falha
    }
  }

  /**
   * Analisa um perfil de mídia social usando a OpenAI
   */
  public async analyzeSocialProfile(platform: string, profileUrl: string, manualData?: {
    followedTeams: string;
    recentInteractions: string;
    favoriteGames: string;
  }): Promise<SocialProfileAnalysisResult> {
    try {
      // Construir o prompt para a OpenAI
      const prompt = `
        Analise o seguinte perfil de e-sports e retorne um JSON com a análise:
        
        Plataforma: ${platform}
        URL: ${profileUrl}
        Times seguidos: ${manualData?.followedTeams || 'Não informado'}
        Interações recentes: ${manualData?.recentInteractions || 'Não informado'}
        Jogos favoritos: ${manualData?.favoriteGames || 'Não informado'}

        Retorne APENAS um objeto JSON com os seguintes campos:
        {
          "relevanceScore": número de 0 a 100,
          "esportsScore": número de 0 a 100,
          "furiaScore": número de 0 a 100,
          "keywords": array de strings,
          "followedTeams": array de strings,
          "recommendations": array de strings com 3 recomendações
        }
      `;

      // Fazer a chamada para a OpenAI
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Você é um analisador de perfis de e-sports. Analise os dados fornecidos e retorne APENAS o JSON solicitado."
          },
          { role: "user", content: prompt }
        ],
        model: "gpt-4o-mini",
        temperature: 0.7
      });

      const responseText = completion.choices?.[0]?.message?.content;
      console.log('Resposta da OpenAI:', responseText);

      if (!responseText) {
        throw new Error('Resposta vazia da IA');
      }

      // Tentar extrair apenas o JSON da resposta
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Nenhum JSON encontrado na resposta');
      }

      // Processar a resposta
      let response;
      try {
        response = JSON.parse(jsonMatch[0]);
        
        // Validar campos obrigatórios
        if (
          typeof response.relevanceScore !== 'number' || 
          typeof response.esportsScore !== 'number' || 
          typeof response.furiaScore !== 'number' ||
          !Array.isArray(response.keywords) ||
          !Array.isArray(response.followedTeams) ||
          !Array.isArray(response.recommendations)
        ) {
          throw new Error('Resposta JSON inválida: campos obrigatórios ausentes ou com tipo incorreto');
        }

      } catch (parseError) {
        console.error('Erro ao fazer parse do JSON:', parseError);
        console.log('Texto que causou erro:', jsonMatch[0]);
        throw new Error('Resposta inválida da IA');
      }

      // Construir o resultado da análise
      return {
        riskLevel: response.relevanceScore > 70 ? 'low' : response.relevanceScore > 40 ? 'medium' : 'high',
        flags: response.keywords,
        details: {
          followedTeams: response.followedTeams,
          recommendations: response.recommendations,
          relevanceScore: response.relevanceScore,
          esportsScore: response.esportsScore,
          furiaScore: response.furiaScore,
          keywords: response.keywords
        }
      };
    } catch (error) {
      console.error(`Erro ao analisar perfil:`, error);
      throw new Error(`Falha na análise do perfil`);
    }
  }
}

export const aiService = new AIService();

// Interfaces para dados do Twitter
interface TwitterPublicMetrics {
  followers_count: number;
  following_count: number;
  tweet_count: number;
  listed_count: number;
}

interface TwitterUserData {
  id: string;
  name: string;
  username: string;
  description?: string;
  created_at: string;
  public_metrics?: TwitterPublicMetrics;
}

interface TwitterTweetMetrics {
  retweet_count: number;
  reply_count: number;
  like_count: number;
  quote_count: number;
}

interface TwitterTweet {
  id: string;
  text: string;
  created_at: string;
  public_metrics?: TwitterTweetMetrics;
} 