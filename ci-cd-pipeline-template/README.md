# Projeto: Pipeline CI/CD para Cloud Computing (Jenkins + GitHub Actions + AWS)

> **Status**: Template pronto para clonar e usar.  
> **Altere** os campos marcados com `TODO` e publique seu repositório para o link final do PDF.

## Objetivo
Implementar um pipeline CI/CD que:
- Faz **CI no GitHub Actions** (build, testes e push da imagem Docker para o Amazon ECR).
- Faz **CD no Jenkins** (pull da imagem do ECR e `docker compose up -d` em uma instância EC2).
- Usa **Docker** para empacotar e servir um app Node.js simples.

## Arquitetura (visão geral)
```
Dev -> (push) -> GitHub -> GitHub Actions -> ECR
                                     |            \
                                     |             \
                                 Jenkins (EC2) <---- pull -> docker compose -> App em EC2
```

## Requisitos do Curso (checklist)
- [x] Repositório com **README** explicando o projeto e execução
- [x] **Jenkins** e **GitHub Actions** configurados
- [x] **Passo a passo** para configurar **runners** (self-hosted) e **Jenkins**
- [x] **Artefatos executados**: imagem Docker, testes, deploy com compose
- [x] **Participantes do grupo** adicionados ao repositório (colaboradores)
- [x] **PDF** com link do repositório (em `docs/relatorio.pdf` — edite o link após publicar)

---

## 1) App de Exemplo (Node.js + Express)
- Porta interna: `3000`
- Endpoint: `GET /` -> `"CI/CD up and running!"`

### Rodar localmente (sem Docker)
```bash
cd app
npm ci
npm test
npm start
# abre http://localhost:3000
```

### Rodar com Docker localmente
```bash
# na raiz do projeto
docker build -t ccdemo:local ./app
docker run -p 8080:3000 ccdemo:local
# abre http://localhost:8080
```

---

## 2) Pipeline de **CI** (GitHub Actions -> ECR)

### Criar repositório no ECR
1. Acesse AWS ECR e crie um repositório `TODO_ECR_REPOSITORY` (ex.: `ci-cd-demo`).
2. Anote **Region** (ex.: `us-east-1`) e **Account ID** (ex.: `123456789012`).

### Permissões (IAM)
- Usuário/Role com permissão mínima para ECR push/pull (`AmazonEC2ContainerRegistryPowerUser` ou política granular equivalente).

### Segredos no GitHub (Settings > Secrets and variables > Actions)
Crie _Repository secrets_:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION` (ex.: `us-east-1`)
- `ECR_REPOSITORY` (ex.: `ci-cd-demo`)

> O workflow resolve dinamicamente o **registry** via `aws-actions/amazon-ecr-login`.

### Disparo
- A cada `push`/`pull_request` para `main`, o Actions:
  1. Instala Node, roda testes (Jest).
  2. Faz login no ECR.
  3. **Build** da imagem Docker do app e **push** para o ECR com tag `latest` e `GITHUB_SHA`.

---

## 3) Pipeline de **CD** (Jenkins -> EC2 -> docker compose)
### Instalar Jenkins (Ubuntu 22.04 LTS em EC2)
```bash
# atualizar
sudo apt update && sudo apt -y upgrade

# Java (Temurin ou OpenJDK 17)
sudo apt -y install fontconfig openjdk-17-jre

# Jenkins repo + install
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee   /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc]   https://pkg.jenkins.io/debian-stable binary/ | sudo tee   /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt update
sudo apt -y install jenkins git docker.io docker-compose-plugin awscli

