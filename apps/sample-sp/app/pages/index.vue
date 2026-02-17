<script setup lang="ts">
const { user, loading, fetchUser, login } = useAuth()
const email = ref('')
const error = ref('')
const submitting = ref(false)

const route = useRoute()

onMounted(async () => {
  await fetchUser()
  if (user.value) {
    navigateTo('/dashboard')
  }
  if (route.query.error) {
    error.value = String(route.query.error)
  }
})

async function handleLogin() {
  error.value = ''
  if (!email.value || !email.value.includes('@')) {
    error.value = 'Please enter a valid email address'
    return
  }
  submitting.value = true
  try {
    await login(email.value)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Login failed'
    error.value = msg
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900">Sample SP</h1>
        <p class="mt-2 text-gray-600">
          Sign in with your email using DNS-Delegated Identity.
        </p>
      </div>

      <div v-if="loading" class="text-center text-gray-500">
        Loading...
      </div>

      <form v-else class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div
          v-if="error"
          class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"
        >
          {{ error }}
        </div>

        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="phofmann@delta-mind.at"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p class="mt-1 text-xs text-gray-500">
            Uses real DNS resolution to discover the IdP for your domain.
          </p>
        </div>

        <button
          type="submit"
          :disabled="submitting"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ submitting ? 'Redirecting...' : 'Login with DDISA' }}
        </button>
      </form>

      <div class="mt-6 text-center text-xs text-gray-400">
        <p>SP manifest:</p>
        <a href="/.well-known/sp-manifest.json" target="_blank" class="text-blue-500 underline">
          /.well-known/sp-manifest.json
        </a>
      </div>
    </div>
  </div>
</template>
