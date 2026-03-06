import { PageShell } from '@/components/layout/PageShell'
import { EntryInput } from '@/components/inbox/EntryInput'
import { EntryList } from '@/components/inbox/EntryList'

export default function InboxPage() {
  return (
    <PageShell
      title="Inbox"
      description="Capturá ideas, observaciones y acciones en tiempo real"
    >
      <div className="px-8 py-6 max-w-3xl space-y-6">
        <EntryInput />
        <EntryList />
      </div>
    </PageShell>
  )
}
