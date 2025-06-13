📦 Ges-Stock
Aplicativo mobile desenvolvido com React Native, TypeScript e Expo, voltado para gestão de estoque, com funcionalidades completas de controle de produtos, histórico de movimentações e exportação de dados.

📱 Funcionalidades
📊 Visualização de estoque em tempo real

🛒 Cadastro e gerenciamento de produtos e categorias

🔄 Histórico de transações (entradas e saídas)

📤 Exportação de dados

⚙️ Configurações personalizadas

👤 Perfil de usuário

🔐 Autenticação com Clerk

🔐 Autenticação com Clerk
O Clerk é utilizado para autenticação segura de usuários. Com ele, o aplicativo oferece login, registro, gerenciamento de sessões e autenticação com provedores externos.

Saiba mais: https://clerk.dev/

🚀 Tecnologias utilizadas
React Native

TypeScript

Expo

Clerk – autenticação

React Navigation

AsyncStorage

[Context API] – gerenciamento de estado

Outras listadas no package.json

🧱 Estrutura de pastas
arduino
Copiar
Editar
app/
├── _layout.tsx
├── (auth)/
│   ├── home.tsx
│   ├── VizuEstoq.tsx
│   ├── cadProd.tsx
│   ├── cadCate.tsx
│   ├── historicoTransacoes.tsx
│   ├── config.tsx
│   ├── exportData.tsx
│   ├── profile.tsx
│   └── auth_layout.tsx
🛠️ Como executar
Pré-requisitos
Node.js

Expo CLI (npm install -g expo-cli)

Conta Clerk configurada

Yarn ou npm

Instalação
bash
Copiar
Editar
# Clone o repositório
git clone https://github.com/seu-usuario/Ges-Stock.git

# Acesse o diretório
cd Ges-Stock

# Instale as dependências
npm install
# ou
yarn install

# Inicie o projeto
npx expo start
Configuração do Clerk
Crie um arquivo .env com suas chaves do Clerk:

ini
Copiar
Editar
CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
As chaves estão disponíveis no painel da sua conta Clerk.

📄 Licença
Este projeto está licenciado sob a licença MIT.

