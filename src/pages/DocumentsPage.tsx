import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Check, AlertCircle, FileText, Trash2, Shield, Eye } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { toast } from 'react-hot-toast';

const DocumentsPage: React.FC = () => {
  const { user, uploadDocument, verifyDocument } = useUser();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documentType, setDocumentType] = useState('identidade');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isVerifying, setIsVerifying] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Por favor, selecione um arquivo para upload');
      return;
    }
    
    setIsUploading(true);
    try {
      await uploadDocument(file, documentType);
      toast.success('Documento enviado com sucesso!');
      setFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('Erro ao enviar documento. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleVerifyDocument = async (documentId: string) => {
    setIsVerifying(documentId);
    try {
      const result = await verifyDocument(documentId);
      
      if (result.isValid) {
        toast.success('Documento verificado com sucesso!');
      } else {
        toast.error('Falha na verificação do documento.');
      }
    } catch (error) {
      toast.error('Erro ao verificar documento. Tente novamente.');
    } finally {
      setIsVerifying(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(droppedFile);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Render verification result details
  const renderVerificationDetails = (documentIndex: number) => {
    const doc = user.documents?.[documentIndex];
    if (!doc || !doc.verificationResult) return null;
    
    const result = doc.verificationResult;
    
    return (
      <div className="mt-4 bg-gray-50 p-4 rounded-md">
        <h4 className="text-sm font-medium mb-2">Detalhes da verificação</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Confiança:</span>
            <span className="font-medium">{result.confidence}%</span>
          </div>
          {result.matchedName && (
            <div className="flex justify-between">
              <span className="text-gray-600">Nome confirmado:</span>
              <span className="font-medium">{result.matchedName}</span>
            </div>
          )}
          {result.matchedCPF && (
            <div className="flex justify-between">
              <span className="text-gray-600">CPF confirmado:</span>
              <span className="font-medium">{result.matchedCPF}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">ID de verificação:</span>
            <span className="font-medium text-xs">{result.verificationId}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Upload de Documentos</h1>
          <p className="mb-4 text-gray-600">
            Faça o upload dos seus documentos para validar sua identidade. 
            Isso nos ajuda a personalizar sua experiência e garantir que você tenha acesso 
            a todos os benefícios exclusivos para fãs da FURIA.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <div className="flex items-center text-sm text-gray-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>Seus documentos são protegidos e verificados com segurança usando tecnologia de IA.</span>
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="documentType" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Documento
            </label>
            <select
              id="documentType"
              className="input"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
            >
              <option value="identidade">RG / Carteira de Identidade</option>
              <option value="cnh">CNH</option>
              <option value="passaporte">Passaporte</option>
              <option value="comprovante_residencia">Comprovante de Residência</option>
            </select>
          </div>
          
          <div 
            className={`border-2 border-dashed rounded-lg p-6 text-center mb-6 transition-colors ${
              preview ? 'border-black bg-gray-50' : 'border-gray-300 hover:border-black'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {!preview ? (
              <div>
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-600 mb-1">
                  Arraste e solte seu arquivo aqui, ou <span className="text-black font-medium">clique para selecionar</span>
                </p>
                <p className="text-xs text-gray-500">
                  Formatos suportados: PNG, JPG ou PDF até 5MB
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={handleFileChange}
                  onClick={() => fileInputRef.current?.click()}
                />
                <button 
                  className="btn btn-secondary mt-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Selecionar arquivo
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-4 relative">
                  {file?.type.includes('image') ? (
                    <img 
                      src={preview} 
                      alt="Document preview" 
                      className="max-h-64 mx-auto object-contain"
                    />
                  ) : (
                    <div className="p-8 bg-gray-100 max-w-sm mx-auto">
                      <FileText className="h-16 w-16 mx-auto text-gray-400" />
                      <p className="mt-2 text-gray-600">{file?.name}</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-center space-x-3">
                  <button 
                    className="btn btn-outline py-2 px-4 inline-flex items-center"
                    onClick={clearFile}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remover
                  </button>
                  <button 
                    className="btn btn-primary py-2 px-4 inline-flex items-center"
                    onClick={handleUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Enviar documento
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Documentos já enviados */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Documentos Enviados</h2>
          
          {(!user.documents || user.documents.length === 0) && (
            <p className="text-gray-500 italic">Nenhum documento enviado ainda.</p>
          )}
          
          {user.documents && user.documents.length > 0 && (
            <div className="space-y-4">
              {user.documents.map((doc, index) => (
                <div key={index} className="border border-gray-200 rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-10 w-10 text-gray-400 mr-4" />
                      <div>
                        <p className="font-medium">{doc.type}</p>
                        <p className="text-sm text-gray-500">
                          {new Date().toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {doc.verified ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                          <Check className="h-4 w-4 mr-1" />
                          Verificado
                        </span>
                      ) : (
                        <div className="flex space-x-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
                            Pendente
                          </span>
                          <button
                            className="btn btn-secondary py-2 px-3 text-sm inline-flex items-center"
                            onClick={() => handleVerifyDocument(index.toString())}
                            disabled={isVerifying === index.toString()}
                          >
                            {isVerifying === index.toString() ? (
                              <>
                                <span className="inline-block h-3 w-3 border-2 border-black border-t-transparent rounded-full animate-spin mr-1"></span>
                                Verificando...
                              </>
                            ) : (
                              <>
                                <Shield className="h-3 w-3 mr-1" />
                                Verificar com IA
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Detalhes da verificação se disponível */}
                  {doc.verificationResult && renderVerificationDetails(index)}
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-8 bg-gray-50 p-4 rounded-md">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-gray-600 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Verificação de documentos com IA</h3>
                <p className="text-sm text-gray-600">
                  Nosso sistema de IA verifica seus documentos para garantir sua autenticidade e melhorar
                  sua experiência como fã da FURIA. Seus documentos são processados com segurança e as
                  informações extraídas são usadas apenas para validar sua identidade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;