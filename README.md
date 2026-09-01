# Relinq — Quiz + TSL

Repositório com **dois projetos** independentes:

| Pasta       | O que é                        | Stack                     | Porta |
| ----------- | ------------------------------ | ------------------------- | ----- |
| `frontend/` | Painel admin + quiz + página de vendas | Next.js 16 (App Router), React 19, Tailwind 4 | 3000  |
| `backend/`  | API REST de funis, leads e respostas   | Express 5, MySQL (mysql2) | 3001  |

## Como rodar

### Backend

```bash
cd backend
npm install
npm run dev            # tsx watch src/server.ts  → http://localhost:3001
```

- Variáveis de ambiente: `backend/.env` (`PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`).
- Banco: importe `backend/database/schema.sql` no MySQL antes do primeiro uso
  (cria o banco `funil_db` e todas as tabelas).

### Frontend

```bash
cd frontend
npm install
npm run dev            # http://localhost:3000
```

- Aponta para a API em `http://localhost:3001/api` por padrão
  (`NEXT_PUBLIC_API_URL` sobrescreve — ver `frontend/src/services/api.ts`).

## Estrutura

### `frontend/src/`

```
app/                      Rotas (Next.js App Router — cada pasta é uma rota, com um page.tsx)
components/tsl/            Componentes da página de vendas (Countdown, Reveal)
services/api.ts           Cliente axios da API
types/funil.ts            Tipos compartilhados (Funil, Pergunta, PaginaVendas, ...)
```

No App Router **cada rota tem exatamente um `page.tsx`** — o que identifica a
página é o **caminho da pasta**, não o nome do arquivo:

| Arquivo                          | Rota                       | O que é                              |
| -------------------------------- | -------------------------- | ------------------------------------ |
| `app/page.tsx`                   | `/`                        | Home (ainda é o template do Next.js) |
| `app/admin/page.tsx`             | `/admin`                   | Painel: lista de funis               |
| `app/admin/novo/page.tsx`        | `/admin/novo`              | Formulário de criação de funil       |
| `app/admin/leads/page.tsx`       | `/admin/leads?funilId=`    | Leads capturados de um funil         |
| `app/f/[slug]/page.tsx`          | `/f/:slug`                 | Quiz (fluxo do visitante)            |
| `app/f/[slug]/tsl/page.tsx`      | `/f/:slug/tsl`             | Página de vendas (TSL)               |

### `backend/src/`

```
server.ts                       Entrada: sobe o Express, monta /api, testa o banco
config/db.ts                    Pool de conexões MySQL + testarConexao()
routes/funilRoutes.ts           Todas as rotas sob /api
controllers/funilController.ts  Handlers (criar/listar/obter/atualizar/deletar funil,
                                salvar respostas do quiz, listar leads)
database/schema.sql             Schema do banco (rodar manualmente no MySQL)
```

Rotas da API (prefixo `/api`):

| Método | Rota                     | Handler              |
| ------ | ------------------------ | -------------------- |
| POST   | `/funis`                 | `criarFunil`         |
| GET    | `/funis`                 | `listarFunis`        |
| GET    | `/funis/:slug`           | `obterFunilPorSlug`  |
| PUT    | `/funis/:id`             | `atualizarFunil`     |
| DELETE | `/funis/:id`             | `deletarFunil`       |
| POST   | `/funis/:slug/responder` | `salvarRespostaQuiz` |
| GET    | `/funis/:id/leads`       | `listarLeadsDoFunil` |
