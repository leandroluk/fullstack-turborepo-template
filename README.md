# Metha Energia Workspace

Bem-vindo ao repositório central da **Metha Energia**. Este workspace utiliza uma arquitetura de Git Submodules para gerenciar microsserviços e bibliotecas compartilhadas de forma independente, mantendo um ambiente de desenvolvimento unificado.

## 🚀 Projetos

### Aplicações (`apps/`)
- **[app](https://github.com/metha-energia/apps-identity-api)**: Serviço de gerenciamento de usuários e autenticação.
- **[customer-api](https://github.com/metha-energia/apps-customer-api)**: Serviço responsável pela lógica de negócio relacionada a clientes.
- **[supplier-api](https://github.com/metha-energia/apps-supplier-api)**: Serviço de gerenciamento de fornecedores e ativos de energia.

### Bibliotecas (`libs/`)
- **[config](https://github.com/metha-energia/libs-config)**: Configurações compartilhadas de desenvolvimento (ESLint 10, TypeScript, Vitest, Lefthook).
- **[domain](https://github.com/metha-energia/libs-domain)**: Entidades de domínio, schemas e regras de negócio compartilhadas.

---

## 🌍 Domínio e Contextos Delimitados

O ecossistema Metha Energia é organizado em diversos Contextos Delimitados (Bounded Contexts), garantindo uma separação clara de responsabilidades e uma arquitetura escalável:

- **Identity (IAM)**: Gerencia usuários, papéis (RBAC: USER, ADMIN, MANAGER) e autenticação (SSO Microsoft/Google).
- **Customer**: Lida com dados de consumidores B2C e B2B, perfis e pontos de entrega físicos (Unidades Consumidoras).
- **Distributor (DSO)**: Representa as Distribuidoras de Energia Elétrica (ex: CEMIG) e suas concessões regionais.
- **Supplier (IPP)**: Gerencia Produtores Independentes de Energia e unidades de geração renovável (Solar, Eólica, etc.).
- **Consortium**: Governa as entidades jurídicas para compartilhamento de energia (Cooperativas/Consórcios) e cotas de membros.
- **Metering**: Processa telemetria, leituras de medidores inteligentes e dados de geração/consumo de energia.
- **Allocation (Rateio)**: Motor responsável pelo cálculo e distribuição de créditos de energia dos produtores aos consumidores.
- **Billing**: Gerencia o ciclo de vida financeiro, incluindo faturamento, status de pagamento e liquidação.

---

## 🛠 Dependências

Este workspace requer as seguintes ferramentas:

- **Node.js**: v22+ (LTS mais recente recomendado)
- **pnpm**: v10+ (Gerenciador de pacotes)
- **NestJS**: Framework para as APIs
- **ESLint 10**: Ferramenta de linting com Flat Config
- **Vitest**: Framework de testes

---

## 🏁 Como Começar

### 1. Clonar o Repositório
Como este projeto utiliza Git Submodules, é necessário cloná-lo recursivamente:

```bash
git clone --recursive https://github.com/metha-energia/workspace.git
cd workspace
```

Caso já tenha clonado sem os submódulos, execute:
```bash
git submodule update --init --recursive
```

### 2. Instalar Dependências
Navegue até o projeto específico que deseja trabalhar e instale suas dependências:

```bash
cd apps/identity-api
pnpm install
```

---

## 📖 Como Executar

Cada projeto dentro de `apps/` possui seu próprio conjunto de scripts. Abaixo estão os comandos mais comuns utilizados no workspace:

### Desenvolvimento
```bash
pnpm dev
```

### Build
```bash
pnpm build
```

### Testes
```bash
pnpm test          # Executar todos os testes
pnpm test:watch    # Executar testes em modo observação
pnpm test:cov      # Verificar cobertura de testes
```

### Qualidade de Código
```bash
pnpm lint          # Executar ESLint com correção automática
pnpm format        # Executar Prettier
```

---

## 🔗 Arquitetura do Projeto

- **Submodules**: Cada diretório em `apps/` e `libs/` é um repositório Git independente.
- **Configurações Compartilhadas**: O pacote `libs/config` oferece uma forma centralizada de gerenciar as configurações de ESLint, TSConfig e Vitest em todos os serviços.
- **Conventional Commits**: Utilizamos `commitlint` e `lefthook` para garantir mensagens de commit consistentes e qualidade de código antes do push.
