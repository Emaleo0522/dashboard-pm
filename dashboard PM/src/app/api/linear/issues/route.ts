import { NextResponse } from 'next/server'
import { mockLinearIssues } from '@/data/mock'

export async function GET() {
  const apiKey = process.env.LINEAR_API_KEY
  const teamId = process.env.LINEAR_TEAM_ID

  if (!apiKey || !teamId) {
    return NextResponse.json({ issues: mockLinearIssues, mock: true })
  }

  try {
    const { getTeamIssues } = await import('@/lib/linear-queries')
    const issues = await getTeamIssues(teamId)
    return NextResponse.json({ issues, mock: false })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return NextResponse.json({ issues: mockLinearIssues, mock: true, error: e.message })
  }
}
