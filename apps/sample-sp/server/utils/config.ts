import type { AuthFlowState } from '@ddisa/core'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs-lite'

export interface FlowStateStore {
  save(state: string, flow: AuthFlowState): Promise<void>
  find(state: string): Promise<AuthFlowState | null>
  delete(state: string): Promise<void>
}

interface StoredFlowState extends AuthFlowState {
  expiresAt: number
}

const storage = createStorage({ driver: fsDriver({ base: './.data/sample-sp-db' }) })

let _flowStateStore: FlowStateStore | null = null

function createFlowStateStore(): FlowStateStore {
  return {
    async save(state, flow) {
      const expiresAt = flow.createdAt + 10 * 60 * 1000 // 10 min TTL
      await storage.setItem<StoredFlowState>(`flows:${state}`, { ...flow, expiresAt })
    },

    async find(state) {
      const stored = await storage.getItem<StoredFlowState>(`flows:${state}`)
      if (!stored) return null

      if (stored.expiresAt < Date.now()) {
        await storage.removeItem(`flows:${state}`)
        return null
      }

      const { expiresAt: _, ...flow } = stored
      return flow
    },

    async delete(state) {
      await storage.removeItem(`flows:${state}`)
    },
  }
}

function getFlowStateStore() {
  if (!_flowStateStore) {
    _flowStateStore = createFlowStateStore()
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
