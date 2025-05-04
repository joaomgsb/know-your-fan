import axios from 'axios';
import { openai } from './openaiService';

export interface DocumentAnalysisResult {
  isValid: boolean;
  confidence: number;
  details?: Record<string, string | null>;
}

export interface SocialProfileAnalysisResult {
  riskLevel: 'low' | 'medium' | 'high';
  flags: string[];
  details: {
    followedTeams?: string[];
    recommendations?: string[];
    relevanceScore?: number;
    esportsScore?: number;
    furiaScore?: number;
    keywords?: string[];
    confidence?: number;
    verificationId?: string;
    [key: string]: any;
  };
}

export interface DocumentVerificationResult {
  riskLevel: 'low' | 'medium' | 'high';
  flags: string[];
  details: {
    confidence: number;
    verificationId: string;
    [key: string]: any;
  };
}

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
        confidence: response.data.confidence,
        details: response.data
      }

    } catch (error) {
      console.error('Erro ao verificar documento:', error);
      throw new Error('Falha na verificação do documento');
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