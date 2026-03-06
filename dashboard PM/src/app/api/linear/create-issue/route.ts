import { NextResponse } from 'next/server'
import type { CreateIssueInput } from '@/types/linear'

export async function POST(req: Request) {
  const apiKey = process.env.LINEAR_API_KEY
  if (!apiKey) {
    return NextResponse.json({ ok: false, error: 'LINEAR_API_KEY no configurada' }, { status: 400 })
  }

  const body: CreateIssueInput = await req.json()
  try {
    const { getLinearClient } = await import('@/lib/linear-client')
    const client = getLinearClient()
    const result = await client.createIssue({
      title: body.title,
      description: body.description,
      teamId: body.teamId,
      priority: body.priority,
    })
    const issue = await result.issue
    return NextResponse.json({ ok: true, issueId: issue?.id, identifier: issue?.identifier })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
