# FURIA - Know Your Fan 🎮

Aplicação para coleta e análise de dados de fãs da FURIA, seguindo a estratégia "Know Your Fan" para oferecer experiências e serviços exclusivos. A plataforma integra verificação de documentos, análise de redes sociais usando IA e estatísticas detalhadas do FACEIT.

![FURIA Logo](https://upload.wikimedia.org/wikipedia/commons/7/7f/Logo_of_FURIA_Esports.svg)

## 🌟 Funcionalidades Principais

### Perfil do Fã
- **Cadastro Completo**
  - Dados pessoais (nome, endereço, CPF)
  - Informações sobre interesses
  - Histórico de atividades e eventos
  - Registro de compras relacionadas

- **Verificação de Identidade com IA**
  - Upload de documentos (RG, CNH, Passaporte)
  - Validação automática via microsserviço Google Cloud Vision
  - Extração inteligente de informações
  - Verificação de autenticidade em tempo real

- **Integração com Redes Sociais**
  - Vinculação de perfis sociais
  - Análise de interações
  - Monitoramento de páginas seguidas
  - Avaliação de atividades relacionadas à FURIA
  - Análise de relevância do conteúdo usando IA

### Estatísticas FACEIT
- **Busca de Jogadores**
  - Pesquisa por nickname
  - Visualização de nível e ELO
  - Histórico detalhado de partidas

- **Métricas de Desempenho**
  - K/D Ratio e Headshot %
  - Taxa de vitória
  - Sequências de vitórias
  - Mapas mais jogados
  - ADR (Average Damage per Round)

## 🚀 Tecnologias Utilizadas

### 🔥 Firebase
O projeto utiliza o Firebase para:

#### Autenticação
- Login com email/senha
- Persistência local de sessão
- Proteção de rotas

#### Firestore
- Armazenamento de dados dos usuários
- Histórico de atividades
- Preferências e configurações

#### Segurança
- Regras de acesso personalizadas
- Validação de dados
- Backup automático

- **Frontend**
  - React + TypeScript + Vite
  - TailwindCSS para estilização
  - React Router para navegação
  - React Context para estado global
  - React Hot Toast para notificações

- **APIs e Serviços**
  - Firebase (Auth e Firestore) para autenticação e dados
  - Microsserviço Google Cloud Vision para análise de documentos
  - FACEIT API para estatísticas de jogadores
  - Backend RESTful para persistência

## 🔌 Microsserviços

### Google Cloud Vision Service
Este serviço está em um repositório separado e é responsável por toda a análise e validação de documentos.

- **Repositório**: [Link para o repositório do microsserviço]
- **Funcionalidades**:
  - Processamento de imagens de documentos
  - Extração de texto via OCR
  - Validação de autenticidade
  - Análise de qualidade da imagem

- **Como Integrar**:
  1. Clone e configure o microsserviço separadamente
  2. Garanta que o serviço esteja rodando antes de usar as funcionalidades de documento

## 📋 Pré-requisitos

- Node.js 16+
- NPM ou Yarn
- Microsserviço Google Cloud Vision configurado e rodando
- Chave de API do FACEIT

## ⚙️ Configuração

1. Clone o repositório:
```bash
git clone https://github.com/furia/know-your-fan.git
cd know-your-fan
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente no arquivo `.env.local`:
```env
# Firebase
VITE_FIREBASE_API_KEY=sua_api_key_do_firebase
VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
VITE_FIREBASE_PROJECT_ID=seu_project_id
VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
VITE_FIREBASE_APP_ID=seu_app_id

# FACEIT
VITE_FACEIT_API_KEY=sua_chave_faceit_api
```

## 🎮 Como Usar

### Cadastro e Verificação
1. Certifique-se que o microsserviço do Google Cloud Vision está rodando
2. Crie uma conta com seus dados básicos
3. Faça upload de um documento de identificação
4. Aguarde a verificação automática via IA

### Integração Social
1. Vincule suas redes sociais
2. Permita acesso às interações
3. Visualize sua análise de relevância

### Estatísticas FACEIT
1. Acesse a seção FACEIT
2. Pesquise por um nickname
3. Visualize estatísticas detalhadas

## 📁 Estrutura do Projeto

```
know-your-fan/
├── public/
│   └── images/
│       └── maps/         # Imagens dos mapas CS2
├── src/
│   ├── components/       # Componentes React
│   ├── contexts/        # Contextos globais
│   ├── pages/           # Páginas da aplicação
│   ├── services/        # Integrações com APIs
│   └── styles/          # Estilos globais
└── ...
```

## 🔒 Segurança

- Dados sensíveis criptografados
- Autenticação em duas etapas
- Validação de documentos com IA
- Tokens de acesso seguros para APIs

## 📝 Notas Importantes

- A verificação de documentos requer imagens claras e legíveis
- A análise de redes sociais depende das permissões concedidas
- A API FACEIT tem limites de requisições
- Alguns dados podem não estar disponíveis em tempo real

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie sua branch de feature (`git checkout -b feature/NovaFeature`)
3. Commit suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

- João Mateus - [GitHub](https://github.com/joaomgsb)

## 🙏 Agradecimentos

- FURIA Esports pelo desafio
- FACEIT pela disponibilização da API
- Google Cloud pela infraestrutura de IA 