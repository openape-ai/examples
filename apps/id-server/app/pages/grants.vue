<script setup lang="ts">
const { user, loading: authLoading, fetchUser } = useAuth()

const grants = ref<Record<string, unknown>[]>([])
const loading = ref(true)

onMounted(async () => {
  await fetchUser()
  if (!user.value) {
    await navigateTo('/login')
    return
  }
  await loadGrants()
})

async function loadGrants() {
  loading.value = true
  try {
    grants.value = await $fetch<Record<string, unknown>[]>('/api/grants')
  } catch {
    grants.value = []
  } finally {
    loading.value = false
  }
}

function statusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    denied: 'bg-red-100 text-red-800',
    revoked: 'bg-gray-100 text-gray-800',
    expired: 'bg-orange-100 text-orange-800',
    used: 'bg-blue-100 text-blue-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

function formatTime(ts: number): string {
  return new Date(ts * 1000).toLocaleString()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Grant Management</h1>
        <div class="flex gap-3">
          <button
            class="px-4 py-2 text-sm bg-blue-50 text-blue-700 border border-blue-200 rounded hover:bg-blue-100"
            @click="loadGrants"
          >
            Refresh
          </button>
          <NuxtLink
            to="/"
            class="px-4 py-2 text-sm bg-gray-50 text-gray-700 border border-gray-200 rounded hover:bg-gray-100"
          >
            Back
          </NuxtLink>
        </div>
      </div>

      <div v-if="loading || authLoading" class="text-center text-gray-500 mt-10">
        Loading...
      </div>

      <div v-else-if="grants.length === 0" class="text-center text-gray-500 mt-10">
        No pending grants.
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="grant in grants"
          :key="(grant as any).id"
          class="bg-white shadow rounded-lg p-4"
        >
          <div class="flex items-center justify-between mb-2">
            <span class="font-mono text-xs text-gray-400">{{ (grant as any).id }}</span>
            <span
              class="px-2 py-1 rounded text-xs font-medium"
              :class="statusColor((grant as any).status as string)"
            >
              {{ (grant as any).status }}
            </span>
          </div>
          <div class="text-sm space-y-1">
            <p><span class="text-gray-500">Requester:</span> {{ (grant as any).request?.requester }}</p>
            <p><span class="text-gray-500">Target:</span> {{ (grant as any).request?.target }}</p>
            <p><span class="text-gray-500">Type:</span> {{ (grant as any).request?.grant_type }}</p>
            <p v-if="(grant as any).request?.reason"><span class="text-gray-500">Reason:</span> {{ (grant as any).request?.reason }}</p>
            <p class="text-xs text-gray-400">Created: {{ formatTime((grant as any).created_at) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
