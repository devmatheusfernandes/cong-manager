# Configuração do Supabase

## Passo 1: Criar as tabelas no Supabase

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Vá para o seu projeto: https://dejakepiczmmjpckseal.supabase.co
3. No menu lateral, clique em "SQL Editor"
4. Copie e cole o conteúdo do arquivo `supabase-setup.sql` no editor
5. Execute o SQL clicando em "Run"

## Passo 2: Verificar se as tabelas foram criadas

Após executar o SQL, você deve ver:
- Tabela `users` com 7 usuários
- Tabela `user_permissions` com as permissões de cada usuário

## Passo 3: Testar a aplicação

Depois de criar as tabelas, você pode testar a aplicação:

```bash
npm run dev
```

## Usuários disponíveis

Após a migração, os seguintes usuários estarão disponíveis:

- **admin** - Acesso total ao sistema
- **carrinho** - Gestão de carrinho e visualização de grupos/pregação
- **nvc** - Nossa Vida Cristã e visualização de publicadores
- **pregacao** - Pregação, grupos e visualização de publicadores
- **mecanicas** - Mecânicas e visualização de publicadores
- **oradores** - Discursos e visualização de publicadores
- **limpeza** - Limpeza, grupos e visualização de publicadores

## Estrutura das tabelas

### Tabela `users`
- `id` (TEXT, PRIMARY KEY) - Identificador único do usuário
- `username` (TEXT) - Nome de exibição do usuário
- `password` (TEXT) - Senha para autenticação
- `role` (TEXT) - Função do usuário
- `created_at` (TIMESTAMP) - Data de criação
- `updated_at` (TIMESTAMP) - Data de última atualização

### Tabela `user_permissions`
- `id` (UUID, PRIMARY KEY) - Identificador único da permissão
- `user_id` (TEXT, FOREIGN KEY) - Referência ao usuário
- `permission` (TEXT) - Nome da permissão
- `created_at` (TIMESTAMP) - Data de criação

## Troubleshooting

Se você encontrar erros relacionados às tabelas não existirem:

1. Verifique se o SQL foi executado corretamente no painel do Supabase
2. Confirme se as variáveis de ambiente estão corretas no arquivo `.env.local`
3. Verifique se as tabelas aparecem na seção "Table Editor" do Supabase