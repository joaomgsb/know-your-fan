import React, { useState } from 'react';
import { Plus, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { validateProfileRelevance } from '../services/profileValidator';

interface GamingProfile {
  platform: string;
  username: string;
  profileUrl: string;
}

interface Props {
  profiles: GamingProfile[];
  isEditing: boolean;
  onUpdate: (profiles: GamingProfile[]) => void;
  userInterests: string[];
}

const PLATFORMS = [
  { 
    id: 'faceit', 
    name: 'FACEIT',
    logo: '/images/logos/faceit.png'
  },
  { 
    id: 'gc', 
    name: 'GamersClub',
    logo: '/images/logos/gc.png'
  },
  { 
    id: 'steam', 
    name: 'Steam',
    logo: '/images/logos/steam.png'
  },
  { 
    id: 'riot', 
    name: 'Riot Games',
    logo: '/images/logos/riot.svg'
  }
];

const GamingProfiles: React.FC<Props> = ({ profiles, isEditing, onUpdate, userInterests }) => {
  const [newProfile, setNewProfile] = useState<GamingProfile>({
    platform: '',
    username: '',
    profileUrl: ''
  });
  const [isValidating, setIsValidating] = useState(false);

  const handleAddProfile = async () => {
    if (!newProfile.platform || !newProfile.username || !newProfile.profileUrl) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsValidating(true);
    try {
      // Validar relevância do perfil
      const validation = await validateProfileRelevance({
        ...newProfile,
        userInterests
      });

      if (!validation.isValid) {
        toast.error(validation.reason || 'Perfil não é relevante para seus interesses');
        return;
      }

      const updatedProfiles = [...profiles, newProfile];
      onUpdate(updatedProfiles);
      setNewProfile({ platform: '', username: '', profileUrl: '' });
      toast.success('Perfil adicionado com sucesso!');
    } catch (error) {
      toast.error('Erro ao validar perfil');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveProfile = (index: number) => {
    const updatedProfiles = profiles.filter((_, i) => i !== index);
    onUpdate(updatedProfiles);
    toast.success('Perfil removido com sucesso!');
  };

  const getPlatformLogo = (platformName: string) => {
    const platform = PLATFORMS.find(p => p.name === platformName);
    return platform?.logo;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Perfis de Games</h3>
      
      {/* Lista de perfis existentes */}
      <div className="space-y-2">
        {profiles.map((profile, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <img 
                src={getPlatformLogo(profile.platform)} 
                alt={profile.platform}
                className="h-6 w-6 object-contain"
              />
              <span className="text-gray-600">{profile.username}</span>
            </div>
            <div className="flex items-center space-x-2">
              <a
                href={profile.profileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-5 w-5" />
              </a>
              {isEditing && (
                <button
                  onClick={() => handleRemoveProfile(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Formulário para adicionar novo perfil */}
      {isEditing && (
        <div className="p-4 border border-gray-200 rounded-lg space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <select
              value={newProfile.platform}
              onChange={(e) => setNewProfile({ ...newProfile, platform: e.target.value })}
              className="input"
              disabled={isValidating}
            >
              <option value="">Selecione a plataforma</option>
              {PLATFORMS.map(platform => (
                <option key={platform.id} value={platform.name}>
                  {platform.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Nome de usuário"
              value={newProfile.username}
              onChange={(e) => setNewProfile({ ...newProfile, username: e.target.value })}
              className="input"
              disabled={isValidating}
            />
            <input
              type="url"
              placeholder="URL do perfil"
              value={newProfile.profileUrl}
              onChange={(e) => setNewProfile({ ...newProfile, profileUrl: e.target.value })}
              className="input"
              disabled={isValidating}
            />
          </div>
          <button
            onClick={handleAddProfile}
            className="btn btn-primary flex items-center"
            disabled={isValidating}
          >
            {isValidating ? (
              <>
                <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Validando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Perfil
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default GamingProfiles; 