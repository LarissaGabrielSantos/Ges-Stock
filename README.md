📦 Ges-Stock
Aplicativo mobile desenvolvido com React Native e TypeScript para gestão de estoque, com funcionalidades como cadastro de produtos, categorias, visualização de estoque, histórico de transações e exportação de dados.

📱 Funcionalidades
📊 Visualização de estoque em tempo real

🛒 Cadastro e gerenciamento de produtos e categorias

🔄 Histórico de transações (entradas e saídas)

⚙️ Configurações personalizadas

🗂️ Exportação de dados

👤 Perfil de usuário

🔐 Layout de autenticação

🚀 Tecnologias utilizadas
React Native

TypeScript

Expo (via app.json)

React Navigation

AsyncStorage (presumido por estrutura de app)

[Context API] para gerenciamento de estado (presumido)

Outros pacotes listados no package.json

🧱 Estrutura de pastas
bash
Copiar
Editar
app/
├── _layout.tsx                # Layout global
├── (auth)/                    # Telas autenticadas
│   ├── home.tsx               # Tela principal
│   ├── VizuEstoq.tsx          # Visualização de estoque
│   ├── cadProd.tsx            # Cadastro de produtos
│   ├── cadCate.tsx            # Cadastro de categorias
│   ├── historicoTransacoes.tsx# Histórico de transações
│   ├── config.tsx             # Configurações
│   ├── exportData.tsx         # Exportar dados
│   ├── profile.tsx            # Perfil do usuário
│   └── auth_layout.tsx        # Layout para área autenticada
🛠️ Como executar
Pré-requisitos
Node.js

Expo CLI (npm install -g expo-cli)

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

# Rode o projeto
npx expo start
📂 Arquivos importantes
.env – variáveis de ambiente

app.json – configuração do Expo

tsconfig.json – configuração do TypeScript

babel.config.js – configuração do Babel

📄 Licença
Este projeto está licenciado sob a licença MIT.
