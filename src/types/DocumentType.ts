/**
 * Tipos de documentos suportados pelo sistema
 */
export type DocumentType = 'CPF' | 'RG' | 'CNH' | 'Passaporte';

/**
 * Verifica se um tipo de documento é válido
 */
export function isValidDocumentType(type: string): type is DocumentType {
  return ['CPF', 'RG', 'CNH', 'Passaporte'].includes(type);
}

/**
 * Retorna o nome amigável do tipo de documento
 */
export function getDocumentTypeName(type: DocumentType): string {
  const names: Record<DocumentType, string> = {
    'CPF': 'CPF',
    'RG': 'Carteira de Identidade',
    'CNH': 'Carteira Nacional de Habilitação',
    'Passaporte': 'Passaporte'
  };
  
  return names[type] || type;
} 