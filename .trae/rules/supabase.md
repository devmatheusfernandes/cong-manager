# 📘 Descrição do Banco de Dados (Supabase)

## 🔑 Autenticação & Permissões

- **usuarios**
  Armazena os dados básicos de cada usuário do app. Ligado ao `auth.users` do Supabase.

  - `id` (uuid) → referência ao usuário autenticado.
  - `nome`, `email` → informações pessoais.

- **congregacoes**
  Representa uma congregação local.

  - `id` (uuid), `nome`, `cidade`.

- **usuarios_congregacoes**
  Liga usuários às congregações (suporte multi-congregação).

  - `usuario_id`, `congregacao_id`.
  - `eh_responsavel` (boolean) → indica se o usuário é responsável (admin local).

- **permissoes**
  Define permissões de edição/visualização por módulo.

  - `perm_limpeza`, `perm_mecanica`, `perm_discurso`, `perm_pregacao`, `perm_carrinho`, `perm_nossa_vida_crista`.
  - Cada flag é booleana e específica por congregação.

---

## 👥 Pessoas

- **publicadores**
  Pessoas da congregação que podem receber designações.

  - `id`, `congregacao_id`, `nome`, `telefone`, `email`.

- **oradores**
  Oradores de discursos (podem ser da própria congregação ou visitantes).

  - `id`, `nome`, `congregacao_origem`.

---

## 🗣️ Discursos

- **discursos**
  Registra cada discurso agendado.

  - `id`, `orador_id`, `congregacao_id`.
  - `tema`, `data`, `cantico`.
  - `hospitalidade_id` (quem oferece lanche).
  - `tem_imagem` (se o orador possui imagem).

---

## 🛠️ Mecânicas

- **mecanicas**
  Escala de funções técnicas da reunião (2x por semana).

  - `id`, `congregacao_id`, `data`.
  - `indicador_id`, `leitor_id`, `som_id`, `palco_id`.

---

## 🧹 Limpeza

- **grupos**
  Grupos de limpeza da congregação.

  - `id`, `congregacao_id`, `nome`.
  - `superintendente_id`, `servo_id` (usado se não houver superintendente).

- **grupo_publicadores**
  Lista de publicadores em um grupo de limpeza.

  - `id`, `grupo_id`.
  - `publicador_ids` (array de uuids → membros do grupo).

---

## 🚪 Carrinho & Pregação

- **locais_carrinho**
  Locais fixos aprovados para pregação com carrinho.

  - `id`, `congregacao_id`, `nome`, `endereco`.

- **carrinho_horarios**
  Dias e horários de carrinho para cada local.

  - `id`, `local_id`.
  - `dia_semana` (0–6, domingo a sábado).
  - `hora_inicio`, `hora_fim`.

- **territorios**
  Territórios de pregação.

  - `id`, `congregacao_id`, `nome`.
  - `finalizado` (boolean), `data_finalizacao`.
  - `coordenada` (ponto no mapa), `imagem_url` (foto ou mapa).

---

## 📖 Nossa Vida Cristã (NVC)

- **nossa_vida_crista**
  Programação semanal da reunião NVC.

  - `id`, `congregacao_id`, `semana`.
  - `cantico_abertura`, `cantico_encerramento`.
  - `tema_geral`.

- **nvc_partes**
  Partes específicas da reunião semanal.

  - `id`, `nvc_id`, `ordem`.
  - `nome_parte`, `tema_parte`.
  - `publicador_id` (designado).
  - `duracao_minutos`, `observacoes`.

---

📌 **Resumo**:
O banco está organizado em módulos independentes (Discursos, Mecânicas, Limpeza, Carrinho/Pregação, NVC).
Cada módulo é vinculado a uma **congregação** e controlado por **permissões específicas**.
O Supabase gerencia autenticação (via `auth.users`) e as relações entre usuários e congregações.

---
