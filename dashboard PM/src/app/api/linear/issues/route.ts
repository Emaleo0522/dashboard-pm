import { NextResponse } from 'next/server'
import { mockLinearIssues } from '@/data/mock'

export async function GET() {
  const apiKey = process.env.LINEAR_API_KEY
  const teamId = process.env.LINEAR_TEAM_ID

  if (!apiKey || !teamId) {
    // Filter mock: only show active issues (not completed/cancelled)
    const activeIssues = mockLinearIssues.filter(
      (issue) => issue.state.type !== 'completed' && issue.state.type !== 'cancelled'
    )
    return NextResponse.json({ issues: activeIssues, mock: true })
  }

  try {
    const { getTeamIssues } = await import('@/lib/linear-queries')
    const issues = await getTeamIssues(teamId)
    return NextResponse.json({ issues, mock: false })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    const activeIssues = mockLinearIssues.filter(
      (issue) => issue.state.type !== 'completed' && issue.state.type !== 'cancelled'
    )
    return NextResponse.json({ issues: activeIssues, mock: true, error: e.message })
  }
}
