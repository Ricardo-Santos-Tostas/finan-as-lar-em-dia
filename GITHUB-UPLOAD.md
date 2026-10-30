# Enviar o Lar em Dia ao GitHub pelo seu PC

O pacote `lar-em-dia-github.zip` contém o código-fonte, o instalador Linux, o Compose/MySQL e os scripts auxiliares. Ele não inclui `.git`, credenciais `.env.local-install`, banco de dados, backups ou dependências instaladas.

**O repositório informado é público**, então os arquivos enviados ficarão visíveis publicamente. No momento da preparação, o repositório estava vazio; por isso, o primeiro push criará a branch `main`.

## 1. Extraia o pacote

No Linux ou macOS:

```bash
unzip ~/Downloads/lar-em-dia-github.zip -d ~/lar-em-dia-upload
cd ~/lar-em-dia-upload/lar-em-dia-linux
```

No Windows PowerShell:

```powershell
Expand-Archive "$HOME\Downloads\lar-em-dia-github.zip" -DestinationPath "$HOME\lar-em-dia-upload"
Set-Location "$HOME\lar-em-dia-upload\lar-em-dia-linux"
```

## 2. Envie a branch principal

Com Git instalado e autenticação GitHub configurada no seu PC, execute na pasta extraída:

```bash
git init -b main
git add -A
git status --short
git commit -m "Adicionar Lar em Dia e instalador Linux"
git remote add origin git@github.com:Ricardo-Santos-Tostas/finan-as-lar-em-dia.git
git push -u origin main
```

Se preferir HTTPS, substitua somente o comando do remote por:

```bash
git remote add origin https://github.com/Ricardo-Santos-Tostas/finan-as-lar-em-dia.git
```

O GitHub pedirá autenticação no seu próprio computador. Não coloque tokens ou senhas dentro dos arquivos do projeto. Se o repositório já tiver recebido commits antes do envio, não use `--force`; sincronize os históricos sem sobrescrever o conteúdo existente.

## 3. Baixe do GitHub e instale no servidor Linux

Depois que a branch `main` estiver no GitHub, no servidor Ubuntu/Debian você pode baixar o bootstrap diretamente e executá-lo:

```bash
sudo apt-get update
sudo apt-get install -y curl
curl -fsSL https://raw.githubusercontent.com/Ricardo-Santos-Tostas/finan-as-lar-em-dia/main/bootstrap-github-linux.sh -o bootstrap-github-linux.sh
chmod +x bootstrap-github-linux.sh
LARFIN_REPOSITORY_URL=https://github.com/Ricardo-Santos-Tostas/finan-as-lar-em-dia.git ./bootstrap-github-linux.sh
```

O bootstrap baixa o código da branch `main`, instala Git/cliente SSH se necessário e chama `install-linux.sh`, que prepara Docker Compose e MySQL. O app ficará em `http://127.0.0.1:3000`; o banco permanece em volume local.
