import {
  createTursoClient,
  TursoUserStore,
  TursoCodeStore,
  TursoConsentStore,
  TursoKeyStore,
  TursoGrantStore,
} from '@ddisa/turso-stores'

let _stores: ReturnType<typeof initStores> | null = null

function initStores() {
  const config = useRuntimeConfig()
  const client = createTursoClient(config.tursoUrl, config.tursoAuthToken || undefined)

  return {
    client,
    userStore: new TursoUserStore(client),
    codeStore: new TursoCodeStore(client),
    consentStore: new TursoConsentStore(client),
    keyStore: new TursoKeyStore(client),
    grantStore: new TursoGrantStore(client),
  }
}

function getStores() {
  if (!_stores) {
    _stores = initStores()
  }
  return _stores
}

export const useStores = getStores

export const IDP_ISSUER = process.env.NUXT_PUBLIC_SITE_URL || 'https://id.delta-mind.at'
