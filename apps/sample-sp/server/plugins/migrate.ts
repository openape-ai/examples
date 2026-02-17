export default defineNitroPlugin(async () => {
  await runSpMigrations()
})
