import { useGrant } from '@clawgate/server'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const { grantStore } = useStores()

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Grant ID is required' })
  }

  try {
    const grant = await useGrant(id, grantStore)
    return grant
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to use grant'
    throw createError({ statusCode: 400, statusMessage: message })
  }
})
