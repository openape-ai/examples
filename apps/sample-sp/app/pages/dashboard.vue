<script setup lang="ts">
const { user, loading, fetchUser, logout } = useAuth()
const route = useRoute()

const grantStatus = ref('')
const hasPermission = ref(false)
const requesting = ref(false)
const executing = ref(false)
const actionResult = ref<Record<string, unknown> | null>(null)
const error = ref('')

onMounted(async () => {
  await fetchUser()
  if (!user.value) {
    navigateTo('/')
    return
  }

  // Check for grant callback status from URL
  if (route.query.grant_status) {
    grantStatus.value = String(route.query.grant_status)
    if (grantStatus.value === 'approved') {
      hasPermission.value = true
    }
  } else {
    // Check session for existing AuthZ-JWT (persists across refresh)
    const status = await $fetch<{ hasAuthzJWT: boolean }>('/api/grant-status')
    if (status.hasAuthzJWT) {
      hasPermission.value = true
    }
  }
})

async function requestPermission() {
  error.value = ''
  requesting.value = true
  try {
    const { redirectUrl } = await $fetch<{ redirectUrl: string }>('/api/request-permission', {
      method: 'POST',
      body: { action: 'protected-action', reason: 'Execute a protected action on Sample SP' },
    })
    navigateTo(redirectUrl, { external: true })
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string }; message?: string }
    error.value = e.data?.statusMessage ?? e.message ?? 'Permission request failed'
    requesting.value = false
  }
}

async function executeProtectedAction() {
  error.value = ''
  executing.value = true
  actionResult.value = null
  try {
    const result = await $fetch<Record<string, unknown>>('/api/protected-action', {
      method: 'POST',
    })
    actionResult.value = result
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string }; message?: string }
    error.value = e.data?.statusMessage ?? e.message ?? 'Action failed'
  } finally {
    executing.value = false
  }
}

function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleString()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-2xl mx-auto">
      <div v-if="loading" class="text-center text-gray-500 mt-20">Loading...</div>

      <template v-else-if="user">
        <div class="flex items-center justify-between mb-8">
          <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
          <button
            class="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
            @click="logout"
          >
            Logout
          </button>
        </div>

        <!-- DDISA Assertion Claims -->
        <div class="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div class="px-6 py-4 bg-green-50 border-b border-green-200">
            <p class="text-green-800 font-medium">Authenticated via DDISA</p>
          </div>
          <div class="divide-y divide-gray-100">
            <div class="px-6 py-3 flex justify-between">
              <span class="text-sm text-gray-500">Subject (sub)</span>
              <span class="text-sm text-gray-900 font-mono">{{ user.sub }}</span>
            </div>
            <div class="px-6 py-3 flex justify-between">
              <span class="text-sm text-gray-500">Issuer (iss)</span>
              <span class="text-sm text-gray-900 font-mono">{{ user.iss }}</span>
            </div>
            <div class="px-6 py-3 flex justify-between">
              <span class="text-sm text-gray-500">Audience (aud)</span>
              <span class="text-sm text-gray-900 font-mono">{{ user.aud }}</span>
            </div>
            <div class="px-6 py-3 flex justify-between">
              <span class="text-sm text-gray-500">Issued At</span>
              <span class="text-sm text-gray-900">{{ formatTimestamp(user.iat) }}</span>
            </div>
          </div>
        </div>

        <!-- Grant Status Notification -->
        <div v-if="grantStatus === 'approved'" class="bg-green-50 border border-green-200 text-green-800 rounded p-3 mb-4 text-sm">
          Permission granted! You can now execute the protected action.
        </div>
        <div v-if="grantStatus === 'denied'" class="bg-red-50 border border-red-200 text-red-700 rounded p-3 mb-4 text-sm">
          Permission denied by the user.
        </div>

        <!-- Error -->
        <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded p-3 mb-4 text-sm">
          {{ error }}
        </div>

        <!-- ClawGate Protected Action -->
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">ClawGate Protected Action</h2>
          <p class="text-sm text-gray-600 mb-4">
            This action requires ClawGate authorization. Click "Request Permission" to be redirected to the IdP for approval.
          </p>

          <div class="flex gap-3">
            <button
              v-if="!hasPermission"
              :disabled="requesting"
              class="flex-1 bg-yellow-600 text-white py-2 px-4 rounded hover:bg-yellow-700 transition disabled:opacity-50"
              @click="requestPermission"
            >
              {{ requesting ? 'Redirecting...' : 'Request Permission' }}
            </button>

            <button
              v-if="hasPermission"
              :disabled="executing"
              class="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition disabled:opacity-50"
              @click="executeProtectedAction"
            >
              {{ executing ? 'Executing...' : 'Execute Protected Action' }}
            </button>
          </div>

          <!-- Action Result -->
          <div v-if="actionResult" class="mt-4 bg-gray-50 rounded p-4">
            <p class="text-sm font-medium text-gray-700 mb-2">Result:</p>
            <pre class="text-xs text-gray-800 overflow-auto">{{ JSON.stringify(actionResult, null, 2) }}</pre>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
