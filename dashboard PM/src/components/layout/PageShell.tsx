interface PageShellProps {
  title: string
  description?: string
  actions?: React.ReactNode
  children: React.ReactNode
}

export function PageShell({ title, description, actions, children }: PageShellProps) {
  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center justify-between px-8 py-5 border-b border-border bg-surface/80 sticky top-0 z-10 backdrop-blur-sm">
        <div>
          <h1 className="text-base font-semibold text-text-primary">{title}</h1>
          {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </header>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
