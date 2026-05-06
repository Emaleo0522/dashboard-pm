import 'server-only'
import { getLinearClient } from './linear-client'
import type { LinearIssue } from '@/types/linear'

export async function getTeamIssues(teamId: string): Promise<LinearIssue[]> {
  const client = getLinearClient()
  const team = await client.team(teamId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const issuesConnection = await team.issues({
    first: 50,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    orderBy: 'updatedAt' as any,
    filter: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      state: { type: { nin: ['completed', 'cancelled'] } } as any,
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return issuesConnection.nodes.map((issue: any) => ({
    id: issue.id,
    identifier: issue.identifier,
    title: issue.title,
    description: issue.description,
    priority: issue.priority,
    state: {
      id: issue.state?.id || '',
      name: issue.state?.name || '',
      color: issue.state?.color || '#71717a',
      type: issue.state?.type || 'unstarted',
    },
    cycle: issue.cycle
      ? { id: issue.cycle.id, name: issue.cycle.name, number: issue.cycle.number }
      : undefined,
    assignee: issue.assignee
      ? { id: issue.assignee.id, name: issue.assignee.name, avatarUrl: issue.assignee.avatarUrl }
      : undefined,
    createdAt: issue.createdAt,
    updatedAt: issue.updatedAt,
    url: issue.url,
  }))
}
