import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Twitter, Instagram, Twitch, Youtube, Check, Link as LinkIcon, X, Brain, BarChart } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { toast } from 'react-hot-toast';
import { SocialMediaAnalysisResult } from '../services/aiService';

type SocialPlatform = 'Twitter' | 'Instagram' | 'Twitch' | 'Youtube' | 'TikTok';

const SocialMediaPage: React.FC = () => {
  const { user, linkSocialProfile, analyzeSocialProfile } = useUser();
  const navigate = useNavigate();

  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>('Twitter');
  const [username, setUsername] = useState('');
  const [socialUrl, setSocialUrl] = useState('');
  const [isLinking, setIsLinking] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState<string | null>(null);

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
      case 'Youtube':
        setSocialUrl('https://youtube.com/c/');
        break;
      case 'TikTok':
        setSocialUrl('https://tiktok.com/@');
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !socialUrl) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }
    
    setIsLinking(true);
    try {
      await linkSocialProfile(selectedPlatform, username, socialUrl);
      toast.success(`Perfil do ${selectedPlatform} vinculado com sucesso!`);
      setUsername('');
    } catch {
      toast.error('Erro ao vincular perfil social');
    } finally {
      setIsLinking(false);
    }
  };

  const handleAnalyzeProfile = async (profileId: string) => {
    setIsAnalyzing(profileId);
    try {
      await analyzeSocialProfile(profileId);
      toast.success('Perfil analisado com sucesso!');
    } catch {
      toast.error('Erro ao analisar perfil. Tente novamente.');
    } finally {
      setIsAnalyzing(null);
    }
  };

  const toggleAnalysisDetails = (profileId: string) => {
    if (showAnalysis === profileId) {
      setShowAnalysis(null);
    } else {
      setShowAnalysis(profileId);
    }
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

  // Render analysis result details
  const renderAnalysisDetails = (analysis: SocialMediaAnalysisResult) => {
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
                {analysis.keywords.map((keyword, idx) => (
                  <span key={idx} className="px-2 py-1 bg-gray-200 rounded-full text-xs">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-xs text-gray-700 mb-2">Times Seguidos</h5>
              <div className="flex flex-wrap gap-1">
                {analysis.followedTeams.map((team, idx) => (
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
              {analysis.recommendedContent.map((content, idx) => (
                <li key={idx} className="text-xs text-gray-600">• {content}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Vincular Redes Sociais</h1>
          <p className="mb-6 text-gray-600">
            Conecte suas redes sociais para que possamos personalizar sua experiência 
            e analisar seu envolvimento com a FURIA e o mundo dos e-sports.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Escolha a plataforma
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {(['Twitter', 'Instagram', 'Twitch', 'Youtube', 'TikTok'] as SocialPlatform[]).map((platform) => (
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
                        onClick={() => {
                          // This functionality would be implemented in a real app
                          toast.error('Funcionalidade não implementada na demonstração');
                        }}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Mostrar detalhes da análise se disponível e selecionado */}
                  {profile.analysisResult && showAnalysis === index.toString() && (
                    renderAnalysisDetails(profile.analysisResult)
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