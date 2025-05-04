import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import { apiService } from '../services/apiService';
import { DocumentAnalysisResult, SocialProfileAnalysisResult } from '../services/aiService';
import { auth } from '../services/firebase';

interface Address {
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  cpf: string;
  birthdate: string;
  phone: string;
  address: Address;
  profilePicture?: string;
  interests?: string[];
  socialProfiles?: {
    platform: string;
    username: string;
    url: string;
    analysisResult?: SocialProfileAnalysisResult;
    manualData?: {
      followedTeams: string;
      recentInteractions: string;
      favoriteGames: string;
    };
  }[];
  documents?: {
    type: string;
    url: string;
    verified: boolean;
    verificationResult?: SocialProfileAnalysisResult;
  }[];
  events?: {
    id: string;
    name: string;
    date: string;
    attended: boolean;
  }[];
  purchaseHistory?: {
    id: string;
    product: string;
    price: number;
    date: string;
  }[];
  createdAt: string;
  password?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  cpf: string;
  birthdate: string;
  phone: string;
  address: Address;
  acceptTerms: boolean;
}

interface UserContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  registerUser: (data: RegisterData) => Promise<void>;
  updateUser: (data: Partial<UserData>) => Promise<void>;
  uploadDocument: (file: File, type: string) => Promise<void>;
  linkSocialProfile: (platform: string, username: string, url: string, manualData?: {
    followedTeams: string;
    recentInteractions: string;
    favoriteGames: string;
  }) => Promise<void>;
  removeSocialProfile: (profileId: string) => Promise<void>;
  verifyDocument: (documentId: string) => Promise<DocumentAnalysisResult>;
  analyzeSocialProfile: (socialProfileId: string) => Promise<SocialProfileAnalysisResult>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Observar mudanças no estado de autenticação
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Se temos um usuário autenticado, buscar seus dados
          const userData = await apiService.getCurrentUser();
          setUser(userData);
        } else {
          // Se não temos usuário autenticado, limpar o estado
          setUser(null);
        }
      } catch (error) {
        // Se houver erro ao buscar os dados, fazer logout
        apiService.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    });

    // Limpar o observer quando o componente for desmontado
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const { user: loggedUser } = await apiService.login(email, password);
      setUser(loggedUser);
      toast.success('Login realizado com sucesso!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha no login');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    apiService.logout();
    setUser(null);
    toast.success('Logout realizado com sucesso');
  };

  const registerUser = async (data: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      const { user: newUser } = await apiService.register(data);
      
      setUser(newUser);
      toast.success('Cadastro realizado com sucesso!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha no cadastro');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (data: Partial<UserData>): Promise<void> => {
    try {
      setIsLoading(true);
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      const updatedUser = await apiService.updateUser(user.id, data);
      setUser(updatedUser);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao atualizar perfil');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadDocument = async (file: File, type: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Converter arquivo para base64
      const reader = new FileReader();
      const documentImagePromise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      
      const documentImage = await documentImagePromise;
      
      // Upload do documento
      const updatedUser = await apiService.uploadDocument(user.id, documentImage, type);
      
      // Atualizar o usuário no contexto
      setUser(updatedUser);
      toast.success('Documento enviado com sucesso!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao enviar documento');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const linkSocialProfile = async (
    platform: string, 
    username: string, 
    url: string,
    manualData?: {
      followedTeams: string;
      recentInteractions: string;
      favoriteGames: string;
    }
  ): Promise<void> => {
    try {
      setIsLoading(true);
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      const updatedUser = await apiService.linkSocialProfile(user.id, platform, username, url, manualData);
      setUser(updatedUser);
      toast.success(`Perfil do ${platform} vinculado com sucesso!`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao vincular perfil social');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeSocialProfile = async (profileId: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Remover o perfil do array de perfis
      const updatedProfiles = user.socialProfiles?.filter((_, index) => index.toString() !== profileId);
      
      // Atualizar o usuário com os perfis atualizados
      const updatedUser = await apiService.updateUser(user.id, {
        socialProfiles: updatedProfiles
      });
      
      setUser(updatedUser);
      toast.success('Perfil social removido com sucesso!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao remover perfil social');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyDocument = async (documentId: string): Promise<DocumentAnalysisResult> => {
    try {
      setIsLoading(true);
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Verificar documento através do backend
      const updatedUser = await apiService.verifyDocument(user.id, documentId);
      
      // Extrair o resultado da verificação
      const document = updatedUser.documents?.find((doc, index) => index.toString() === documentId);
      
      if (!document || !document.verificationResult) {
        throw new Error('Resultado da verificação não disponível');
      }
      
      // Atualizar o usuário no contexto
      setUser(updatedUser);
      
      // Mapear o resultado para o formato DocumentAnalysisResult
      const result: DocumentAnalysisResult = {
        isValid: document.verified,
        confidence: document.verificationResult.details?.confidence as number || 0,
        details: document.verificationResult.details as Record<string, string | null>
      };
      
      return result;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao verificar documento');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeSocialProfile = async (socialProfileId: string): Promise<SocialProfileAnalysisResult> => {
    try {
      setIsLoading(true);
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      // Analisar perfil através do backend
      const updatedUser = await apiService.analyzeSocialProfile(user.id, socialProfileId);
      
      // Extrair o resultado da análise
      const socialProfile = updatedUser.socialProfiles?.find(
        (profile, index) => index.toString() === socialProfileId
      );
      
      if (!socialProfile || !socialProfile.analysisResult) {
        throw new Error('Resultado da análise não disponível');
      }
      
      // Atualizar o usuário no contexto
      setUser(updatedUser);
      
      return socialProfile.analysisResult;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Falha ao analisar perfil social');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      registerUser,
      updateUser,
      uploadDocument,
      linkSocialProfile,
      removeSocialProfile,
      verifyDocument,
      analyzeSocialProfile
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};