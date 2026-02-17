import {
  createTursoClient,
  TursoFlowStateStore,
} from '@ddisa/turso-stores'

let _flowStateStore: TursoFlowStateStore | null = null

function getFlowStateStore() {
  if (!_flowStateStore) {
    const config = useRuntimeConfig()
    const client = createTursoClient(config.tursoUrl, config.tursoAuthToken || undefined)
    _flowStateStore = new TursoFlowStateStore(client)
  }
  return _flowStateStore
}

export function getSpConfig() {
  const config = useRuntimeConfig()
  return {
    spId: config.spId || 'localhost:3001',
    spRedirectUri: config.spRedirectUri || 'http://localhost:3001/api/callback',
    clawgateUrl: config.clawgateUrl || 'https://id.delta-mind.at',
    spName: 'DDISA Sample SP',
  }
}

export const useFlowStateStore = getFlowStateStore
