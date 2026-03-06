import { PageShell } from '@/components/layout/PageShell'
import { IssueTable } from '@/components/linear-sync/IssueTable'

export default function LinearSyncPage() {
  return (
    <PageShell
      title="Linear Sync"
      description="Issues conectados a tu workspace de Linear"
    >
      <div className="px-8 py-6">
        <IssueTable />
      </div>
    </PageShell>
  )
}
