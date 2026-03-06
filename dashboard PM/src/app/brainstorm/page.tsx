import { PageShell } from '@/components/layout/PageShell'
import { StickyBoard } from '@/components/brainstorm/StickyBoard'

export default function BrainstormPage() {
  return (
    <PageShell
      title="Brainstorm"
      description="Canvas libre para ideas y conexiones"
    >
      <div className="px-8 py-6 h-[calc(100vh-73px)] flex flex-col">
        <StickyBoard />
      </div>
    </PageShell>
  )
}
