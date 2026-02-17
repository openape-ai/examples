export default defineEventHandler(async () => {
  const { client } = useStores()
  const result = await client.execute({
    sql: 'SELECT kid, public_key_jwk FROM signing_keys WHERE is_active = 1',
    args: [],
  })
  const keys = result.rows.map(row => {
    const jwk = JSON.parse(row.public_key_jwk as string)
    return { ...jwk, kid: row.kid as string, alg: 'ES256', use: 'sig' }
  })
  return { keys }
})
