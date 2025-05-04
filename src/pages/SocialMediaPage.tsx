import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Twitter, Instagram, Twitch, Youtube, Check, Link as LinkIcon, X, Brain, BarChart } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { toast } from 'react-hot-toast';

interface SocialProfileAnalysisResult {
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

type SocialPlatform = 'Twitter' | 'Instagram' | 'Twitch';

interface ManualSocialData {
  followedTeams: string;
  recentInteractions: string;
  favoriteGames: string;
}

const SocialMediaPage: React.FC = () => {
  const { user, linkSocialProfile, removeSocialProfile, analyzeSocialProfile } = useUser();
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
      await linkSocialProfile(selectedPlatform, username, socialUrl, manualData);
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
    if (isAnalyzing) return;
    setIsAnalyzing(index);

    try {
      // Analisar o perfil usando o contexto do usuário
      await analyzeSocialProfile(index);

      // Mostrar a análise
      setShowAnalysis(index);
      toast.success('Perfil analisado com sucesso!');
    } catch (err) {
      console.error('Erro ao analisar perfil:', err);
      toast.error(`Erro ao analisar perfil: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setIsAnalyzing(null);
    }
  };

  const renderAnalysisDetails = (analysis: SocialProfileAnalysisResult) => {
    return (
      <div className="mt-4 bg-gray-50 p-4 rounded-md">
        <h4 className="text-sm font-medium mb-3">Análise de Engajamento</h4>
        
        <div className="space-y-4">
          {/* Scores */}
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Relevância Geral</span>
                <span className="font-medium">{analysis.details.relevanceScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-black h-2 rounded-full" 
                  style={{ width: `${analysis.details.relevanceScore}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Engajamento eSports</span>
                <span className="font-medium">{analysis.details.esportsScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${analysis.details.esportsScore}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Engajamento FURIA</span>
                <span className="font-medium">{analysis.details.furiaScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${analysis.details.furiaScore}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Keywords and Teams */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-xs text-gray-700 mb-2">Keywords Identificadas</h5>
              <div className="flex flex-wrap gap-1">
                {analysis.details.keywords.map((keyword: string, idx: number) => (
                  <span key={idx} className="px-2 py-1 bg-gray-200 rounded-full text-xs">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-xs text-gray-700 mb-2">Times Seguidos</h5>
              <div className="flex flex-wrap gap-1">
                {analysis.details.followedTeams.map((team: string, idx: number) => (
                  <span 
                    key={idx} 
                    className={`px-2 py-1 rounded-full text-xs ${
                      team.toUpperCase().includes('FURIA') ? 'bg-black text-white' : 'bg-gray-200'
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
              {analysis.details.recommendations.map((content: string, idx: number) => (
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
                  {profile.analysisResult?.details && showAnalysis === index.toString() && (
                    renderAnalysisDetails(profile.analysisResult as SocialProfileAnalysisResult)
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