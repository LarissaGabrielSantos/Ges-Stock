# 📦 Ges-Stock

**Ges-Stock** é um aplicativo mobile de gerenciamento de estoque desenvolvido com **React Native** e **TypeScript**. Ele utiliza **Clerk** para autenticação segura e **AsyncStorage** para armazenar dados localmente no dispositivo.

---

## 🧩 Tecnologias Utilizadas

- [React Native](https://reactnative.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Clerk](https://clerk.dev/) – Autenticação e gerenciamento de usuários
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) – Armazenamento local
- [Expo](https://expo.dev/) – Facilita o desenvolvimento e testes

---

## ⚙️ Instalação e Execução

### 1. Pré-requisitos

- Node.js (recomenda-se a versão LTS)
- Expo CLI:
  ```bash
  npm install -g expo-cli
  ```
- Conta na [Clerk.dev](https://clerk.dev/)

### 2. Clonando o repositório

```bash
git clone https://github.com/seu-usuario/Ges-Stock.git
cd Ges-Stock
```

### 3. Instalando as dependências

```bash
npm install
```

### 4. Configuração do Clerk

Crie um arquivo `.env` na raiz do projeto e adicione as chaves da sua conta Clerk:

```env
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SIGN_IN_URL=your_signin_url
CLERK_SIGN_UP_URL=your_signup_url
```

### 5. Iniciando a aplicação

```bash
npx expo start
```

> Escaneie o QR code no terminal com o app Expo Go para testar em seu dispositivo físico.

---

## 📲 Instalando no seu dispositivo

### Android/iOS

1. Instale o app **Expo Go** na Play Store ou App Store.
2. Execute `npx expo start` no terminal do projeto.
3. Use a câmera ou o app Expo Go para escanear o QR code.
4. O app será carregado diretamente no seu celular.

> Se quiser gerar um `.apk` ou `.ipa`, pode usar:
```bash
eas build --platform android
```

---

## 📁 Estrutura do Projeto

```
Ges-Stock
├── app/                  # Telas e componentes principais
├── assets/               # Imagens e ícones
├── utils/                # Funções auxiliares
├── .env                  # Variáveis de ambiente
├── index.ts              # Ponto de entrada
├── package.json
├── tsconfig.json
```

---

## ✅ Funcionalidades

- Autenticação com Clerk (login, cadastro, logout)
- Armazenamento local com AsyncStorage
- Gestão de estoque simples
- Interface responsiva

---

## 🧪 Testes

O projeto pode ser testado manualmente no Expo Go, mas futuramente pode ser estendido com bibliotecas como:

- Jest
- React Native Testing Library

---

## 👥 Contribuição

1. Fork este repositório.
2. Crie sua branch: `git checkout -b minha-feature`
3. Faça suas alterações e commit: `git commit -m 'feat: nova funcionalidade'`
4. Push na branch: `git push origin minha-feature`
5. Abra um Pull Request.

---

## 📄 Licença

Este projeto está licenciado sob a licença MIT.
