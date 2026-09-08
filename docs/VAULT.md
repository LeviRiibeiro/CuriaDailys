# Curia Dailys — Vault do projeto

Este documento é a memória operacional do Curia Dailys: produto, decisões técnicas e caminhos de manutenção.

## Propósito

Curia Dailys é uma agenda web mobile-first para transformar cuidados e compromissos pequenos em uma rotina mais acolhedora. A pessoa pode registrar atividades recorrentes ou pontuais e marcá-las como concluídas a cada dia.

## Experiência atual

- A interface ocupa a tela como um aplicativo web nativo: conteúdo com rolagem vertical e barra de navegação fixa inferior, respeitando áreas seguras de celulares.
- **Início** mostra as atividades do dia e permite filtrar por todas, rotina ou pontuais.
- **Agenda** permite escolher a data e ver ou planejar aquele dia.
- **Rotina** mostra apenas atividades recorrentes e o progresso diário.
- **Você** mostra o nome da pessoa, números do dia e saída da conta.
- O botão central abre o formulário para criar uma atividade. Atividades pontuais recebem uma data; rotinas são diárias.

## Tecnologia e código

- Interface: React + TypeScript + Tailwind CSS.
- Build de produção: Vite, configurado para a Vercel em `vite.vercel.config.ts` e `vercel.json`.
- A base legada do Sites/Vinext é preservada para compatibilidade, mas a publicação pública principal é feita pela Vercel.
- Entrada da aplicação Vercel: `index.html` → `src/main.tsx` → `app/page.tsx`.
- Cliente Supabase: `lib/supabase.ts`.

## Autenticação e dados

- Autenticação é por e-mail e senha via Supabase Auth.
- No cadastro, o campo “Como podemos te chamar?” é salvo em `user_metadata.display_name` somente para exibição. Não é usado para autorização.
- Tabela `activities`: atividade, tipo (`routine`/`one_time`), horário, data opcional, categoria e dono.
- Tabela `activity_completions`: conclusão de uma atividade em uma data específica.
- Migração do banco: `supabase/migrations/20260908152820_curias_dailys_schema.sql`.
- As tabelas possuem RLS: cada pessoa acessa apenas os próprios registros.

## Publicação

- Repositório: `https://github.com/LeviRiibeiro/CuriaDailys.git`.
- Vercel: projeto pessoal `LK23/curiasdailys`, ligado ao repositório GitHub.
- Produção: `https://curiasdailys.vercel.app/`.
- O push para `main` aciona o deploy automaticamente.
- Variáveis exigidas na Vercel (Production, Preview e Development):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Não versionar valores de variáveis de ambiente nem chaves privadas.

## Checklist de manutenção

1. Fazer a alteração em `curia-dailys`.
2. Executar `npx vite build --config vite.vercel.config.ts` com as variáveis públicas do Supabase disponíveis no ambiente.
3. Conferir `git diff --check`.
4. Criar commit e fazer `git push` para `main`.
5. Confirmar que a nova implantação da Vercel ficou pronta e validar a tela publicada.

## Próximas evoluções sugeridas

- Edição, arquivamento e exclusão de atividades.
- Frequências mais detalhadas (dias da semana, semanal e mensal).
- Preferências de lembretes e notificações web, após consentimento explícito.
- Edição do nome no perfil e histórico de conclusões.
