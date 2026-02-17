import { createTursoClient, runMigrations } from '@ddisa/turso-stores'

export async function runSpMigrations() {
  const config = useRuntimeConfig()
  const client = createTursoClient(config.tursoUrl, config.tursoAuthToken || undefined)
  await runMigrations(client)
  console.log('[sample-sp] Database migrations complete')
}
