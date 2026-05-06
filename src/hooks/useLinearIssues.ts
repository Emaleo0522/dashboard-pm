import { useQuery } from '@tanstack/react-query'
import type { LinearIssue } from '@/types/linear'

interface LinearIssuesResponse {
  issues: LinearIssue[]
  mock: boolean
  error?: string
}

export function useLinearIssues() {
  return useQuery<LinearIssuesResponse>({
    queryKey: ['linear-issues'],
    queryFn: () => fetch('/api/linear/issues').then((r) => r.json()),
    staleTime: 60_000,
  })
}
