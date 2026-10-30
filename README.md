# Lar em Dia — Finanças da Casa

Sistema de gestão financeira doméstica desenvolvido com React, Express, tRPC, Drizzle ORM e MySQL.

O projeto pode ser executado em ambiente de desenvolvimento ou instalado em um servidor Linux utilizando Docker e Docker Compose.

## 1. Tecnologias utilizadas

- React
- TypeScript
- Express
- tRPC
- Drizzle ORM
- MySQL
- Docker
- Docker Compose
- Vite
- pnpm

## 2. Requisitos

### Desenvolvimento local

- Node.js
- pnpm
- MySQL, conforme a configuração do ambiente
- Git

### Servidor de produção

- Ubuntu ou Debian com APT
- Arquitetura AMD64 ou ARM64
- Acesso à internet
- Usuário Linux com permissão para executar `sudo`
- GitHub acessível pelo servidor

O instalador configura Docker Engine, Docker Compose e o ambiente MySQL.

## 3. Instalação automática no Ubuntu/Debian

**Atenção:** os comandos desta seção devem ser executados no terminal do servidor Ubuntu/Debian, e não no PowerShell do Windows.

Utilize sua conta Linux normal, sem entrar como `root`. O instalador solicitará privilégios administrativos quando necessário.

### Passo 1 — Atualizar o sistema e instalar o curl

```bash
sudo apt-get update
sudo apt-get install -y curl
```

### Passo 2 — Baixar o script principal

```bash
curl -fsSL https://raw.githubusercontent.com/Ricardo-Santos-Tostas/finan-as-lar-em-dia/main/bootstrap-github-linux.sh -o bootstrap-github-linux.sh
```

### Passo 3 — Dar permissão de execução

```bash
chmod +x bootstrap-github-linux.sh
```

### Passo 4 — Iniciar a instalação

```bash
LARFIN_REPOSITORY_URL=https://github.com/Ricardo-Santos-Tostas/finan-as-lar-em-dia.git ./bootstrap-github-linux.sh
```

O script principal:

1. Identifica se o servidor utiliza Ubuntu ou Debian.
2. Verifica e instala o Git, se necessário.
3. Baixa o projeto do GitHub.
4. Cria o diretório `~/lar-em-dia`.
5. Executa automaticamente o instalador `install-linux.sh`.

## 4. Instalação manual

Se o projeto já estiver baixado no servidor, entre na pasta:

```bash
cd ~/lar-em-dia
```

Dê permissão de execução:

```bash
chmod +x install-linux.sh backup-linux.sh restore-linux.sh
```

Execute o instalador:

```bash
./install-linux.sh
```

O instalador configura o Docker, cria as credenciais locais do MySQL e inicia os serviços.

## 5. Configuração do banco de dados

Durante a primeira instalação, o sistema cria automaticamente:

```text
.env.local-install
```

Esse arquivo contém:

- MYSQL_DATABASE
- MYSQL_USER
- MYSQL_ROOT_PASSWORD
- MYSQL_PASSWORD
- APP_PORT

As senhas são geradas aleatoriamente com OpenSSL.

O arquivo é criado com permissão restrita e não deve ser publicado no GitHub.

Configuração padrão:

```text
MYSQL_DATABASE=larfin
MYSQL_USER=larfin
APP_PORT=3000
```

As senhas são geradas automaticamente e não devem ser substituídas por valores públicos.

**Importante:** preserve o arquivo `.env.local-install`. Ele contém as credenciais necessárias para o banco de dados. Guarde uma cópia segura.

## 6. Acessar o sistema

Após a instalação, o instalador verifica a disponibilidade do endpoint:

```text
/api/health
```

Se tudo estiver funcionando, a aplicação estará disponível localmente em:

```text
http://IP-DO-SERVIDOR:3000
```

A porta padrão é 3000.

Para acessar de outro computador, verifique o firewall e a configuração de rede do servidor. Para disponibilizar o sistema publicamente, configure um domínio, HTTPS e um proxy reverso seguro.

## 7. Comandos de desenvolvimento

Na pasta do projeto:

### Instalar dependências

```bash
pnpm install
```

### Iniciar ambiente de desenvolvimento

```bash
pnpm dev
```

O servidor respeita a variável `PORT`, com padrão 3000.

### Gerar versão de produção

```bash
pnpm build
```

### Iniciar versão de produção

```bash
pnpm start
```

### Executar migrations

```bash
pnpm db:migrate
```

### Gerar e aplicar alterações no schema

```bash
pnpm db:push
```

### Verificar tipos e código

```bash
pnpm check
```

### Executar testes

