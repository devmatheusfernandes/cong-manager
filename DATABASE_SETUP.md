# Configuração do Banco de Dados Supabase

## Problema Atual

O erro que você está vendo indica que as tabelas necessárias não existem no seu banco de dados Supabase:

```
Could not find the table 'public.grupos' in the schema cache
```

Este erro ocorre porque:
1. As tabelas não foram criadas no banco de dados Supabase
2. As variáveis de ambiente podem não estar configuradas corretamente
3. O projeto Supabase pode não estar ativo ou acessível

## Solução Rápida

**Para resolver imediatamente:**

1. **Crie o arquivo `.env.local`:**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure as variáveis do Supabase no `.env.local`:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
   ```

3. **Execute o script `supabase-schema.sql` no SQL Editor do Supabase**
   - O script foi adaptado para seu schema existente
   - Criará apenas as tabelas faltantes: `congregacoes`, `grupos`, `grupo_publicadores`

4. **Reinicie o servidor:**
   ```bash
   npm run dev
   ```

## Solução Detalhada

Para resolver este problema, você precisa executar o script SQL no seu projeto Supabase para criar todas as tabelas necessárias.

### Passos para Configurar o Banco de Dados:

1. **Acesse o Supabase Dashboard**
   - Vá para [supabase.com](https://supabase.com)
   - Faça login na sua conta
   - Selecione o projeto que você está usando

2. **Abra o SQL Editor**
   - No painel lateral esquerdo, clique em "SQL Editor"
   - Clique em "New query" para criar uma nova consulta

3. **Execute o Script de Schema**
   - Copie todo o conteúdo do arquivo `supabase-schema.sql`
   - Cole no editor SQL
   - Clique em "Run" para executar o script

4. **Verifique as Tabelas Criadas**
   - Vá para "Table Editor" no painel lateral
   - Você deve ver todas as tabelas criadas:
     - `users`
     - `user_permissions`
     - `congregacoes`
     - `publicadores`
     - `grupos`
     - `grupo_publicadores`
     - `discursos`
     - `oradores`
     - `escala_limpeza`

### Configuração das Variáveis de Ambiente

Certifique-se de que você tem as seguintes variáveis de ambiente configuradas no seu arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### Dados de Teste

O script já inclui alguns dados de teste:
- Uma congregação padrão: "Congregação Central"
- Um usuário admin padrão: username "admin", password "admin123"

### Verificação

Após executar o script, reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

O erro da tabela 'grupos' não encontrada deve ser resolvido.

## Estrutura das Tabelas

### Principais Entidades:

- **users**: Usuários do sistema com roles e permissões
- **congregacoes**: Congregações/unidades organizacionais
- **publicadores**: Membros da congregação
- **grupos**: Grupos de campo/serviço
- **discursos**: Programação de discursos
- **escala_limpeza**: Escalas de limpeza

### Relacionamentos:

- Publicadores pertencem a congregações
- Grupos pertencem a congregações e têm superintendente/servo
- Grupo_publicadores é a tabela de relacionamento N:N entre grupos e publicadores
- Discursos são agendados para publicadores específicos

## Troubleshooting

Se ainda houver problemas:

1. Verifique se as variáveis de ambiente estão corretas
2. Confirme que o projeto Supabase está ativo
3. Verifique se há erros no console do Supabase
4. Certifique-se de que as políticas RLS (Row Level Security) estão configuradas se necessário