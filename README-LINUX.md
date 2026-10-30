# Lar em Dia no Linux

Este instalador prepara a aplicação e um MySQL 8.4 local em Docker Compose. O instalador atende Ubuntu e Debian com APT nas arquiteturas `amd64` e `arm64`; requer internet, `sudo` e uma sessão de usuário normal. Ele adiciona o repositório oficial do Docker apenas quando Docker Compose ainda não está disponível e não remove pacotes de containers que já existam. A configuração segue as instruções oficiais do [Docker para Ubuntu](https://docs.docker.com/engine/install/ubuntu/) e [Debian](https://docs.docker.com/engine/install/debian/).

## Instalar

Baixe e extraia o pacote `lar-em-dia-linux.zip`. Entre na pasta `lar-em-dia-linux` e execute:

```bash
chmod +x bootstrap-github-linux.sh install-linux.sh backup-linux.sh restore-linux.sh
./install-linux.sh
```

O script pode solicitar sua senha do `sudo`. Ele cria `.env.local-install` com senhas aleatórias e permissão `600`, compila os containers, inicializa o MySQL e aguarda a resposta saudável do servidor. Ao final, abra **http://127.0.0.1:3000**. Se a porta 3000 já estiver ocupada, altere `APP_PORT` no `.env.local-install` para uma porta livre entre 1024 e 65535 e execute o instalador novamente.

Na primeira inicialização, o app aplica as migrações financeiras locais e começa sem lançamentos fictícios. Cadastre uma entrada ou despesa; após recarregar a página, os valores continuarão no banco deste computador. Categorias customizadas de despesas também são guardadas. Os gráficos e filtros de dia, semana, mês e ano usam os dados salvos.

## Clonar do GitHub e instalar no servidor

Se o repositório GitHub já contém o projeto, execute no servidor o bootstrap incluído no ZIP:

```bash
chmod +x bootstrap-github-linux.sh
./bootstrap-github-linux.sh
```

Ele instala Git e o cliente SSH quando necessário, clona a branch `main` em `~/lar-em-dia` e chama `install-linux.sh`. Nas próximas execuções, busca atualizações e só aceita avanço fast-forward; se houver alterações locais ou a pasta não for o repositório esperado, para sem sobrescrevê-las. O arquivo `.env.local-install` e o volume MySQL são preservados.

O endereço SSH padrão é `git@github.com:Ricardo-Santos-Tostas/finan-as-lar-em-dia.git`; para repositório privado, configure antes no servidor uma chave SSH com acesso ao GitHub. Para um repositório público, pode usar HTTPS:

```bash
LARFIN_REPOSITORY_URL=https://github.com/Ricardo-Santos-Tostas/finan-as-lar-em-dia.git ./bootstrap-github-linux.sh
```

O script verifica se o código de instalação (`install-linux.sh` e `compose.yaml`) existe na branch. Se o repositório ainda não recebeu esses arquivos, ele interrompe com essa indicação.

## Controles do serviço

Os comandos abaixo devem ser executados na pasta do projeto e não apagam o volume do banco:

```bash
# Ver containers e saúde
sudo docker compose --project-name lar-em-dia --env-file .env.local-install -f compose.yaml ps

# Parar e iniciar novamente
sudo docker compose --project-name lar-em-dia --env-file .env.local-install -f compose.yaml stop
sudo docker compose --project-name lar-em-dia --env-file .env.local-install -f compose.yaml up -d

# Reconstruir a aplicação após atualizar os arquivos do projeto
./install-linux.sh
```

Os dados ficam em um volume Docker nomeado. **Não execute `docker compose down -v` nem remova o volume `lar-em-dia_local_finance_data` se quiser preservar seus lançamentos.** O arquivo `.env.local-install` contém as senhas do banco; mantenha-o com permissão restrita e faça cópia segura junto com seus backups. A imagem oficial MySQL usa as variáveis de inicialização para configurar um volume novo; elas não recriam as credenciais de um volume de dados existente [documentação da imagem MySQL](https://hub.docker.com/_/mysql).

## Backup e restauração

Crie um backup compactado com:

```bash
./backup-linux.sh
```

Os arquivos são guardados em `backups/` com permissão restrita. Copie o backup e `.env.local-install` para um local protegido fora deste computador. O diretório `backups/` e o arquivo de credenciais são ignorados pelo Git. Para restaurar, use:

```bash
./restore-linux.sh backups/lar-em-dia-AAAAmmdd-HHMMSS.sql.gz
```

O script valida o gzip, exige que você digite `SUBSTITUIR DADOS FINANCEIROS`, cria um backup de segurança atual, para o app durante a importação e inicia-o novamente. **A restauração substitui as tabelas de finanças pelo estado do dump.** Confira o arquivo e seu conteúdo antes de confirmar; mantenha a cópia gerada automaticamente até confirmar que os dados voltaram corretamente.

## Segurança e limites

A aplicação é configurada para abrir somente em `127.0.0.1`; a porta 3306 do MySQL não é publicada no computador. Não é necessário nem recomendado adicionar o usuário ao grupo `docker`, que pode conceder privilégios equivalentes a root. Esta versão é para uma casa em um computador: não possui login multiusuário. Não altere o mapeamento de porta para `0.0.0.0` sem antes configurar autenticação, HTTPS e controles de rede.

No Preview Manus, onde `FINANCE_DATABASE_URL` não existe, a interface permanece em modo demonstração e não grava dados financeiros no banco gerenciado compartilhado do projeto. Os dados do MySQL descritos aqui pertencem à instalação local.

## Enviar os arquivos do projeto ao GitHub

Para extrair o pacote no PC e publicar a branch `main` do repositório informado, siga [`GITHUB-UPLOAD.md`](GITHUB-UPLOAD.md).