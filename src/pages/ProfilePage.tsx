import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit2, Save, User, MapPin, Phone, Mail, Hash, Calendar, X, Camera } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { toast } from 'react-hot-toast';

const INTEREST_OPTIONS = [
  'CS2', 'Valorant', 'League of Legends', 'Fortnite', 'Rainbow Six',
  'Notícias', 'Eventos', 'Merchandise', 'Campeonatos', 'Conteúdo exclusivo',
  'Meet & Greet', 'Promoções', 'Treinos', 'Bastidores', 'Lives'
];

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useUser();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    birthdate: user?.birthdate || '',
    cpf: user?.cpf || '',
    profilePicture: user?.profilePicture || '',
    address: {
      street: user?.address?.street || '',
      number: user?.address?.number || '',
      complement: user?.address?.complement || '',
      neighborhood: user?.address?.neighborhood || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || ''
    },
    interests: user?.interests || []
  });

  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData({
        ...profileData,
        [parent]: {
          ...profileData[parent as keyof typeof profileData] as Record<string, any>,
          [child]: value
        }
      });
    } else {
      setProfileData({
        ...profileData,
        [name]: value
      });
    }
  };

  const handleInterestToggle = (interest: string) => {
    const currentInterests = profileData.interests || [];
    const updatedInterests = currentInterests.includes(interest)
      ? currentInterests.filter(i => i !== interest)
      : [...currentInterests, interest];
    
    setProfileData({
      ...profileData,
      interests: updatedInterests
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUser(profileData);
      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Erro ao atualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      birthdate: user.birthdate,
      cpf: user.cpf,
      profilePicture: user.profilePicture || '',
      address: { ...user.address },
      interests: user.interests || []
    });
    setIsEditing(false);
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      // Converter imagem para base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // Atualizar o estado local e o perfil do usuário
        setProfileData(prev => ({ ...prev, profilePicture: base64String }));
        await updateUser({ ...profileData, profilePicture: base64String });
        
        toast.success('Foto de perfil atualizada com sucesso!');
        setIsUploadingPhoto(false);
      };
      
      reader.onerror = () => {
        toast.error('Erro ao processar a imagem');
        setIsUploadingPhoto(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      toast.error('Erro ao atualizar foto de perfil');
      setIsUploadingPhoto(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-black text-white p-6 relative">
            <div className="flex flex-col md:flex-row md:items-center">
              <div 
                className={`w-24 h-24 bg-gray-300 rounded-full flex items-center justify-center text-black mb-4 md:mb-0 md:mr-6 relative group ${isEditing ? 'cursor-pointer' : ''}`}
                onClick={isEditing ? handlePhotoClick : undefined}
              >
                {isUploadingPhoto ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <span className="inline-block h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  </div>
                ) : (
                  <>
                    {profileData.profilePicture ? (
                      <img 
                        src={profileData.profilePicture} 
                        alt={profileData.name} 
                        className="w-24 h-24 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12" />
                    )}
                    {isEditing && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={!isEditing}
              />
              <div>
                <h1 className="text-3xl font-bold mb-1">{user.name}</h1>
                <p className="text-gray-300 flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {user.address?.city}, {user.address?.state}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-black">
                    Fã Silver
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-white">
                    Membro desde {new Date(user.createdAt).getFullYear()}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Edit button */}
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute top-6 right-6 btn btn-secondary py-2 px-3 flex items-center"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Editar Perfil
              </button>
            ) : (
              <div className="absolute top-6 right-6 flex space-x-2">
                <button 
                  onClick={handleCancel}
                  className="btn bg-gray-700 text-white hover:bg-gray-600 py-2 px-3 flex items-center"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn btn-secondary py-2 px-3 flex items-center"
                >
                  {isSaving ? (
                    <>
                      <span className="inline-block h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></span>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
          
          {/* Profile Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div>
                <h2 className="text-xl font-bold mb-4">Informações Pessoais</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome completo
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        className="input"
                        value={profileData.name}
                        onChange={handleChange}
                      />
                    ) : (
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-gray-400 mr-2" />
                        <span>{user.name}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        className="input"
                        value={profileData.email}
                        onChange={handleChange}
                      />
                    ) : (
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 mr-2" />
                        <span>{user.email}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        className="input"
                        value={profileData.phone}
                        onChange={handleChange}
                      />
                    ) : (
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-400 mr-2" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CPF
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="cpf"
                        className="input"
                        value={profileData.cpf}
                        onChange={handleChange}
                      />
                    ) : (
                      <div className="flex items-center">
                        <Hash className="h-5 w-5 text-gray-400 mr-2" />
                        <span>{user.cpf}</span>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Nascimento
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        name="birthdate"
                        className="input"
                        value={profileData.birthdate}
                        onChange={handleChange}
                      />
                    ) : (
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                        <span>{formatDate(user.birthdate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Address Information */}
              <div>
                <h2 className="text-xl font-bold mb-4">Endereço</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rua
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="address.street"
                          className="input"
                          value={profileData.address.street}
                          onChange={handleChange}
                        />
                      ) : (
                        <p>{user.address?.street}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="address.number"
                          className="input"
                          value={profileData.address.number}
                          onChange={handleChange}
                        />
                      ) : (
                        <p>{user.address?.number}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Complemento
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="address.complement"
                        className="input"
                        value={profileData.address.complement}
                        onChange={handleChange}
                      />
                    ) : (
                      <p>{user.address?.complement || '-'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bairro
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="address.neighborhood"
                        className="input"
                        value={profileData.address.neighborhood}
                        onChange={handleChange}
                      />
                    ) : (
                      <p>{user.address?.neighborhood}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CEP
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="address.zipCode"
                          className="input"
                          value={profileData.address.zipCode}
                          onChange={handleChange}
                        />
                      ) : (
                        <p>{user.address?.zipCode}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cidade
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="address.city"
                          className="input"
                          value={profileData.address.city}
                          onChange={handleChange}
                        />
                      ) : (
                        <p>{user.address?.city}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="address.state"
                          className="input"
                          value={profileData.address.state}
                          onChange={handleChange}
                        />
                      ) : (
                        <p>{user.address?.state}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Interests Section */}
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Interesses</h2>
              <p className="text-sm text-gray-600 mb-4">
                Selecione os tópicos que mais te interessam para recebermos atualizações personalizadas.
              </p>
              
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((interest) => (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => handleInterestToggle(interest)}
                      className={`py-2 px-4 rounded-md text-sm transition-colors ${
                        profileData.interests?.includes(interest)
                          ? 'bg-black text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user.interests && user.interests.length > 0 ? (
                    user.interests.map((interest) => (
                      <span key={interest} className="bg-gray-100 text-gray-700 py-1.5 px-3 rounded-md text-sm">
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">Nenhum interesse selecionado ainda.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;