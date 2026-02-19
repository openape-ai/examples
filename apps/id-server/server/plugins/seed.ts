export default defineNitroPlugin(async () => {
  const { userStore } = useStores()

  const existing = await userStore.findByEmail('phofmann@office.or.at')
  if (!existing) {
    await userStore.register('phofmann@office.or.at', 'q1w2e3r4', 'Patrick Hofmann')
    console.log('[id-server] Seeded user: phofmann@delta-mind.at')
  }
})
