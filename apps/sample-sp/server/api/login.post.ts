import { discoverIdP, createAuthorizationURL } from '@ddisa/sp-server'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string }>(event)
  const { spId, spRedirectUri } = getSpConfig()
  const flowStateStore = useFlowStateStore()

  if (!body?.email || !body.email.includes('@')) {
    throw createError({ statusCode: 400, statusMessage: 'Valid email required' })
  }

  const email = body.email.trim()
  const domain = email.split('@')[1]

  // Discover IdP via real DNS (DoH in edge runtime)
  const idpConfig = await discoverIdP(email)

  if (!idpConfig) {
    throw createError({
      statusCode: 404,
      statusMessage: `No DDISA IdP found for domain "${domain}"`,
    })
  }

  // Create authorization URL
  const { url, flowState } = await createAuthorizationURL(idpConfig, {
    spId,
    redirectUri: spRedirectUri,
  })

  // Persist flow state in Turso
  await flowStateStore.save(flowState.state, flowState)

  // Save trace info in session
  const session = await getSession(event)
  await session.update({
    trace: {
      email,
      domain,
      idpUrl: idpConfig.idpUrl,
      mode: idpConfig.mode,
      authorizationUrl: url,
      state: flowState.state,
    },
  })

  return { redirectUrl: url }
})
