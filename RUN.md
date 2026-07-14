# Como Executar o Projeto - Sistema de Controle de Gastos

Este arquivo descreve as instruções necessárias para instalar as dependências, rodar o servidor de desenvolvimento e gerar o pacote de produção do projeto **Gastos**.

---

## 📋 Pré-requisitos

Certifique-se de ter instalado em seu computador:
- **Node.js** (recomendado versão 18 ou superior - o projeto foi testado na v25.8)
- **NPM** (gerenciador de pacotes padrão do Node)

---

## 🚀 Instalação e Inicialização

Siga os passos no terminal da pasta do projeto (`c:/Sites/gastos`):

### 1. Instalar as dependências do projeto
```bash
npm install
```
*(Isso instalará o React, Vite, TypeScript e a biblioteca Lucide React de ícones).*

### 2. Executar o servidor de desenvolvimento local
```bash
npm run dev
```
*(Após rodar o comando, o Vite iniciará o servidor local, geralmente no endereço [http://localhost:5173/](http://localhost:5173/)).*

### 3. Build para Produção (Gerar pacote estático)
Para gerar o pacote otimizado e pronto para hospedagem na Vercel ou qualquer outro servidor estático:
```bash
npm run build
```
*(Isso criará uma pasta chamada `dist/` na raiz do projeto com todo o código JS/CSS compilado, minimizado e pronto para produção).*

---

## 🛠️ Comandos de Suporte e Desenvolvimento
- **`npm run lint`**: Roda o analisador de código oxlint/eslint para verificar lints e formatações.
- **`npm run preview`**: Abre um servidor local temporário servindo a pasta de build `dist/` para testes de performance pré-deploy.
