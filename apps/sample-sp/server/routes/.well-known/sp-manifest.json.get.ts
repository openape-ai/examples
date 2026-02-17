import { createSPManifest } from '@ddisa/sp-server'

export default defineEventHandler(() => {
  const { spId, spRedirectUri, spName } = getSpConfig()
  return createSPManifest({
    sp_id: spId,
    name: spName,
    redirect_uris: [spRedirectUri],
    description: 'DDISA Sample Service Provider with ClawGate integration',
  })
})
