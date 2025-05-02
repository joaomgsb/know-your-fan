import { UserData } from '../contexts/UserContext';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion
} from "firebase/firestore";
import { auth, db } from './firebase';
import { AIService, DocumentAnalysisResult, SocialProfileAnalysisResult } from './aiService';

// Instância do serviço de IA
const aiService = new AIService();

// Interface para dados de registro
interface RegisterUserData extends Partial<UserData> {
  email: string;
  password: string;
  name: string;
  acceptTerms: boolean;
}

// Tipo para erros do Firebase
type FirebaseError = {
  code?: string;
  message: string;
};

// Classe APIService com implementação do Firebase
class APIService {
  private readonly AUTH_TOKEN_KEY = 'furia_auth_token';
  
  /**
   * Obtém o token de autenticação do localStorage
   */
  private getAuthToken(): string | null {
    return localStorage.getItem(this.AUTH_TOKEN_KEY);
  }
  
  /**
   * Define o token de autenticação no localStorage
   */
  private setAuthToken(token: string): void {
    localStorage.setItem(this.AUTH_TOKEN_KEY, token);
  }
  
  /**
   * Remove o token de autenticação do localStorage
   */
  private removeAuthToken(): void {
    localStorage.removeItem(this.AUTH_TOKEN_KEY);
  }
  
  /**
   * Método para fazer login usando Firebase Authentication
   * @param email Email do usuário
   * @param password Senha do usuário
   */
  async login(email: string, password: string): Promise<{ user: UserData; token: string }> {
    try {
      // Autenticar com Firebase
      const credentials = await signInWithEmailAndPassword(auth, email, password);
      const token = await credentials.user.getIdToken();
      
      // Obter dados do usuário do Firestore
      const userDoc = await getDoc(doc(db, "users", credentials.user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('Dados do usuário não encontrados');
      }
      
      const userData = userDoc.data() as UserData;
      
      // Salvar token
      this.setAuthToken(token);
      
      return { user: userData, token };
    } catch (error) {
      const fbError = error as FirebaseError;
      if (fbError.code === 'auth/user-not-found' || fbError.code === 'auth/wrong-password') {
        throw new Error('Email ou senha incorretos');
      } else if (fbError.code === 'auth/too-many-requests') {
        throw new Error('Muitas tentativas. Tente novamente mais tarde');
      }
      
      throw new Error('Falha no login: ' + fbError.message);
    }
  }
  
  /**
   * Método para registrar um novo usuário usando Firebase
   * @param userData Dados do usuário para registro
   */
  async register(userData: RegisterUserData): Promise<{ user: UserData; token: string }> {
    try {
      if (!userData.email || !userData.password) {
        throw new Error('Email e senha são obrigatórios');
      }

      if (!userData.acceptTerms) {
        throw new Error('É necessário aceitar os termos e condições');
      }
      
      // Primeiro, criar usuário no Firebase Auth
      let credentials;
      try {
        credentials = await createUserWithEmailAndPassword(
          auth, 
          userData.email, 
          userData.password
        );
      } catch (authError: any) {
        if (authError.code === 'auth/email-already-in-use') {
          throw new Error('Este email já está em uso');
        } else if (authError.code === 'auth/weak-password') {
          throw new Error('A senha é muito fraca');
        } else if (authError.code === 'auth/invalid-email') {
          throw new Error('Email inválido');
        }
        throw new Error('Erro ao criar usuário: ' + authError.message);
      }
      
      const token = await credentials.user.getIdToken();
      
      // Criar cópia dos dados sem a senha para salvar no Firestore
      const userDataForFirestore: UserData = {
        id: credentials.user.uid,
        name: userData.name,
        email: userData.email,
        cpf: userData.cpf || '',
        birthdate: userData.birthdate || '',
        phone: userData.phone || '',
        address: userData.address || {
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
          zipCode: ''
        },
        documents: [],
        socialProfiles: [],
        createdAt: new Date().toISOString()
      };
      
      try {
        // Salvar no Firestore
        await setDoc(doc(db, "users", credentials.user.uid), userDataForFirestore);
      } catch (firestoreError) {
        // Se falhar ao salvar no Firestore, deletar o usuário do Auth
        await credentials.user.delete();
        throw new Error('Erro ao salvar dados do usuário. Por favor, tente novamente.');
      }
      
      // Salvar token
      this.setAuthToken(token);
      
      return { user: userDataForFirestore, token };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Falha no cadastro: ' + (error as any).message);
    }
  }
  
  /**
   * Método para fazer logout
   */
  logout(): void {
    signOut(auth).then(() => {
      this.removeAuthToken();
    }).catch((error: Error) => {
      console.error('Erro ao fazer logout:', error);
    });
  }
  
  /**
   * Método para obter dados do usuário atual
   */
  async getCurrentUser(): Promise<UserData> {
    try {
      const currentUser = auth.currentUser;
      
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }
      
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      
      if (!userDoc.exists()) {
        throw new Error('Dados do usuário não encontrados');
      }
      
      return userDoc.data() as UserData;
    } catch (error) {
      const fbError = error as FirebaseError;
      this.removeAuthToken();
      throw new Error('Erro ao obter dados do usuário: ' + fbError.message);
    }
  }
  
