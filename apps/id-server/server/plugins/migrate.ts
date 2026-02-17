import { runMigrations } from '@ddisa/turso-stores'

export default defineNitroPlugin(async () => {
  const { client } = useStores()
  await runMigrations(client)
  console.log('[id-server] Database migrations complete')
})
