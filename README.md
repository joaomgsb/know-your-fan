# FURIA - Know Your Fan

Aplicação para coleta e análise de dados de fãs da FURIA, seguindo a estratégia "Know Your Fan" para oferecer experiências e serviços exclusivos. A plataforma integra verificação de documentos e análise de redes sociais usando serviços de IA reais.

![FURIA Logo](https://upload.wikimedia.org/wikipedia/commons/7/7f/Logo_of_FURIA_Esports.svg)

## Funcionalidades

- **Cadastro completo de usuários** com dados pessoais, endereço e CPF
- **Upload e verificação de documentos** utilizando Google Cloud Vision AI
- **Vinculação de redes sociais** com análise de relevância
- **Dashboard personalizado** para visualização de eventos e compras
- **Perfil detalhado** com interesses e atividades relacionadas a e-sports

## Tecnologias utilizadas

- React + TypeScript + Vite
- React Router para navegação
- TailwindCSS para estilização
- Google Cloud Vision API para processamento de documentos
- API proprietária para análise de redes sociais
- Backend RESTful para persistência e processamento

## Como executar o projeto

### Pré-requisitos

- Node.js 16+
- npm ou yarn
- Chaves de API configuradas (veja abaixo)

### Configuração das APIs

Para o funcionamento completo do projeto, você precisa configurar:

1. Crie um arquivo `.env.local` na raiz do projeto 
2. Copie o conteúdo do arquivo `.env.example`
3. Substitua com suas chaves válidas:

```
VITE_API_BASE_URL=https://api.furia.fan
VITE_GOOGLE_CLOUD_VISION_API_KEY=sua_chave_do_google_cloud_vision
VITE_SOCIAL_ANALYTICS_API_KEY=sua_chave_de_analytics
```

Para obter estas chaves:
- [Google Cloud Vision API](https://cloud.google.com/vision/docs/setup) - Siga as instruções para criar um projeto e gerar uma chave de API.
- API de análise social - Entre em contato com o time da FURIA para obter acesso.

### Instalação

1. Clone o repositório
```
git clone https://github.com/furia/know-your-fan.git
cd know-your-fan
```

2. Instale as dependências
```
npm install
# ou
yarn
```

3. Execute o projeto em modo de desenvolvimento
```
npm run dev
# ou
yarn dev
```

4. Acesse o projeto no navegador
```
http://localhost:5173
```

## Como usar

### Criação de conta e login

1. Acesse a página inicial e clique em "Criar conta"
2. Preencha seus dados pessoais, endereço e contato
3. Faça o login com suas credenciais

### Verificação de identidade

1. Acesse a seção "Documentos"
2. Envie uma foto do seu documento (RG, CNH ou Passaporte)
3. O sistema usará IA para verificar a autenticidade e extrair informações automaticamente

### Vinculação de redes sociais

1. Na seção "Redes Sociais", vincule suas contas
2. O sistema analisará seu perfil e engajamento com e-sports
3. Visualize sua análise de relevância e recomendações personalizadas

## Arquitetura do sistema

O frontend React se comunica com:
1. **API RESTful principal** - Para autenticação, gerenciamento de usuários e dados
2. **Google Cloud Vision** - Para processamento de documentos e extração de texto
3. **API de análise social** - Para avaliar relevância de perfis com eSports

## Sobre o desafio

Este projeto foi desenvolvido como parte do desafio para a vaga de desenvolvedor na FURIA. O objetivo é implementar uma solução completa que permita:

1. Coletar dados básicos, como nome, endereço, CPF e interesses
2. Realizar upload de documentos e validar a identificação da pessoa utilizando IA real
3. Vincular redes sociais ao perfil, permitindo leitura de interações relacionadas a e-sports
4. Compartilhar links de perfis e validar a relevância do conteúdo utilizando análise por IA

## Deployment

Para ambientes de produção:
```
npm run build
# ou 
yarn build
```

Os arquivos de produção serão gerados na pasta `dist` e podem ser servidos por qualquer servidor web estático. 