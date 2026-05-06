# Contexto del proyecto — PM & CPO Strategy Dashboard

> Archivo generado para retomar el proyecto desde cualquier máquina.
> Última actualización: 2026-03-06

---

## URLs

- **Producción**: https://dashboard-pm-silk.vercel.app
- **Repositorio**: https://github.com/Emaleo0522/dashboard-pm

---

## Setup local

```bash
git clone https://github.com/Emaleo0522/dashboard-pm
cd dashboard-pm
npm install
```

Crear `.env.local` en la raíz:
```
LINEAR_API_KEY=<tu-member-api-key-de-linear>
LINEAR_TEAM_ID=977d7ddf-3c15-4e26-93a0-c0ef6c05c76c
```

```bash
npm run dev
# → http://localhost:3000
```

---

## Stack

| Tecnología | Versión | Rol |
|---|---|---|
| Next.js | 14.2.18 | Framework, App Router |
| TypeScript | 5.x | Tipado estricto |
| Tailwind CSS | 3.4.x | Estilos + design tokens dark mode |
| Zustand | 4.5.5 | State local + persist localStorage |
| @dnd-kit | 6/8.x | Drag & drop (Kanban + Brainstorm) |
| @tanstack/react-query | 5.x | Cache datos Linear API |
| @linear/sdk | 22.x | Integración Linear (server-only) |
| framer-motion | 11.x | Animaciones |
| lucide-react | 0.460.0 | Iconografía |

---

## Estructura del proyecto

```
src/
├── app/
│   ├── layout.tsx              # RootLayout con Sidebar + Providers
│   ├── page.tsx                # permanentRedirect → /inbox
│   ├── inbox/page.tsx
│   ├── brainstorm/page.tsx
│   ├── backlog/page.tsx
│   ├── linear-sync/page.tsx
│   ├── history/page.tsx
│   ├── settings/page.tsx
│   └── api/
│       ├── linear/issues/route.ts       # GET issues (real o mock)
│       └── linear/create-issue/route.ts # POST crear issue
├── components/
│   ├── layout/    # Sidebar, SidebarItem, PageShell
│   ├── inbox/     # EntryInput, VoiceButton, EntryCard, EntryList
│   ├── brainstorm/ # StickyBoard, StickyNote, TagFilter
│   ├── backlog/   # KanbanBoard, KanbanColumn, KanbanCard
│   ├── linear-sync/ # IssueTable, IssueRow, CreateIssueModal, SyncStatus
│   ├── history/   # SemanticSearch, MeetingList, MeetingCard
│   ├── settings/  # LinearConfig, UserPreferences
│   └── ui/        # Badge, Button, Card, Input, Textarea, Modal
├── store/         # Zustand stores con persist (inbox, brainstorm, backlog, settings)
├── lib/           # linear-client.ts (server-only), linear-queries.ts, utils.ts
├── hooks/         # useLinearIssues.ts, useCreateIssue.ts
├── types/         # inbox.ts, brainstorm.ts, backlog.ts, linear.ts, history.ts
└── data/          # mock.ts — datos de ejemplo para todas las vistas
```

---

## Linear

- **Workspace**: Dashboard Manolo
- **Team ID**: `977d7ddf-3c15-4e26-93a0-c0ef6c05c76c`
- **Auth**: Member API Key (Account Settings → API → Member API keys)
- **Arquitectura**: LinearClient corre exclusivamente en server (Route Handlers). Nunca en cliente.
- Sin API key → fallback automático a mock data

---

## Vercel

- **Proyecto**: `dashboard-pm`
- **Team**: `emaleo0522-gmailcoms-projects`
- **Variables configuradas en producción**: `LINEAR_API_KEY`, `LINEAR_TEAM_ID`
- Para redeploy: `vercel --prod --yes` desde la carpeta del proyecto

---

## Bugs conocidos y soluciones

| Bug | Solución |
|---|---|
| CSS no se sirve (layout.css → 404) | Matar todos los procesos next dev, `rm -rf .next`, reiniciar uno solo |
| Puerto 3000 ocupado | `fuser -k 3000/tcp` |
| Webpack error en ruta `/` | `favicon.ico` debe estar en `public/`, no en `src/app/` |
| `LayoutKanban` no existe | Usar `Kanban` de lucide-react 0.460.0 |
| `Array.from(new Set(...))` | No usar spread de Set — incompatible con el target TS del proyecto |

---

## Próximos pasos sugeridos

- [ ] Actualizar Next.js (hay vulnerabilidad conocida en 14.2.18)
- [ ] Agregar más reuniones al Historial (solo hay 1 mock)
- [ ] Implementar IA real para clasificar entradas del Inbox
- [ ] Conectar Oracle Cloud para backend/base de datos persistente
