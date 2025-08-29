# Relatório – Pipeline CI/CD (Cloud Computing)

**Projeto**: Pipeline CI/CD com Jenkins e GitHub Actions na AWS  
**Repositório**: TODO_INSERIR_LINK_DO_REPO_AQUI  
**Participantes**: TODO_LISTAR_NOMES_MATRÍCULAS_GITHUB

---

## 1. Descrição do Projeto
Implementamos um pipeline completo que:
- **CI (GitHub Actions)**: build/test do app Node.js e **push** da imagem Docker para o **Amazon ECR**.
- **CD (Jenkins em EC2)**: **pull** da imagem do ECR e **deploy** via `docker compose`.

### Artefatos executados
- Imagem Docker publicada no ECR (`latest` e `SHA`).
- Relatório de testes do Node test runner (saída no job do Actions).
- Container rodando em EC2 com `docker compose`.

---

## 2. Passo a passo – GitHub Actions (Runner) e Jenkins
### 2.1. GitHub Actions (CI)
1. Criar repositório no **ECR**.
2. Configurar **secrets** no GitHub: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `ECR_REPOSITORY`.
3. Ao fazer **push** no `main`, o workflow `.github/workflows/ci-cd.yml` executa testes, faz login no ECR, buida a imagem e faz **push**.

> **Runner self-hosted (opcional)**: instalar binário do runner em uma VM/EC2 e trocar `runs-on: ubuntu-latest` por `self-hosted` no workflow.

### 2.2. Jenkins (CD)
1. Subir **EC2 Ubuntu** e instalar `jenkins`, `docker`, `docker-compose-plugin`, `awscli`.
2. Anexar **IAM Role** à EC2 com permissões de **pull** no ECR (ou configurar `aws configure`).
3. Criar um job de **Pipeline from SCM** apontando para o repositório.
4. Ajustar variáveis no Jenkins (Region, Registry, Repo).
5. Executar build: Jenkins fará login no ECR e dará `docker compose up -d`.

---

## 3. Dificuldades encontradas (e soluções)
- **Permissões IAM**: usar políticas mínimas para ECR (push/pull).  
- **Acesso Jenkins**: webhook requer URL pública; alternativa é **polling**.  
- **Permissões Docker**: adicionar usuário `jenkins` ao grupo `docker`.  
- **Security Group**: liberar porta `80` (ou `443`) para acesso ao app.

---

## 4. Como executar (resumo)
- **Local**: `docker build` e `docker run -p 8080:3000` (ou `docker compose up -d` com `.env`).  
- **CI**: ao fazer push, o GitHub Actions publica a imagem no ECR.  
- **CD**: Jenkins puxa e sobe a versão na EC2.

---

## 5. Conclusão
O pipeline demonstra integração entre **GitHub Actions** e **Jenkins**, contemplando build/teste, empacotamento Docker, publicação no **ECR** e **deploy** automatizado em **EC2**.
