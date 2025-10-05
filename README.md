# 📱 Resumo do App Congregacional

Um **webapp PWA** para **gestão congregacional**, centralizando programações, designações e atividades semanais.
O objetivo é facilitar a organização e acesso às informações de reuniões, territórios, pregação, discursos e escalas.

---

## 🎯 Features principais

### 👥 Pessoas

- Cadastro de **publicadores** (pessoas da congregação).
- Cadastro de **oradores** visitantes.
- Gestão de **responsáveis e permissões** (editar ou visualizar áreas específicas).

### 🗣️ Discursos

- Agenda de discursos com **tema, orador, data e congregação**.
- Registro de **hospitalidade** (quem oferece lanche).
- Informação se o orador tem **imagem disponível**.
- Definição de **cântico inicial** do discurso.

### 🛠️ Mecânicas

- Escala de **indicador, leitor, som e palco** (2x por semana).
- Registro vinculado a datas específicas.

### 🧹 Limpeza

- Criação de **grupos de limpeza**.
- Cada grupo pode ter **superintendente** ou, se não houver, um **servo substituto**.
- Associação de **vários publicadores** a um grupo.

### 🚪 Pregação & Carrinho

- Gestão de **locais de carrinho** com horários definidos.
- Registro de **territórios** com status: “incompleto” ou “finalizado”.
- Registro de **quando o território foi concluído**.
- Possibilidade de anexar **coordenadas (Google Maps)** ou **imagem** do território.

### 📖 Nossa Vida Cristã (NVC)

- Programação semanal e bimestral do **NVC**.
- Registro de **cânticos de abertura e encerramento**.
- Criação de **partes da reunião** (tema, designado, duração, ordem).
- Flexível para refletir as partes oficiais (ex: Estudo bíblico de congregação, Necessidades locais).

### 🔐 Permissões

- Cada módulo (Limpeza, Mecânica, Discursos, Pregação, Carrinho, NVC) tem **permissões específicas de edição ou visualização**.
- **Responsáveis múltiplos por congregação**, com acesso administrativo.

---

## ⚙️ Stack Tecnológica

- **Frontend**:

  - **Next.js** (com suporte PWA)
  - **TailwindCSS** (estilização)
  - **Lucide React** (ícones)
  - **Framer Motion** (animações)
  - **ShadCN/UI** (componentes, tabelas, sonnet para inputs mais ricos)

- **Backend / Database**:

  - **Supabase (Postgres + Auth)**
  - **RLS (Row Level Security)** para permissões
  - **Storage Supabase** para imagens (territórios, oradores)

- **Infra**:

  - Deploy no **Vercel**
  - Integração com Supabase via API

---

👉 Em resumo:
Seu app é um **gerenciador congregacional completo**, cobrindo discursos, pregação, carrinho, limpeza, mecânicas e a reunião **Nossa Vida Cristã**, tudo com **permissões granulares** e **multi-congregação**.
