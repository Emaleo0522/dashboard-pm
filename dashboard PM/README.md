# PM & CPO Strategy Dashboard

Dashboard personal para Product Managers y CPOs. Integración con Linear para gestión de issues, Kanban drag & drop, Inbox de ideas, Brainstorm con sticky notes e Historial de reuniones.

## Demo

Produccion: https://dashboard-pm-silk.vercel.app

## Vistas

| Vista | Funcion |
|-------|---------|
| Inbox | Captura rapida de ideas con clasificacion semantica |
| Brainstorm | Board de sticky notes con tags y filtros |
| Backlog | Kanban board con drag and drop (dnd-kit) |
| Linear Sync | Issues de Linear en tiempo real + crear issues |
| Historial | Registro de reuniones con busqueda semantica |
| Calendar | Vista de calendario |
| Settings | Configuracion Linear API y preferencias |

## Stack

| Capa | Tech |
|------|------|
| Framework | Next.js 14 + React 18 + TypeScript |
| Estilos | Tailwind CSS dark mode |
| Estado | Zustand 5 persist localStorage |
| Data fetching | TanStack Query 5 |
| Drag and drop | dnd-kit/core + sortable |
| Animaciones | Framer Motion 11 |
| Integracion | Linear SDK 22 server-only |
| Deploy | Vercel |

## Instalacion

```bash
cd "dashboard PM"
npm install
```

Crear .env.local:

```env
LINEAR_API_KEY=tu_member_api_key
LINEAR_TEAM_ID=977d7ddf-3c15-4e26-93a0-c0ef6c05c76c
```

Sin API key arranca con mock data automaticamente.

```bash
npm run dev
```

## Arquitectura Linear

LinearClient corre exclusivamente en Route Handlers (server-only). El cliente nunca accede directamente a la API de Linear.
