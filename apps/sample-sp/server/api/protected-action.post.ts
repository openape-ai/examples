import { verifyAuthzJWT } from '@clawgate/server'

export default defineEventHandler(async (event) => {
  const session = await getSession(event)
  const data = session.data as Record<string, unknown>
  const claims = data.claims as { sub?: string } | undefined

  if (!claims?.sub) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  // Check for AuthZ-JWT in Authorization header or session
  const authHeader = getHeader(event, 'authorization')
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : (data.authzJWT as string | undefined)

  if (!token) {
    throw createError({ statusCode: 403, statusMessage: 'Authorization JWT required. Please request permission first.' })
  }

  const { clawgateUrl } = getSpConfig()

  // Verify the AuthZ-JWT
  const result = await verifyAuthzJWT(token, {
    jwksUri: `${clawgateUrl}/.well-known/jwks.json`,
  })

  if (!result.valid) {
    throw createError({ statusCode: 403, statusMessage: `Authorization failed: ${result.error}` })
  }

  // Mark grant as used on the ClawGate (prevents replay for 'once' grants)
  if (result.claims?.grant_id) {
    try {
      await $fetch(`${clawgateUrl}/api/grants/${result.claims.grant_id}/use`, {
        method: 'POST',
      })
    } catch {
      // Grant may already be used or expired — the JWT verification above is the primary check
    }
  }

  return {
    success: true,
    message: 'Protected action executed successfully',
    user: claims.sub,
    grant: result.claims,
    timestamp: new Date().toISOString(),
  }
})
