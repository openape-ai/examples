import { denyGrant } from '@clawgate/server'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const { grantStore } = useStores()

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Grant ID is required' })
  }

  const session = await getAppSession(event)
  if (!session.data.userId) {
    throw createError({ statusCode: 401, statusMessage: 'Authentication required to deny grants' })
  }

  try {
    const grant = await denyGrant(id, session.data.userId, grantStore)
    return grant
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to deny grant'
    throw createError({ statusCode: 400, statusMessage: message })
  }
})
