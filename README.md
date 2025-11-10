## Pontos de melhorias
- Melhorar a segurança dos Webhooks no N8N com chaves de API. E o mesmo para as rotas no Next.js.
- Permiter que o usuário envie mais de uma mensagem por vez no Chat do Site. 
- Quando criado uma task via WhatsApp ou Chat no Site, atualizar a lista de TO-DO sem precisar de reload na tela.

# To-Do List - Desafio

Aplicação de lista de tarefas desenvolvida com Next.js 15, TypeScript, TailwindCSS e Supabase.

## 🚀 Tecnologias

- **Next.js 15** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Supabase**

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase
- Credenciais do projeto Supabase

## 🛠️ Instalação

1. Clone o repositório (ou navegue até a pasta do projeto)

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
   - Copie o arquivo `.env.local.example` para `.env.local`
   - Preencha com suas credenciais do Supabase:
     - `NEXT_PUBLIC_SUPABASE_URL`: URL do seu projeto Supabase
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima do Supabase

4. Configure o banco de dados no Supabase:
   - Execute o script `supabase-schema.sql` para criar a tabela `users`
   - Execute o script `supabase-tasks-schema.sql` para criar a tabela `tasks`
   - Ou crie manualmente:
     - Tabela `users`: `id` (uuid, PK), `name` (text), `email` (text), `created_at` (timestamp)
     - Tabela `tasks`: `id` (uuid, PK), `user_email` (text), `title` (text), `description` (text), `is_done` (boolean), `created_at` (timestamp)

5. Execute o projeto em desenvolvimento:
```bash
npm run dev
```

6. Acesse [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
/app
 ├─ /dashboard/page.tsx    # Página do dashboard
 ├─ page.tsx               # Página inicial (login)
 ├─ layout.tsx            # Layout principal
 └─ globals.css           # Estilos globais

/components
 ├─ LoginForm.tsx         # Formulário de login
 ├─ Button.tsx            # Componente de botão
 ├─ Input.tsx             # Componente de input
 ├─ TaskList.tsx          # Lista de tarefas
 ├─ TaskItem.tsx         # Item individual de tarefa
 └─ AddTaskForm.tsx       # Formulário para adicionar tarefa

/lib
 └─ supabaseClient.ts     # Cliente do Supabase

/utils
 └─ localStorage.ts       # Utilitários do localStorage
```

## 🎨 Design

- **Cor primária:** `#CA3040` (vermelho)
- **Cor secundária:** `#FFFFFF` (branco)
- **Fonte:** Inter

## 🔐 Funcionalidades

### Versão Inicial

- ✅ Login com nome e email (sem senha)
- ✅ Armazenamento de usuários no Supabase
- ✅ Sessão no localStorage
- ✅ Proteção de rotas
- ✅ Dashboard com sistema de tarefas

### Sistema de Tarefas

- ✅ Listar tarefas do usuário logado
- ✅ Adicionar novas tarefas (título e descrição opcional)
- ✅ Marcar tarefas como concluídas/não concluídas
- ✅ Interface responsiva com cards
- ✅ Atualização dinâmica da lista

## 📝 Próximos Passos

Este projeto pode ser expandido com:
- Edição de tarefas
- Exclusão de tarefas
- Filtros (todas, pendentes, concluídas)
- Ordenação por data/prioridade
- Categorias/tags
- Busca de tarefas

## 🚢 Deploy

O projeto está configurado para deploy na Vercel:

1. Faça push do código para um repositório Git
2. Conecte o repositório na Vercel
3. Configure as variáveis de ambiente na Vercel
4. Faça o deploy!

