export default defineEventHandler(async (event) => {
  const { grantStore } = useStores()
  const query = getQuery(event)

  // Optional filter by requester
  if (query.requester) {
    return await grantStore.findByRequester(String(query.requester))
  }

  // Return pending grants by default
  return await grantStore.findPending()
})
