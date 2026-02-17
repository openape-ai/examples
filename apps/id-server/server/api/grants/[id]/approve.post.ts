import { approveGrant, issueAuthzJWT } from '@clawgate/server'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const { grantStore, keyStore } = useStores()

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Grant ID is required' })
  }

  // Require authenticated user
  const session = await getAppSession(event)
  if (!session.data.userId) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required to approve grants' })
  }

  try {
    const grant = await approveGrant(id, session.data.userId, grantStore)

    // Issue AuthZ-JWT for the approved grant
    const signingKey = await keyStore.getSigningKey()
    const authzJWT = await issueAuthzJWT(grant, IDP_ISSUER, signingKey.privateKey, signingKey.kid)

    return { grant, authzJWT }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to approve grant'
    throw createError({ statusCode: 400, statusMessage: message })
  }
})
