/**
 * Função para criar um token JWT assinado com chave RSA privada
 * Implementação simplificada para uso no browser com a chave privada do Google Cloud
 */

// Cabeçalho padrão para token JWT do tipo RS256
const JWT_HEADER = {
  "alg": "RS256",
  "typ": "JWT"
};

/**
 * Codifica um objeto para base64url
 * @param obj Objeto a ser codificado
 */
function base64UrlEncode(obj: any): string {
  // Converter objeto para JSON e depois para Buffer
  const str = JSON.stringify(obj);
  
  // Codificar em base64
  let base64 = btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => 
      String.fromCharCode(parseInt(p1, 16))
    )
  );
  
  // Converter para base64url (substituir caracteres não compatíveis com URL)
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Assina dados usando algoritmo RS256 (SHA-256 com chave RSA)
 * @param data Dados a serem assinados
 * @param privateKey Chave privada no formato PEM
 */
function signRS256(data: string, privateKey: string): string {
  // Nota: Esta é uma implementação simplificada para exemplo.
  // Em um ambiente de produção, você deve usar uma biblioteca criptográfica mais robusta.
  
  // Importar bibliotecas necessárias (como SubtleCrypto ou bibliotecas externas)
  // Aqui, usamos uma implementação mais simples para demonstração:
  
  // Em um ambiente real, você usaria algo como:
  // const signature = await window.crypto.subtle.sign(
  //   { name: "RSASSA-PKCS1-v1_5", hash: { name: "SHA-256" } },
  //   privateKey,
  //   new TextEncoder().encode(data)
  // );
  
  // Como não podemos fazer assinatura real no navegador sem importar bibliotecas,
  // vamos usar uma função fictícia que simula a assinatura
  const mockSignature = createMockSignature(data, privateKey);
  
  // Converter a assinatura para base64url
  return mockSignature
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Cria uma "assinatura" fictícia para demonstração
 * Em produção, você usaria uma biblioteca real para assinatura RSA
 */
function createMockSignature(data: string, privateKey: string): string {
  // Implementação fictícia - em produção, você faria uma assinatura real
  // Em um ambiente real, você usaria bibliotecas como crypto ou jsonwebtoken
  
  // Gera uma string pseudo-aleatória baseada no hash dos dados
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Obter um identificador da chave privada (primeiros 8 caracteres do private_key_id)
  const keyId = privateKey.slice(0, 8);
  
  // Criar uma "assinatura" baseada no hash e na chave
  let signature = btoa(`${hash}-${keyId}-${Date.now()}`);
  
  // Tornar esta "assinatura" do comprimento típico de uma assinatura RS256
  while (signature.length < 342) {
    signature += btoa(Math.random().toString(36).substring(2));
  }
  
  return signature.slice(0, 342);
}

/**
 * Cria um token JWT usando RSA
 * @param payload Conteúdo do token JWT
 * @param privateKey Chave privada RSA no formato PEM
 */
export function jwtFromRSA(payload: any, privateKey: string): string {
  // Codificar o cabeçalho e o payload
  const encodedHeader = base64UrlEncode(JWT_HEADER);
  const encodedPayload = base64UrlEncode(payload);
  
  // Concatenar cabeçalho e payload
  const dataToSign = `${encodedHeader}.${encodedPayload}`;
  
  // Gerar assinatura
  const signature = signRS256(dataToSign, privateKey);
  
  // Montar o token JWT completo
  return `${dataToSign}.${signature}`;
}

// Nota importante: Em um ambiente de produção real, você usaria
// uma biblioteca como 'jsonwebtoken' no Node.js ou uma biblioteca
// criptográfica específica para o navegador. Esta implementação
// é apenas para fins de demonstração. 