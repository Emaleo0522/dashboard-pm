import 'server-only'
import { LinearClient } from '@linear/sdk'

function getLinearClient() {
  const apiKey = process.env.LINEAR_API_KEY
  if (!apiKey) throw new Error('LINEAR_API_KEY no configurada')
  return new LinearClient({ apiKey })
}

export { getLinearClient }
