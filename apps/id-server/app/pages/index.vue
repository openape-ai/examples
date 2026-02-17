<script setup lang="ts">
const { user, loading, fetchUser, logout } = useAuth()

onMounted(() => {
  fetchUser()
})

async function handleLogout() {
  await logout()
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
    <div class="bg-white shadow rounded-lg p-8 w-full max-w-md">
      <h1 class="text-2xl font-bold text-center mb-2">
        id.delta-mind.at
      </h1>
      <p class="text-center text-sm text-gray-500 mb-6">
        DDISA Identity Provider + ClawGate
      </p>

      <div v-if="loading" class="text-center text-gray-500">
        Loading...
      </div>

      <div v-else-if="user" class="space-y-4">
        <div class="bg-green-50 border border-green-200 rounded p-4">
          <p class="text-sm text-green-800">Logged in as</p>
          <p class="font-semibold text-green-900">{{ user.name }}</p>
          <p class="text-sm text-green-700">{{ user.email }}</p>
        </div>

        <div class="text-sm text-gray-600 space-y-2">
          <p>Endpoints:</p>
          <ul class="list-disc list-inside space-y-1 text-xs font-mono">
            <li>GET /authorize</li>
            <li>POST /token</li>
            <li>GET /.well-known/jwks.json</li>
            <li>POST /api/grants</li>
          </ul>
        </div>

        <NuxtLink
          to="/grants"
          class="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700 transition"
        >
          Manage Grants
        </NuxtLink>

        <button
          class="w-full bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition"
          @click="handleLogout"
        >
          Logout
        </button>
      </div>

      <div v-else class="space-y-4">
        <p class="text-gray-600 text-center text-sm">
          Production Identity Provider for @delta-mind.at users.
        </p>
        <div class="flex flex-col gap-2">
          <NuxtLink
            to="/login"
            class="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Login
          </NuxtLink>
          <NuxtLink
            to="/register"
            class="block w-full bg-gray-200 text-gray-800 text-center py-2 px-4 rounded hover:bg-gray-300 transition"
          >
            Register
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
