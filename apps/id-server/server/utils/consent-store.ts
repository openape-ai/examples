import type { ConsentStore, ConsentEntry } from '@ddisa/idp-server'
import { useAppStorage } from './storage'

export function createConsentStore(): ConsentStore {
  const storage = useAppStorage()

  return {
    async hasConsent(userId, spId) {
      const entry = await storage.getItem<ConsentEntry>(`consents:${userId}:${spId}`)
      return entry !== null
    },

    async save(entry) {
      await storage.setItem(`consents:${entry.userId}:${entry.spId}`, entry)
    },
  }
}
