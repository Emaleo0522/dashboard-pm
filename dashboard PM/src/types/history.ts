export interface MeetingAction {
  id: string
  text: string
  assignee?: string
  dueDate?: string
  completed: boolean
}

export interface MeetingDecision {
  id: string
  text: string
  rationale?: string
}

export interface Meeting {
  id: string
  title: string
  date: string
  summary: string
  decisions: MeetingDecision[]
  actions: MeetingAction[]
  tags: string[]
}

export interface CalendarMeeting {
  uid: string
  title: string
  date: string
  endDate?: string
  attendees: string[]
  location?: string
}
