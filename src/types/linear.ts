export type IssuePriority = 0 | 1 | 2 | 3 | 4 // 0=No priority, 1=Urgent, 2=High, 3=Medium, 4=Low

export interface LinearIssue {
  id: string
  identifier: string // e.g. "PM-42"
  title: string
  description?: string
  priority: IssuePriority
  state: {
    id: string
    name: string
    color: string
    type: 'backlog' | 'unstarted' | 'started' | 'completed' | 'cancelled'
  }
  cycle?: {
    id: string
    name: string
    number: number
  }
  assignee?: {
    id: string
    name: string
    avatarUrl?: string
  }
  createdAt: string
  updatedAt: string
  url: string
}

export interface CreateIssueInput {
  title: string
  description?: string
  priority?: IssuePriority
  teamId?: string // optional: server uses LINEAR_TEAM_ID env var as fallback
}
