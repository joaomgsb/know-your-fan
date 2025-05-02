import axios from 'axios';

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
  details?: Record<string, unknown>;
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

      const formdata = new FormData();
      formdata.append('base64', documentBase64);

      const reqOptions = {
        url: "http://localhost:5002/verify-document",
        method: "POST",
        data: formdata,
      }

      const response = await axios.request(reqOptions);

      return {
        isValid: response.data.isCPFValid,
        confidence: response.data.confidence
      }

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
   * Analisa um perfil de mídia social
   * @param platform Plataforma da rede social
   * @param profileUrl URL do perfil
   */
  public async analyzeSocialProfile(platform: string, profileUrl: string): Promise<SocialProfileAnalysisResult> {
    try {
      // Extrair username do URL
      let username = '';
      
      if (platform === 'twitter') {
        // Extrair username do URL do Twitter
        const twitterMatch = profileUrl.match(/twitter\.com\/([^/?]+)/);
        if (twitterMatch && twitterMatch[1]) {
          username = twitterMatch[1];
        } else {
          // Se não conseguir extrair do URL, usar o próprio profileUrl como username
          username = profileUrl;
        }
        
        return this.analyzeTwitterProfile(username);
      } else {
        throw new Error(`Plataforma não suportada: ${platform}`);
      }
    } catch (error) {
      console.error(`Erro ao analisar perfil de ${platform}:`, error);
      throw new Error(`Falha na análise do perfil de ${platform}`);
    }
  }

  /**
   * Analisa um perfil do Twitter usando a API oficial
   * @param username Nome de usuário no Twitter
   * @private
   */
  private async analyzeTwitterProfile(username: string): Promise<SocialProfileAnalysisResult> {
    try {
      // Obter dados básicos do perfil
      const userData = await this.getTwitterUserData(username);
      
      if (!userData) {
        throw new Error('Perfil não encontrado no Twitter');
      }
      
      // Obter tweets recentes para análise
      const tweets = await this.getUserTweets(userData.id, 100);
      
      // Calcular média de engajamento dos tweets
      let totalLikes = 0;
      let totalRetweets = 0;
      let totalReplies = 0;
      
      tweets.forEach(tweet => {
        totalLikes += tweet.public_metrics?.like_count || 0;
        totalRetweets += tweet.public_metrics?.retweet_count || 0;
        totalReplies += tweet.public_metrics?.reply_count || 0;
      });
      
      const tweetsCount = tweets.length || 1; // Evitar divisão por zero
      const likesAverage = Math.floor(totalLikes / tweetsCount);
      const retweetsAverage = Math.floor(totalRetweets / tweetsCount);
      const repliesAverage = Math.floor(totalReplies / tweetsCount);
      
      // Calcular postagens por mês
      const postsPerMonth = tweets.length > 0 ? Math.floor(tweets.length / 1) : 0; // Simplificado, assumindo 1 mês
      
      // Verificar relevância para eSports e FURIA
      // Detecção simplificada - em um caso real, seria usado processamento de linguagem natural
      const esportsKeywords = ['esports', 'esport', 'game', 'gaming', 'cs2', 'csgo', 'counter-strike', 'lol', 'league of legends', 'valorant'];
      const furiaKeywords = ['furia', 'kscerato', 'arT', 'yuurih', 'VINI', 'drop', 'chelo'];
      
      // Analisar a bio e os tweets para encontrar palavras-chave
      let esportsScore = 0;
      let furiaScore = 0;
      
      // Verificar bio
      const bioText = userData.description?.toLowerCase() || '';
      esportsKeywords.forEach(keyword => {
        if (bioText.includes(keyword.toLowerCase())) esportsScore += 2;
      });
      
      furiaKeywords.forEach(keyword => {
        if (bioText.includes(keyword.toLowerCase())) furiaScore += 3;
      });
      
      // Verificar tweets
      tweets.forEach(tweet => {
        const tweetText = tweet.text.toLowerCase();
        
        esportsKeywords.forEach(keyword => {
          if (tweetText.includes(keyword.toLowerCase())) esportsScore += 1;
        });
        
        furiaKeywords.forEach(keyword => {
          if (tweetText.includes(keyword.toLowerCase())) furiaScore += 1.5;
        });
      });
      
      // Normalizar pontuações (0-100)
      const maxEsportsScore = 2 * esportsKeywords.length + tweets.length * esportsKeywords.length;
      const maxFuriaScore = 3 * furiaKeywords.length + tweets.length * furiaKeywords.length * 1.5;
      
      const normalizedEsportsScore = Math.min(100, Math.floor((esportsScore / maxEsportsScore) * 100) || 0);
      const normalizedFuriaScore = Math.min(100, Math.floor((furiaScore / maxFuriaScore) * 100) || 0);
      
      // Calcular relevance geral
      const followerWeight = Math.min(1, (userData.public_metrics?.followers_count || 0) / 10000) * 0.3;
      const engagementWeight = Math.min(1, (likesAverage + retweetsAverage) / 200) * 0.3;
      const contentWeight = (normalizedEsportsScore / 100) * 0.2 + (normalizedFuriaScore / 100) * 0.2;
      
      const relevanceScore = Math.floor((followerWeight + engagementWeight + contentWeight) * 10);
      
      // Construir resultado da análise
      const analysisResults: SocialProfileAnalysisResult = {
        riskLevel: relevanceScore < 50 ? 'low' : relevanceScore < 80 ? 'medium' : 'high',
        flags: [
          'eSports',
          'FURIA',
          'Gaming'
        ],
        details: {
          relevanceScore,
          postsPerMonth,
          likesAverage,
          commentsAverage: repliesAverage,
          followersCount: userData.public_metrics?.followers_count || 0
        }
      };
      
      // Adicionar avisos com base na análise
      if (tweets.length < 5) {
        analysisResults.flags.push('Baixa atividade recente no Twitter');
      }
      
      if ((userData.public_metrics?.followers_count || 0) < 50) {
        analysisResults.flags.push('Baixo número de seguidores');
      }
      
      const accountAge = new Date().getTime() - new Date(userData.created_at).getTime();
      const accountAgeInDays = accountAge / (1000 * 60 * 60 * 24);
      
      if (accountAgeInDays < 30) {
        analysisResults.flags.push('Conta criada recentemente');
      }
      
      return analysisResults;
      
    } catch (error) {
      console.error('Erro ao analisar perfil do Twitter:', error);
      throw new Error('Falha na análise do perfil do Twitter');
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