  /**
   * Método para atualizar dados do usuário
   */
  async updateUser(userId: string, userData: Partial<UserData>): Promise<UserData> {
    try {
      const currentUser = auth.currentUser;
      
      if (!currentUser || currentUser.uid !== userId) {
        throw new Error('Não autorizado a atualizar este perfil');
      }
      
      // Atualizar no Firestore
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, userData);
      
      // Buscar dados atualizados
      const updatedUserDoc = await getDoc(userRef);
      
      if (!updatedUserDoc.exists()) {
        throw new Error('Dados do usuário não encontrados após atualização');
      }
      
      return updatedUserDoc.data() as UserData;
    } catch (error) {
      const fbError = error as FirebaseError;
      throw new Error('Erro ao atualizar perfil: ' + fbError.message);
    }
  }
  
  /**
   * Método para fazer upload de documento
   */
  async uploadDocument(userId: string, documentImage: string, documentType: string): Promise<UserData> {
    try {
      const currentUser = auth.currentUser;
      
      if (!currentUser || currentUser.uid !== userId) {
        throw new Error('Não autorizado a enviar documentos para este usuário');
      }
      
      // Criar novo documento com a URL completa da imagem
      const newDocument = {
        type: documentType,
        url: documentImage, // Preservar imagem base64 completa para verificação de IA
        verified: false,
        uploadDate: new Date().toISOString()
      };
      
      // Atualizar no Firestore
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        documents: arrayUnion(newDocument)
      });
      
      // Buscar dados atualizados
      const updatedUserDoc = await getDoc(userRef);
      
      if (!updatedUserDoc.exists()) {
        throw new Error('Dados do usuário não encontrados após upload de documento');
      }
      
      return updatedUserDoc.data() as UserData;
    } catch (error) {
      const fbError = error as FirebaseError;
      throw new Error('Erro ao enviar documento: ' + fbError.message);
    }
  }
  
  /**
   * Método para vincular perfil de rede social
   */
  async linkSocialProfile(userId: string, platform: string, username: string, url: string): Promise<UserData> {
    try {
      const currentUser = auth.currentUser;
      
      if (!currentUser || currentUser.uid !== userId) {
        throw new Error('Não autorizado a vincular perfis para este usuário');
      }
      
      // Criar novo perfil
      const newProfile = {
        platform,
        username,
        url
      };
      
      // Atualizar no Firestore
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        socialProfiles: arrayUnion(newProfile)
      });
      
      // Buscar dados atualizados
      const updatedUserDoc = await getDoc(userRef);
      
      if (!updatedUserDoc.exists()) {
        throw new Error('Dados do usuário não encontrados após vinculação de perfil');
      }
      
      return updatedUserDoc.data() as UserData;
    } catch (error) {
      const fbError = error as FirebaseError;
      throw new Error('Erro ao vincular perfil social: ' + fbError.message);
    }
  }
  
  /**
   * Método para verificar documento com IA (usando Google Vision)
   */
  async verifyDocument(userId: string, documentId: string): Promise<UserData> {
    try {
      const currentUser = auth.currentUser;
      
      if (!currentUser || currentUser.uid !== userId) {
        throw new Error('Não autorizado a verificar documentos deste usuário');
      }
      
      // Buscar usuário atual para modificar o documento
      const userDoc = await getDoc(doc(db, "users", userId));
      
      if (!userDoc.exists()) {
        throw new Error('Usuário não encontrado');
      }
      
      const userData = userDoc.data() as UserData;
      
      // Neste caso, o documentId é o índice no array
      const documentIndex = parseInt(documentId);
      
      if (isNaN(documentIndex) || !userData.documents || documentIndex >= userData.documents.length) {
        throw new Error('Documento não encontrado');
      }

      // Documento que será verificado
      const document = userData.documents[documentIndex];
      
      if (!document.url) {
        throw new Error('URL do documento não disponível');
      }

      console.log(document)
      
      // Verificar o documento usando o serviço de IA real
      const verificationResult = await aiService.verifyDocument(
        document.url,
        document.type
      );
      
      // Mapear o resultado da verificação para o formato do perfil de usuário
      const formattedResult: SocialProfileAnalysisResult = {
        riskLevel: verificationResult.isValid ? 'low' : 'high',
        flags: [],
        details: {
          ...verificationResult.details,
          confidence: verificationResult.confidence,
          verificationId: `ver_${Date.now()}`
        }
      };
      
      // Adicionar flags com base nos resultados
      if (!verificationResult.isValid) {
        formattedResult.flags.push('documento_inválido');
      }
      
      if (verificationResult.confidence < 0.5) {
        formattedResult.flags.push('baixa_confiança');
        formattedResult.riskLevel = 'high';
      } else if (verificationResult.confidence < 0.7) {
        formattedResult.flags.push('média_confiança');
        formattedResult.riskLevel = 'medium';
      }
      
      // Atualizar o documento específico
      const updatedDocuments = [...userData.documents];
      updatedDocuments[documentIndex] = {
        ...updatedDocuments[documentIndex],
        verified: verificationResult.isValid,
        verificationResult: formattedResult
      };
      
      // Atualizar no Firestore
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        documents: updatedDocuments
      });
      
      // Buscar dados atualizados
      const updatedUserDoc = await getDoc(userRef);
      
      if (!updatedUserDoc.exists()) {
        throw new Error('Dados do usuário não encontrados após verificação de documento');
      }
      
      return updatedUserDoc.data() as UserData;
    } catch (error) {
      const fbError = error as FirebaseError;
      throw new Error('Erro ao verificar documento: ' + fbError.message);
    }
  }
  
  /**
   * Método para analisar perfil social com IA
   */
  async analyzeSocialProfile(userId: string, profileId: string): Promise<UserData> {
    try {
      const currentUser = auth.currentUser;
      
      if (!currentUser || currentUser.uid !== userId) {
        throw new Error('Não autorizado a analisar perfis deste usuário');
      }
      
      // Buscar usuário atual para modificar o perfil
      const userDoc = await getDoc(doc(db, "users", userId));
      
      if (!userDoc.exists()) {
        throw new Error('Usuário não encontrado');
      }
      
      const userData = userDoc.data() as UserData;
      
      // Como profileId é passado como índice, converter para número
      const profileIndex = parseInt(profileId);
      
      // Verificar se o índice é válido
      if (isNaN(profileIndex) || !userData.socialProfiles || profileIndex >= userData.socialProfiles.length) {
        throw new Error('Perfil social não encontrado');
      }
      
      // Perfil atual
      const currentProfile = userData.socialProfiles[profileIndex];
      
      // Analisar o perfil usando o serviço de IA real
      const analysisResult = await aiService.analyzeSocialProfile(
        currentProfile.platform,
        currentProfile.url
      );
      
      // Atualizar o perfil social
      const updatedProfiles = [...userData.socialProfiles];
      updatedProfiles[profileIndex] = {
        ...updatedProfiles[profileIndex],
        analysisResult
      };
      
      // Atualizar no Firestore
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        socialProfiles: updatedProfiles
      });
      
      // Buscar dados atualizados
      const updatedUserDoc = await getDoc(userRef);
      
      if (!updatedUserDoc.exists()) {
        throw new Error('Dados do usuário não encontrados após análise de perfil');
      }
      
      return updatedUserDoc.data() as UserData;
    } catch (error) {
      const fbError = error as FirebaseError;
      throw new Error('Erro ao analisar perfil social: ' + fbError.message);
    }
  }
}

export const apiService = new APIService(); 