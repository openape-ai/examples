export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string; password: string; name: string }>(event)
  const { userStore } = useStores()

  if (!body.email || !body.password || !body.name) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields: email, password, name' })
  }

  try {
    const user = await userStore.register(body.email, body.password, body.name)
    return { ok: true, email: user.email, name: user.name }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Registration failed'
    throw createError({ statusCode: 409, statusMessage: message })
  }
})
