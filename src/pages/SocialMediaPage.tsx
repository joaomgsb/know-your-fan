import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Twitter, Instagram, Twitch, Youtube, Check, Link as LinkIcon, X, Brain, BarChart } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { toast } from 'react-hot-toast';
import { openai } from '../services/openaiService';

interface SocialProfileAnalysis {
  relevanceScore: number;
  eSportsEngagement: number;
  furiaEngagement: number;
  keywords: string[];
  followedTeams: string[];
  recommendedContent: string[];
}

type SocialPlatform = 'Twitter' | 'Instagram' | 'Twitch';

interface ManualSocialData {
  followedTeams: string;
  recentInteractions: string;
  favoriteGames: string;
}

interface OpenAIResponse {
  riskLevel: 'low' | 'medium' | 'high';
  flags: string[];
  followedTeams: string[];
  recommendations: string[];
  relevanceScore: number;
  esportsScore: number;
  furiaScore: number;
  keywords: string[];
}

const SocialMediaPage: React.FC = () => {
  const { user, linkSocialProfile, removeSocialProfile } = useUser();
  const navigate = useNavigate();

  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('Twitter');
  const [username, setUsername] = useState('');
  const [socialUrl, setSocialUrl] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [manualData, setManualData] = useState<ManualSocialData>({
    followedTeams: '',
    recentInteractions: '',
    favoriteGames: ''
  });

  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  const handlePlatformChange = (platform: SocialPlatform) => {
    setSelectedPlatform(platform);
    // Pre-fill URL based on platform
    switch (platform) {
      case 'Twitter':
        setSocialUrl('https://twitter.com/');
        break;
      case 'Instagram':
        setSocialUrl('https://instagram.com/');
        break;
      case 'Twitch':
        setSocialUrl('https://twitch.tv/');
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !socialUrl) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    if (!manualData.followedTeams || !manualData.recentInteractions || !manualData.favoriteGames) {
      toast.error('Por favor, preencha as informações adicionais');
      return;
    }
    
    setIsLinking(true);
    try {
      await linkSocialProfile(selectedPlatform, username, socialUrl);
      toast.success(`Perfil do ${selectedPlatform} vinculado com sucesso!`);
      setUsername('');
      setManualData({
        followedTeams: '',
        recentInteractions: '',
        favoriteGames: ''
      });
    } catch (err) {
      console.error('Erro ao vincular perfil:', err);
      toast.error('Erro ao vincular perfil social');
    } finally {
      setIsLinking(false);
    }
  };

  const toggleAnalysisDetails = (index: string) => {
    setShowAnalysis(showAnalysis === index ? null : index);
  };

  const handleAnalyzeProfile = async (index: string) => {
    setIsAnalyzing(index);
    try {
      const profiles = user.socialProfiles || [];
      const profile = profiles[parseInt(index)];
      
      if (!profile) {
        throw new Error('Perfil não encontrado');
      }

      // Preparar o prompt para a OpenAI
      const prompt = `
Analise este perfil de rede social e retorne um JSON com informações sobre engajamento em e-sports:

Plataforma: ${profile.platform}
Username: ${profile.username}
URL: ${profile.url}

Retorne APENAS um objeto JSON com este formato exato:
{
  "riskLevel": "low",
  "flags": ["cs2", "valorant", "furia"],
  "followedTeams": ["FURIA", "MIBR"],
  "recommendations": ["Assista as partidas da FURIA"],
  "relevanceScore": 80,
  "esportsScore": 70,
  "furiaScore": 60,
  "keywords": ["cs2", "valorant"]
}`.trim();

      // Chamar a OpenAI
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "Você é um analisador de perfis. Responda APENAS com o JSON solicitado, sem texto adicional."
          },
          { role: "user", content: prompt }
        ],
        model: "gpt-4o-mini"
      });

      const responseText = completion.choices?.[0]?.message?.content;
      console.log('Resposta bruta da OpenAI:', responseText); // Debug

      if (!responseText) {
        throw new Error('Resposta vazia da IA');
      }

      // Tentar extrair apenas o JSON da resposta
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Nenhum JSON encontrado na resposta');
      }

      // Processar a resposta
      let response: OpenAIResponse;
      try {
        response = JSON.parse(jsonMatch[0]);
        
        // Validar campos obrigatórios
        if (!response.riskLevel || !Array.isArray(response.flags) || !Array.isArray(response.followedTeams)) {
          throw new Error('Resposta JSON inválida: campos obrigatórios ausentes');
        }

      } catch (parseError) {
        console.error('Erro ao fazer parse do JSON:', parseError);
        console.log('Texto que causou erro:', jsonMatch[0]);
        
        // Usar um fallback em caso de erro
        response = {
          riskLevel: 'medium',
          flags: ['esports'],
          followedTeams: ['FURIA'],
          recommendations: ['Confira as últimas partidas'],
          relevanceScore: 50,
          esportsScore: 50,
          furiaScore: 50,
          keywords: ['esports']
        };
      }

      // Atualizar o perfil com o resultado
      const updatedProfiles = [...profiles];
      updatedProfiles[parseInt(index)] = {
        ...profile,
        analysisResult: {
          riskLevel: response.riskLevel,
          flags: response.flags,
          details: {
            followedTeams: response.followedTeams,
            recommendations: response.recommendations || [],
            relevanceScore: response.relevanceScore || 50,
            esportsScore: response.esportsScore || 50,
            furiaScore: response.furiaScore || 50,
            keywords: response.keywords || []
          }
        }
      };

      // Atualizar o usuário
      if (user) {
        user.socialProfiles = updatedProfiles;
      }

      // Mostrar a análise
      setShowAnalysis(index);
      toast.success('Perfil analisado com sucesso!');
    } catch (err) {
      console.error('Erro ao analisar perfil:', err);
      toast.error('Erro ao analisar perfil. Verifique o console para mais detalhes.');
    } finally {
      setIsAnalyzing(null);
    }
  };

  const renderAnalysisDetails = (analysis: SocialProfileAnalysis) => {
    return (
      <div className="mt-4 bg-gray-50 p-4 rounded-md">
        <h4 className="text-sm font-medium mb-3">Análise de Engajamento</h4>
        
        <div className="space-y-4">
          {/* Scores */}
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Relevância Geral</span>
                <span className="font-medium">{analysis.relevanceScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-black h-2 rounded-full" 
                  style={{ width: `${analysis.relevanceScore}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Engajamento eSports</span>
                <span className="font-medium">{analysis.eSportsEngagement}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${analysis.eSportsEngagement}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Engajamento FURIA</span>
                <span className="font-medium">{analysis.furiaEngagement}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${analysis.furiaEngagement}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Keywords and Teams */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-xs text-gray-700 mb-2">Keywords Identificadas</h5>
              <div className="flex flex-wrap gap-1">
                {analysis.keywords.map((keyword: string, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-gray-200 rounded-full text-xs">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-xs text-gray-700 mb-2">Times Seguidos</h5>
              <div className="flex flex-wrap gap-1">
                {analysis.followedTeams.map((team: string, idx: number) => (
                  <span 
                    key={idx} 
                    className={`px-2 py-1 rounded-full text-xs ${
                      team === 'FURIA' ? 'bg-black text-white' : 'bg-gray-200'
                    }`}
                  >
                    {team}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Recommended Content */}
          <div>
            <h5 className="font-medium text-xs text-gray-700 mb-2">Conteúdo Recomendado</h5>
            <ul className="text-sm space-y-1">
              {analysis.recommendedContent.map((content: string, idx: number) => (
                <li key={idx} className="text-xs text-gray-600">• {content}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Twitter':
        return <Twitter className="h-5 w-5" />;
      case 'Instagram':
        return <Instagram className="h-5 w-5" />;
      case 'Twitch':
        return <Twitch className="h-5 w-5" />;
      case 'Youtube':
        return <Youtube className="h-5 w-5" />;
      default:
        return <LinkIcon className="h-5 w-5" />;
    }
  };

  // Check if a platform is already linked
  const isLinked = (platform: string) => {
    return user.socialProfiles?.some(p => p.platform === platform);
  };

  const handleRemoveProfile = async (index: string) => {
    try {
      await removeSocialProfile(index);
    } catch (error) {
      console.error('Erro ao remover perfil:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Vincular Redes Sociais</h1>
          <p className="mb-6 text-gray-600">
            Conecte suas redes sociais e nos conte um pouco sobre suas atividades 
            para que possamos personalizar sua experiência.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Escolha a plataforma
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(['Twitter', 'Instagram', 'Twitch'] as SocialPlatform[]).map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    className={`flex items-center justify-center py-3 px-4 rounded-md border transition-all ${
                      selectedPlatform === platform
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-black'
                    }`}
                    onClick={() => handlePlatformChange(platform)}
                  >
                    {getPlatformIcon(platform)}
                    <span className="ml-2">{platform}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome de usuário
                </label>
                <input
                  id="username"
                  type="text"
                  className="input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={`Seu nome de usuário no ${selectedPlatform}`}
                />
              </div>
              
              <div>
                <label htmlFor="socialUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  URL do perfil
                </label>
                <input
                  id="socialUrl"
                  type="url"
                  className="input"
                  value={socialUrl}
                  onChange={(e) => setSocialUrl(e.target.value)}
                  placeholder={`https://${selectedPlatform.toLowerCase()}.com/...`}
                />
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900">Informações Adicionais</h3>
              
              <div>
                <label htmlFor="followedTeams" className="block text-sm font-medium text-gray-700 mb-1">
                  Times de e-sports que você segue
                </label>
                <input
                  id="followedTeams"
                  type="text"
                  className="input"
                  value={manualData.followedTeams}
                  onChange={(e) => setManualData(prev => ({ ...prev, followedTeams: e.target.value }))}
                  placeholder="Ex: FURIA, MIBR, Liquid (separados por vírgula)"
                />
              </div>

              <div>
                <label htmlFor="recentInteractions" className="block text-sm font-medium text-gray-700 mb-1">
                  Descreva suas interações recentes com e-sports
                </label>
                <textarea
                  id="recentInteractions"
                  className="input min-h-[100px]"
                  value={manualData.recentInteractions}
                  onChange={(e) => setManualData(prev => ({ ...prev, recentInteractions: e.target.value }))}
                  placeholder="Ex: Assisti ao último campeonato da FURIA, comentei nas postagens do time, participei de eventos..."
                />
              </div>

              <div>
                <label htmlFor="favoriteGames" className="block text-sm font-medium text-gray-700 mb-1">
                  Seus jogos favoritos
                </label>
                <input
                  id="favoriteGames"
                  type="text"
                  className="input"
                  value={manualData.favoriteGames}
                  onChange={(e) => setManualData(prev => ({ ...prev, favoriteGames: e.target.value }))}
                  placeholder="Ex: CS2, Valorant, League of Legends"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLinking || isLinked(selectedPlatform)}
              className="btn btn-primary py-2 px-4 flex items-center"
            >
              {isLinking ? (
                <>
                  <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Vinculando...
                </>
              ) : isLinked(selectedPlatform) ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Já vinculado
                </>
              ) : (
                <>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Vincular {selectedPlatform}
                </>
              )}
            </button>
          </form>
        </div>
        
        {/* Redes sociais vinculadas */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Redes Sociais Vinculadas</h2>
          
          {(!user.socialProfiles || user.socialProfiles.length === 0) && (
            <p className="text-gray-500 italic">Nenhuma rede social vinculada ainda.</p>
          )}
          
          {user.socialProfiles && user.socialProfiles.length > 0 && (
            <div className="space-y-4">
              {user.socialProfiles.map((profile, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getPlatformIcon(profile.platform)}
                      <div className="ml-4">
                        <p className="font-medium">{profile.platform}</p>
                        <p className="text-sm text-gray-500">@{profile.username}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {profile.analysisResult ? (
                        <button
                          className="btn btn-secondary py-1 px-3 text-sm inline-flex items-center"
                          onClick={() => toggleAnalysisDetails(index.toString())}
                        >
                          <BarChart className="h-4 w-4 mr-1" />
                          {showAnalysis === index.toString() ? 'Ocultar análise' : 'Ver análise'}
                        </button>
                      ) : (
                        <button
                          className="btn btn-secondary py-1 px-3 text-sm inline-flex items-center"
                          onClick={() => handleAnalyzeProfile(index.toString())}
                          disabled={isAnalyzing === index.toString()}
                        >
                          {isAnalyzing === index.toString() ? (
                            <>
                              <span className="inline-block h-3 w-3 border-2 border-black border-t-transparent rounded-full animate-spin mr-1"></span>
                              Analisando...
                            </>
                          ) : (
                            <>
                              <Brain className="h-4 w-4 mr-1" />
                              Analisar com IA
                            </>
                          )}
                        </button>
                      )}
                      
                      <a 
                        href={profile.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn btn-outline py-1 px-3 text-sm"
                      >
                        Visitar
                      </a>
                      <button 
                        className="btn py-1 px-2 border border-gray-300 hover:bg-gray-100"
                        title="Remover"
                        onClick={() => handleRemoveProfile(index.toString())}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Mostrar detalhes da análise se disponível e selecionado */}
                  {profile.analysisResult && showAnalysis === index.toString() && (
                    renderAnalysisDetails({
                      relevanceScore: profile.analysisResult.riskLevel === 'low' ? 90 : profile.analysisResult.riskLevel === 'medium' ? 60 : 30,
                      eSportsEngagement: profile.analysisResult.flags.includes('esports') ? 80 : 40,
                      furiaEngagement: profile.analysisResult.flags.includes('furia') ? 90 : 30,
                      keywords: profile.analysisResult.flags,
                      followedTeams: profile.analysisResult.details?.followedTeams as string[] || [],
                      recommendedContent: profile.analysisResult.details?.recommendations as string[] || []
                    })
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-8 bg-gray-50 p-4 rounded-md">
            <div className="flex items-start">
              <Brain className="h-5 w-5 text-gray-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Análise de perfil com IA</h3>
                <p className="text-sm text-gray-600">
                  Nossa tecnologia de IA analisa seus perfis nas redes sociais para entender seu nível de 
                  engajamento com e-sports e com a FURIA. Essas informações nos ajudam a personalizar 
                  recomendações de conteúdo e ofertas exclusivas baseadas nos seus interesses reais.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialMediaPage;