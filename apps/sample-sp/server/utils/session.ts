import type { H3Event } from 'h3'

export async function getSession(event: H3Event) {
  const config = useRuntimeConfig()
  return await useSession(event, {
    password: config.sessionSecret,
  })
}
