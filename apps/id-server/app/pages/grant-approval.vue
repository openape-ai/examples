<script setup lang="ts">
const { user, loading: authLoading, fetchUser } = useAuth()
const route = useRoute()

const grant = ref<Record<string, unknown> | null>(null)
const loading = ref(true)
const error = ref('')
const processing = ref(false)

const grantId = computed(() => route.query.grant_id as string)
const callbackUrl = computed(() => route.query.callback as string)

onMounted(async () => {
  await fetchUser()

  // If not logged in, redirect to login with returnTo
  if (!user.value) {
    const returnTo = `/grant-approval?${new URLSearchParams(route.query as Record<string, string>).toString()}`
    await navigateTo(`/login?returnTo=${encodeURIComponent(returnTo)}`)
    return
  }

  if (!grantId.value) {
    error.value = 'Missing grant_id parameter'
    loading.value = false
    return
  }

  try {
    grant.value = await $fetch(`/api/grants/${grantId.value}`)
  } catch {
    error.value = 'Grant not found'
  } finally {
    loading.value = false
  }
})

async function handleApprove() {
  processing.value = true
  try {
    const result = await $fetch<{ grant: Record<string, unknown>; authzJWT: string }>(
      `/api/grants/${grantId.value}/approve`,
      { method: 'POST' },
    )

    // Redirect back to SP with the AuthZ-JWT
    if (callbackUrl.value) {
      const url = new URL(callbackUrl.value)
      url.searchParams.set('grant_id', grantId.value)
      url.searchParams.set('authz_jwt', result.authzJWT)
      url.searchParams.set('status', 'approved')
      await navigateTo(url.toString(), { external: true })
    } else {
      grant.value = result.grant
    }
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string }; message?: string }
    error.value = e.data?.statusMessage ?? e.message ?? 'Approval failed'
  } finally {
    processing.value = false
  }
}

async function handleDeny() {
  processing.value = true
  try {
    await $fetch(`/api/grants/${grantId.value}/deny`, { method: 'POST' })

    if (callbackUrl.value) {
      const url = new URL(callbackUrl.value)
      url.searchParams.set('grant_id', grantId.value)
      url.searchParams.set('status', 'denied')
      await navigateTo(url.toString(), { external: true })
    } else {
      grant.value = { ...(grant.value ?? {}), status: 'denied' }
    }
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string }; message?: string }
    error.value = e.data?.statusMessage ?? e.message ?? 'Denial failed'
  } finally {
    processing.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="bg-white shadow rounded-lg p-8 w-full max-w-lg">
      <h1 class="text-2xl font-bold text-center mb-6">Permission Request</h1>

      <div v-if="loading || authLoading" class="text-center text-gray-500">
        Loading...
      </div>

      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded p-3 text-sm">
        {{ error }}
      </div>

      <template v-else-if="grant">
        <div v-if="(grant as any).status === 'pending'" class="space-y-4">
          <div class="bg-yellow-50 border border-yellow-200 rounded p-4">
            <p class="text-sm font-medium text-yellow-800 mb-2">An application is requesting permission:</p>
            <dl class="text-sm space-y-2">
              <div class="flex justify-between">
                <dt class="text-gray-600">Requester</dt>
                <dd class="font-mono text-gray-900">{{ (grant as any).request?.requester }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-600">Target</dt>
                <dd class="font-mono text-gray-900">{{ (grant as any).request?.target }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-gray-600">Type</dt>
                <dd class="font-mono text-gray-900">{{ (grant as any).request?.grant_type }}</dd>
              </div>
              <div v-if="(grant as any).request?.reason" class="flex justify-between">
                <dt class="text-gray-600">Reason</dt>
                <dd class="text-gray-900">{{ (grant as any).request?.reason }}</dd>
              </div>
              <div v-if="(grant as any).request?.permissions?.length" class="flex justify-between">
                <dt class="text-gray-600">Permissions</dt>
                <dd class="font-mono text-gray-900">{{ (grant as any).request?.permissions?.join(', ') }}</dd>
              </div>
            </dl>
          </div>

          <div class="flex gap-3">
            <button
              :disabled="processing"
              class="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition disabled:opacity-50"
              @click="handleApprove"
            >
              {{ processing ? 'Processing...' : 'Approve' }}
            </button>
            <button
              :disabled="processing"
              class="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition disabled:opacity-50"
              @click="handleDeny"
            >
              {{ processing ? 'Processing...' : 'Deny' }}
            </button>
          </div>
        </div>

        <div v-else class="bg-gray-50 border border-gray-200 rounded p-4 text-center">
          <p class="text-gray-600">
            This grant has been <strong>{{ (grant as any).status }}</strong>.
          </p>
        </div>
      </template>
    </div>
  </div>
</template>