```bash
pnpm test
```

## 8. Gerenciamento Docker

Os serviços são administrados pelo Docker Compose.

Entrar na pasta:

```bash
cd ~/lar-em-dia
```

Verificar os containers:

```bash
sudo docker compose --project-name lar-em-dia --env-file .env.local-install ps
```

Visualizar os logs:

```bash
sudo docker compose --project-name lar-em-dia --env-file .env.local-install logs -f
```

Visualizar somente os logs da aplicação:

```bash
sudo docker compose --project-name lar-em-dia --env-file .env.local-install logs -f app
```

Visualizar somente os logs do banco:

```bash
sudo docker compose --project-name lar-em-dia --env-file .env.local-install logs -f db
```

Reiniciar os serviços:

```bash
sudo docker compose --project-name lar-em-dia --env-file .env.local-install restart
```

Reconstruir e iniciar os serviços:

```bash
sudo docker compose --project-name lar-em-dia --env-file .env.local-install up -d --build
```

**Atenção:** não utilize `docker compose down -v`, pois isso pode remover o volume persistente do banco de dados.

## 9. Atualizar o projeto pelo GitHub

O script principal pode ser executado novamente para buscar atualizações.

```bash
./bootstrap-github-linux.sh
```

Se o projeto já estiver instalado em `~/lar-em-dia`, o script:

1. Verifica o repositório existente.
2. Confere se a branch é `main`.
3. Verifica se existem alterações locais.
4. Busca as atualizações do GitHub.
5. Aplica somente atualizações compatíveis com fast-forward.
6. Executa novamente o instalador para reconstruir os containers.

O script não sobrescreve alterações locais não salvas.

Se houver alterações locais, salve-as antes de atualizar.

## 10. Backup do sistema

O projeto possui um script de backup:

```bash
./backup-linux.sh
```

O backup deve ser armazenado em local seguro, preferencialmente fora do próprio servidor.

Também é necessário preservar o arquivo:

```text
.env.local-install
```

Ele contém as credenciais utilizadas pelo banco de dados.

Recomenda-se manter cópias em outro servidor ou armazenamento externo.

## 11. Restauração

O projeto possui um script de restauração:

```bash
./restore-linux.sh
```

Antes de restaurar, confira o arquivo de backup e as instruções específicas do script.

A restauração pode substituir os dados atuais. Faça um backup do estado atual antes de executar.

## 12. Segurança

- Nunca publique arquivos `.env` ou `.env.local-install`.
- Nunca coloque senhas, tokens ou chaves privadas diretamente no código.
- Mantenha o Docker, o sistema operacional e as dependências atualizados.
- Restrinja o acesso ao MySQL.
- Utilize HTTPS em produção.
- Faça backups periódicos e teste a restauração.
- Não exponha portas administrativas desnecessariamente.
- Preserve as credenciais do banco em local seguro.

O arquivo `server/_core/publicConfig.ts` deve expor somente configurações públicas explicitamente autorizadas. Chaves privadas devem permanecer no servidor.

## 13. Configuração da plataforma Manus

O projeto foi inicialmente adaptado do template Sandbox web-db-user.

As configurações da plataforma podem ser consultadas e editadas em `webdev.config`.

Os valores padrão são configurações iniciais, não restrições obrigatórias.

O armazenamento gerenciado da plataforma utiliza `/manus-storage/`. A aplicação não deve registrar um segundo proxy para esse mesmo caminho.

Antes de ampliar recursos de login, armazenamento, pagamentos ou contratos de serviço da plataforma, consulte a documentação e as referências de capacidade correspondentes.

## 14. Estrutura do projeto

```text
lar-em-dia/
├── client/
├── drizzle/
├── patches/
├── server/
├── shared/
├── .dockerignore
├── .gitignore
├── Dockerfile
├── compose.yaml
├── package.json
├── pnpm-lock.yaml
├── drizzle.config.ts
├── install-linux.sh
├── bootstrap-github-linux.sh
├── backup-linux.sh
├── restore-linux.sh
└── README.md
```

## 15. Repositório oficial

GitHub:

https://github.com/Ricardo-Santos-Tostas/finan-as-lar-em-dia

Branch principal:

```text
main
```

Script de instalação automática:

https://github.com/Ricardo-Santos-Tostas/finan-as-lar-em-dia/blob/main/bootstrap-github-linux.sh

Instalador direto:

https://github.com/Ricardo-Santos-Tostas/finan-as-lar-em-dia/blob/main/install-linux.sh

---

**Lar em Dia — Finanças da Casa**

Projeto de gestão financeira doméstica.
