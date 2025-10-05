Gerar telas seguindo o design system baseado em ShadCN, Tailwind, Lucide e Framer Motion, obedecendo as seguintes regras de layout, tipografia, cores, componentes, interações e navegação:

Layout
Layout responsivo, mobile-first (PWA).
Uso de grid-based layouts (máx. 12 colunas).
Padding mínimo: p-2, com espaçamento consistente entre seções (gap-4 padrão).
Cards arredondados (rounded-2xl) NÃO USAR SOMBRA NUNCA. Para destacar use bordas (border-1 e slate para dark e light mode).

Tipografia
Fonte padrão: system-ui (sans-serif).

Tamanhos:
Título principal: text-2xl font-bold
Subtítulos: text-xl font-semibold
Texto normal: text-base
Observações: text-sm text-muted-foreground

Cores
Basear na paleta shadcn/ui (light/dark mode).
A cor primária define os botões principais (ex: indigo-600).

Cores de status:
Verde → finalizado/completo. > teal-500
Amarelo → em andamento. > amber-600
Vermelho → atenção/pendente. > rose-600

Componentes
ShadCN como base de todos os componentes:
Table para listagens.
Card para blocos de informação.
Dialog para formulários/modal.
Button sempre com variantes (primary, secondary, destructive).
Sonner (as the Toast) para feedback visual.

Ícones: Lucide React, sempre acompanhando ações (ex: lápis para editar, olho para visualizar).
Interações
Transições suaves com Framer Motion (fade/slide nos modais, hover nos cards).
Feedback visual sempre que houver ação:
Loading → spinner.
Sucesso → toast verde.
Erro → toast vermelho.

Navegação
Bottom Tabs para: Nomes/Datas, Discursos, Mecânicas, Limpeza, NVC, Carrinho, Grupos, Pregação.
Cada tab deve ter ícone + rótulo.
Header fixo com nome da congregação selecionada.

Formulários
Inputs com borda arredondada e ícones (quando fizer sentido).
Validação inline (mensagem de erro em text-red-500 text-sm).
Botões de submit sempre destacados em cor primária.
