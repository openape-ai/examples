<script setup lang="ts">
const { login } = useAuth()
const route = useRoute()

const email = ref('')
const password = ref('')
const error = ref('')
const submitting = ref(false)

async function handleSubmit() {
  error.value = ''
  submitting.value = true
  try {
    await login(email.value, password.value)
    const returnTo = route.query.returnTo as string | undefined
    if (returnTo) {
      await navigateTo(returnTo, { external: true })
    } else {
      await navigateTo('/')
    }
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string }; message?: string }
    error.value = e.data?.statusMessage ?? e.message ?? 'Login failed'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="bg-white shadow rounded-lg p-8 w-full max-w-md">
      <h1 class="text-2xl font-bold text-center mb-6">Login</h1>

      <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 rounded p-3 mb-4 text-sm">
        {{ error }}
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="phofmann@delta-mind.at"
          >
        </div>

        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Password"
          >
        </div>

        <button
          type="submit"
          :disabled="submitting"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50"
        >
          {{ submitting ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <p class="text-center text-sm text-gray-500 mt-4">
        Don't have an account?
        <NuxtLink to="/register" class="text-blue-600 hover:underline">Register</NuxtLink>
      </p>
    </div>
  </div>
</template>