# Adicionar jenkins ao grupo docker
sudo usermod -aG docker jenkins
sudo systemctl enable --now docker jenkins
```

### Permissões AWS no EC2 (recomendado)
- Anexe uma **IAM Role** à instância EC2 com permissões de **pull no ECR** e **listar repositórios**.
- Alternativamente, configure **credenciais** do AWS CLI no host (`aws configure`) com usuário de permissão mínima.

### Job de Pipeline (Multibranch ou Pipeline from SCM)
1. Em Jenkins, **New Item** > **Pipeline**.
2. Marque **GitHub hook trigger for GITScm polling** (se tiver URL pública para webhook).
3. Em **Pipeline**, escolha **Pipeline script from SCM**, informe a **URL do repositório** e o branch `main`.
4. Salve e **Build Now**.

### Variáveis esperadas pelo Jenkinsfile
- `AWS_DEFAULT_REGION` (ex.: `us-east-1`)
- `ECR_REPOSITORY` (ex.: `ci-cd-demo`)
- `REGISTRY` (ex.: `123456789012.dkr.ecr.us-east-1.amazonaws.com`)
- `IMAGE_TAG` (default: `latest`)

> Configure-as em **Manage Jenkins > System > Global properties** (Environment variables) ou como **credenciais** e exporte via `withCredentials`/`environment`.

### Security Group (EC2)
- **Inbound**: TCP `80` (HTTP) liberado (ou `443` se usar TLS).
- **Outbound**: padrão liberado.
- Evite expor `22` à internet; prefira SSM ou lista de IPs.

### Deploy
O Jenkins fará:
1. Login no ECR.
2. `docker compose pull` da imagem mais recente.
3. `docker compose up -d` para atualizar o serviço.

---

## 4) **Self-hosted runner** do GitHub (opcional, para rodar CI dentro da VPC)
> Executa a mesma pipeline do Actions em uma VM/EC2.
```bash
# criar usuário de sistema
sudo useradd -m -d /opt/github-runner -s /bin/bash github-runner
sudo su - github-runner
cd /opt/github-runner

# Baixe o runner da página do repositório: Settings > Actions > Runners > New self-hosted runner
# Exemplo (x64 Linux - ajuste a URL/versão conforme a página):
curl -o actions-runner.tar.gz -L https://github.com/actions/runner/releases/download/v2.316.1/actions-runner-linux-x64-2.316.1.tar.gz
tar xzf actions-runner.tar.gz

# Configure usando o token que o GitHub exibe (expira rápido)
./config.sh --url https://github.com/TODO_ORG/TODO_REPO --token TODO_RUNNER_TOKEN

# Instale como serviço
sudo ./svc.sh install
sudo ./svc.sh start
exit
```

> No workflow (`.github/workflows/ci-cd.yml`), troque `runs-on: ubuntu-latest` por `runs-on: self-hosted` (ou use ambos via `strategy.matrix`).

---

## 5) Execução local do deploy (debug)
```bash
# exporte variáveis ou crie um arquivo .env baseado no .env.example
export REGISTRY=123456789012.dkr.ecr.us-east-1.amazonaws.com
export ECR_REPOSITORY=ci-cd-demo
export IMAGE_TAG=latest
export HOST_PORT=80
export CONTAINER_PORT=3000

docker compose pull
docker compose up -d
```

---

## 6) Participantes do Grupo
- **TODO**: Liste aqui nome completo, matrícula, e GitHub dos integrantes.
- Adicione todos como **colaboradores** do repositório (Settings > Collaborators).

---

## 7) Dificuldades encontradas (preenchidas como guia)
- Configuração de permissões no IAM (ECR push/pull).
- Acesso externo ao Jenkins (webhook do GitHub) vs. segurança de rede.
- Cache de dependências e otimização do build Docker.
- Compatibilidade do `docker compose` no host e permissões do usuário `jenkins`.

---

## 8) Links
- **Repositório**: `TODO_INSERIR_LINK_DO_REPO_AQUI`
- **PDF com relatório**: `docs/relatorio.pdf` (edite os `TODOs` e reexporte se necessário).

---

## 9) Como entregar
1. Publique este template no GitHub (privado ou público).
2. Ajuste segredos e variáveis.
3. Rode um **push** para disparar o Actions.
4. Garanta que o Jenkins faça o **deploy** com sucesso na EC2.
5. Atualize o PDF em `docs/` com o link do repositório e os nomes dos participantes, se necessário.
