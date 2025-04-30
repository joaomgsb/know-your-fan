import axios from 'axios';
import { jwtFromRSA } from './jwt-helper';

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

// Credenciais da conta de serviço Google Cloud
const GOOGLE_CREDENTIALS = {
  type: "service_account",
  project_id: "furia-know-your-fan",
  private_key_id: "91d77842321e93d81bd59edb27befe62cff9dcf8",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCsXXjC1XjXdWy7\n7UAT1qV+2V3DjaYudLGLkKQDaDpXVj5OCagx3h71wdsvfAvNpKEmtnIdbYt6rTYI\nrb9PZ3MlK+hHbFHWNxRVsUxQxl1S4PxsmX85D1DJa2gmb152AhY2xmSF52nLcCaR\ntE5p0F3Y0IMkGCVvCYo+CJwPItaMBfLiCISL3T6HkVmHRbD+cLvKDRAxuLzEsUaT\neYwrDJR3PEGp2WHjPYp9JWrQN3QGO50QYH91tZ9a8mP95F2JlvDJ2rA4+aGTTJGn\nj8XdwUwPmMYTlCiDjDY5XF9zJPPXf2AbA2MucMyp9HKbhiTdPfDWpN2ZrD7RuErh\nTKVQtUYzAgMBAAECggEABsXD6TixfRNs6NzqsFxGQUQ+PJwIHKs1AqaJI8iCLDCh\nWv5XCGEF3yHdVdIQXVUazp6i/SDKwr3L38Qj4K3ciE2x7P6VtPYJ1/it5TTu2oV3\nMJW2P0dVQ1yGJ4QHiJgKcikpJFn8dUR8tXzw+l2NfKWF4mThH15tsfwFmn7uWLjm\nZZaA42rWa+s/cGi5x/KTHtdJm9mFYIj555ACVELk+D2vK5tuGAJ1xFBo0g8kI4q4\nW+zIZYBFFgBkTleJKFJZ+yNnTqjmF1TzPUMEkD3jBKTJA6K5agA4xb+iGsLazUxK\nSFNVBwVvCVrcSQO1IpVTbOUTiI6FZlFN0h5fxcemhQKBgQDXMsI9JE0n48XPZeTz\nbDZ+Sv6SBkQzEk2emyYf5fE/YUPPKszMIi1UlL+IHV9bt43t+QSy+zJc6wOLmZH+\noXgGvA4YjOqm7SiIDkVnQiQ9gNPkx1Q3Kh097BhYLAkWTELkL3g7iqhL/TnodFIc\nNXZa6TFsKf+tR4pZEISUkU9wnQKBgQDM9fFZYvQUWx70WwQP7knOW4wbWIpGrMve\nK9SFtA8W3d4UWNlzYyRx4aSmXld5SZCu9HG+ESaMtl5YpVMh6gVZD/M7l69zpjIo\nRcUysV8JPO+E1lUi2Z0QPc5vHdV0o9nKS+NvX/P0bSu7VNpDl2EgLjOj0vcdQ9Ui\nN7Y+cQ9ELwKBgQC8rqlshXbx3S80cVtXDYLl7VWsJz6W32vQQlcE7aQ9oW6mt7tK\nTIBhMaYJLTBbH7gZyotJ8J2Z8Z3jMIxVhpqVA0yBfKTQWucCYyKmltfZcqU/f3Dq\n/t7v9ZwnQnLsqnAQrxBOAu8FGqZ0xrpOMEjXjkFKCwXjiFVkY5jUvKZOgQKBgDhb\nwLcDQPVsW2sIlGS7Tv0NF1PZFH+ht4TzYlHoQ0Bw5HPEOUb3A5yBrqPjHkqADgzg\nvx08/KeSLsOCFJaJhC9nF13mVDydxWXiKBEpvZpUC7t337S5VnULf9ycQxaM4GZv\nCNxJGSjdj8UQYdYRqXEA5PzPfKiA1Jh3GEBKq0fRAoGALKYQllvUWQSy8K+XC9li\n5ezLX/aMJBJKSzZp3uoGXOPQwbWzM8x0u1I6FjE3Mx7M8imKrxdTqf48aE7eFuES\n24AK7jcGK+BcF2y1+98PKx1WCQQcNpNdw8yTsARDBCVgC4x9JH73nQx8Tdn25mJH\nSDcvsgO3LUJiHhzXZjexs+4=\n-----END PRIVATE KEY-----\n",
  client_email: "furia-knowyourfan@furia-know-your-fan.iam.gserviceaccount.com",
  client_id: "114097854240458806760",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/furia-knowyourfan%40furia-know-your-fan.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

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
  private VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';
  private TWITTER_API_URL = 'https://api.twitter.com/2';

  /**
   * Obtém um token de autenticação para o Google Cloud
   */
  private async getGoogleAuthToken(): Promise<string> {
    try {
      // Criar payload para o token JWT
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        iss: GOOGLE_CREDENTIALS.client_email,
        sub: GOOGLE_CREDENTIALS.client_email,
        aud: 'https://oauth2.googleapis.com/token',
        iat: now,
        exp: now + 3600, // Válido por 1 hora
        scope: 'https://www.googleapis.com/auth/cloud-platform'
      };
      
      // Gerar JWT usando a chave privada
      const jwt = jwtFromRSA(payload, GOOGLE_CREDENTIALS.private_key);
      
      // Trocar JWT por token de acesso
      const tokenResponse = await axios.post(
        'https://oauth2.googleapis.com/token',
        {
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: jwt
        }
      );
      
      return tokenResponse.data.access_token;
    } catch (error) {
      console.error('Erro ao obter token de autenticação:', error);
      throw new Error('Falha na autenticação com o Google Cloud');
    }
  }

  /**
   * Verifica um documento usando a API do Google Cloud Vision
   * @param documentBase64 Documento em formato base64
   * @param documentType Tipo de documento (CPF, RG, etc)
   */
  public async verifyDocument(documentBase64: string, documentType: string): Promise<DocumentAnalysisResult> {
    try {
      // Obtém token de autenticação
      const token = await this.getGoogleAuthToken();
      
      // Preparar solicitação para a API Vision
      const requestData = {
        requests: [
          {
            image: {
              content: documentBase64.replace(/^data:image\/\w+;base64,/, '')
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 50
              },
              {
                type: 'DOCUMENT_TEXT_DETECTION',
                maxResults: 50
              }
            ]
          }
        ]
      };
      
      // Fazer solicitação para API Vision
      const response = await axios.post(
        this.VISION_API_URL,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Extrair texto do documento
      const annotations = response.data.responses[0];
      const extractedText = annotations.fullTextAnnotation?.text || '';
      
      // Analisar o documento com base no texto extraído
      return this.analyzeDocumentText(extractedText, documentType);
      
    } catch (error) {
      console.error('Erro ao verificar documento:', error);
      throw new Error('Falha na verificação do documento');
    }
  }
  
  /**
   * Analisa o texto extraído do documento para validação
   * @private
   */
  private analyzeDocumentText(text: string, documentType: string): DocumentAnalysisResult {
    // Este é um método que simula a análise do documento
    // Em um ambiente de produção, você enviaria o texto para um serviço backend
    
    // Verificar se o texto contém padrões esperados para o tipo de documento
    const results: DocumentAnalysisResult = {
      isValid: false,
      confidence: 0,
      details: {}
    };
    
    // Executar verificações específicas por tipo de documento
    if (documentType === 'CPF') {
      // Expressão regular para encontrar CPF no formato XXX.XXX.XXX-XX
      const cpfRegex = /\d{3}\.\d{3}\.\d{3}-\d{2}/g;
      const cpfMatches = text.match(cpfRegex);
      
      if (cpfMatches && cpfMatches.length > 0) {
        results.isValid = true;
        results.confidence = 0.85;
        results.details = { documentNumber: cpfMatches[0] };
      } else {
        results.details = { warning: 'Número de CPF não encontrado no documento' };
      }
    } else if (documentType === 'RG') {
      // Expressão regular para encontrar RG no formato XX.XXX.XXX-X
      const rgRegex = /\d{2}\.\d{3}\.\d{3}-[0-9A-Z]/g;
      const rgMatches = text.match(rgRegex);
      
      // Verificar data de emissão (formato DD/MM/AAAA)
      const dateRegex = /\d{2}\/\d{2}\/\d{4}/g;
      const dateMatches = text.match(dateRegex);
      
      if (rgMatches && rgMatches.length > 0) {
        results.isValid = true;
        results.confidence = 0.8;
        results.details = {
          documentNumber: rgMatches[0],
          issueDate: dateMatches ? dateMatches[0] : null
        };
      } else {
        results.details = { warning: 'Número de RG não encontrado no documento' };
      }
    }
    
    // Verificar qualidade do documento
    if (text.length < 50) {
      results.confidence = Math.max(0.3, results.confidence - 0.5);
      results.details = { warning: 'Texto extraído muito curto, documento pode estar ilegível' };
    }
    
    // Verificar se há indícios de adulteração
    if (text.includes('cópia') || text.includes('copia')) {
      results.confidence = Math.max(0.2, results.confidence - 0.4);
      results.details = { warning: 'Documento parece ser uma cópia' };
    }
    
    return results;
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