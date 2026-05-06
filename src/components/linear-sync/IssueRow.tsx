import { Badge } from '@/components/ui/Badge'
import type { LinearIssue, IssuePriority } from '@/types/linear'
import { ExternalLink } from 'lucide-react'

const stateColors: Record<string, string> = {
  backlog: 'text-text-muted',
  unstarted: 'text-blue-400',
  started: 'text-orange-400',
  completed: 'text-green-400',
  cancelled: 'text-text-muted line-through',
}

export function IssueRow({ issue }: { issue: LinearIssue }) {
  return (
    <tr className="border-b border-border hover:bg-surface-raised/50 transition-colors group">
      <td className="px-4 py-3">
        <span className="font-mono text-xs text-accent">{issue.identifier}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-sm text-text-primary">{issue.title}</span>
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs font-medium ${stateColors[issue.state.type] || 'text-text-secondary'}`}>
          {issue.state.name}
        </span>
      </td>
      <td className="px-4 py-3">
        <Badge variant="priority" priority={issue.priority as IssuePriority} />
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-text-muted">{issue.cycle?.name || '—'}</span>
      </td>
      <td className="px-4 py-3">
        <a
          href={issue.url}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-accent transition-all"
        >
          <ExternalLink size={13} />
        </a>
      </td>
    </tr>
  )
}
