export type EntryStatus = 'unprocessed' | 'classified' | 'converted' | 'archived'

export interface InboxEntry {
  id: string
  content: string
  status: EntryStatus
  createdAt: string
  classifiedAs?: 'feature' | 'bug' | 'improvement' | 'question' | 'decision'
  tags?: string[]
  convertedIssueId?: string
  createdBy?: string
}
