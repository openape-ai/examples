<script setup lang="ts">
const { user, loading: authLoading, fetchUser } = useAuth()

const activeTab = ref<'users' | 'agents'>('users')

// Users
const users = ref<{ email: string; name: string }[]>([])
const usersLoading = ref(false)
const newUser = ref({ name: '', email: '', password: '' })
const userError = ref('')
const userSuccess = ref('')

// Agents
interface Agent {
  id: string
  name: string
  owner: string
  approver: string
  publicKey: string
  isActive: boolean
  createdAt: number
}
const agents = ref<Agent[]>([])
const agentsLoading = ref(false)
const newAgent = ref({ name: '', owner: '', approver: '', publicKey: '' })
const agentError = ref('')
const agentSuccess = ref('')
const editingAgent = ref<Agent | null>(null)

onMounted(async () => {
  await fetchUser()
  if (!user.value) {
    await navigateTo('/login')
    return
  }
  if (!user.value.isAdmin) {
    await navigateTo('/')
    return
  }
  await Promise.all([loadUsers(), loadAgents()])
})

// User CRUD
async function loadUsers() {
  usersLoading.value = true
  try {
    users.value = await $fetch('/api/admin/users')
  } catch { users.value = [] }
  finally { usersLoading.value = false }
}

async function createUser() {
  userError.value = ''
  userSuccess.value = ''
  try {
    await $fetch('/api/admin/users', { method: 'POST', body: newUser.value })
    userSuccess.value = `User ${newUser.value.email} created`
    newUser.value = { name: '', email: '', password: '' }
    await loadUsers()
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    userError.value = e.data?.statusMessage ?? 'Failed to create user'
  }
}

async function deleteUser(email: string) {
  if (!confirm(`Delete user ${email}?`)) return
  userError.value = ''
  try {
    await $fetch(`/api/admin/users/${encodeURIComponent(email)}`, { method: 'DELETE' })
    await loadUsers()
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    userError.value = e.data?.statusMessage ?? 'Failed to delete user'
  }
}

// Agent CRUD
async function loadAgents() {
  agentsLoading.value = true
  try {
    agents.value = await $fetch('/api/admin/agents')
  } catch { agents.value = [] }
  finally { agentsLoading.value = false }
}

async function createAgent() {
  agentError.value = ''
  agentSuccess.value = ''
  try {
    await $fetch('/api/admin/agents', { method: 'POST', body: newAgent.value })
    agentSuccess.value = `Agent "${newAgent.value.name}" created`
    newAgent.value = { name: '', owner: '', approver: '', publicKey: '' }
    await loadAgents()
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    agentError.value = e.data?.statusMessage ?? 'Failed to create agent'
  }
}

async function deleteAgent(id: string) {
  if (!confirm('Delete this agent?')) return
  agentError.value = ''
  try {
    await $fetch(`/api/admin/agents/${id}`, { method: 'DELETE' })
    await loadAgents()
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    agentError.value = e.data?.statusMessage ?? 'Failed to delete agent'
  }
}

async function toggleAgent(agent: Agent) {
  agentError.value = ''
  try {
    await $fetch(`/api/admin/agents/${agent.id}`, {
      method: 'PUT',
      body: { isActive: !agent.isActive },
    })
    await loadAgents()
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    agentError.value = e.data?.statusMessage ?? 'Failed to update agent'
  }
}

async function startEditAgent(agent: Agent) {
  editingAgent.value = { ...agent }
}

async function saveEditAgent() {
  if (!editingAgent.value) return
  agentError.value = ''
  try {
    await $fetch(`/api/admin/agents/${editingAgent.value.id}`, {
      method: 'PUT',
      body: {
        name: editingAgent.value.name,
        owner: editingAgent.value.owner,
        approver: editingAgent.value.approver,
        publicKey: editingAgent.value.publicKey,
      },
    })
    editingAgent.value = null
    await loadAgents()
  } catch (err: unknown) {
    const e = err as { data?: { statusMessage?: string } }
    agentError.value = e.data?.statusMessage ?? 'Failed to update agent'
  }
}

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString()
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8 px-4">
    <div class="max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p class="text-sm text-gray-500">Manage users and agents</p>
        </div>
        <NuxtLink
          to="/"
          class="px-4 py-2 text-sm bg-gray-50 text-gray-700 border border-gray-200 rounded hover:bg-gray-100"
        >
          Back
        </NuxtLink>
      </div>

      <div v-if="authLoading" class="text-center text-gray-500 mt-10">Loading...</div>

      <template v-else>
        <!-- Tabs -->
        <div class="flex gap-1 mb-6 bg-gray-200 rounded-lg p-1 w-fit">
          <button
            class="px-4 py-2 text-sm font-medium rounded-md transition"
            :class="activeTab === 'users' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
            @click="activeTab = 'users'"
          >
            Users ({{ users.length }})
          </button>
          <button
            class="px-4 py-2 text-sm font-medium rounded-md transition"
            :class="activeTab === 'agents' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'"
            @click="activeTab = 'agents'"
          >
            Agents ({{ agents.length }})
          </button>
        </div>

        <!-- Users Tab -->
        <div v-if="activeTab === 'users'" class="space-y-6">
          <!-- Add User Form -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Add User</h2>

            <div v-if="userError" class="bg-red-50 border border-red-200 text-red-700 rounded p-3 mb-4 text-sm">
              {{ userError }}
            </div>
            <div v-if="userSuccess" class="bg-green-50 border border-green-200 text-green-700 rounded p-3 mb-4 text-sm">
              {{ userSuccess }}
            </div>

            <form class="flex flex-wrap gap-3 items-end" @submit.prevent="createUser">
              <div class="flex-1 min-w-[150px]">
                <label class="block text-xs font-medium text-gray-600 mb-1">Name</label>
                <input v-model="newUser.name" required class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Name">
              </div>
              <div class="flex-1 min-w-[200px]">
                <label class="block text-xs font-medium text-gray-600 mb-1">Email</label>
                <input v-model="newUser.email" type="email" required class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="user@domain.com">
              </div>
              <div class="flex-1 min-w-[150px]">
                <label class="block text-xs font-medium text-gray-600 mb-1">Password</label>
                <input v-model="newUser.password" type="password" required class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="Password">
              </div>
              <button type="submit" class="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition">
                Add User
              </button>
            </form>
          </div>

          <!-- Users Table -->
          <div class="bg-white shadow rounded-lg overflow-hidden">
            <div v-if="usersLoading" class="p-6 text-center text-gray-500">Loading...</div>
            <div v-else-if="users.length === 0" class="p-6 text-center text-gray-500">No users found.</div>
            <table v-else class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th class="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th class="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="u in users" :key="u.email" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-900">{{ u.name }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 font-mono">{{ u.email }}</td>
                  <td class="px-4 py-3 text-right">
                    <button
                      v-if="u.email !== user?.email"
                      class="text-xs text-red-600 hover:text-red-800"
                      @click="deleteUser(u.email)"
                    >
                      Delete
                    </button>
                    <span v-else class="text-xs text-gray-400">You</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Agents Tab -->
        <div v-if="activeTab === 'agents'" class="space-y-6">
          <!-- Edit Agent Modal -->
          <div v-if="editingAgent" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-lg p-6 w-full max-w-lg shadow-xl">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">Edit Agent</h2>
              <form class="space-y-3" @submit.prevent="saveEditAgent">
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Name</label>
                  <input v-model="editingAgent.name" required class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Owner Email</label>
                  <input v-model="editingAgent.owner" type="email" required class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Approver Email</label>
                  <input v-model="editingAgent.approver" type="email" required class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">Public Key (ssh-ed25519)</label>
                  <textarea v-model="editingAgent.publicKey" required rows="2" class="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div class="flex gap-3 justify-end pt-2">
                  <button type="button" class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900" @click="editingAgent = null">Cancel</button>
                  <button type="submit" class="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition">Save</button>
                </div>
              </form>
            </div>
          </div>

          <!-- Add Agent Form -->
          <div class="bg-white shadow rounded-lg p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Add Agent</h2>

            <div v-if="agentError" class="bg-red-50 border border-red-200 text-red-700 rounded p-3 mb-4 text-sm">
              {{ agentError }}
            </div>
            <div v-if="agentSuccess" class="bg-green-50 border border-green-200 text-green-700 rounded p-3 mb-4 text-sm">
              {{ agentSuccess }}
            </div>

            <form class="space-y-3" @submit.prevent="createAgent">
              <div class="flex flex-wrap gap-3">
                <div class="flex-1 min-w-[200px]">
                  <label class="block text-xs font-medium text-gray-600 mb-1">Agent Name</label>
                  <input v-model="newAgent.name" required class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="My Agent">
                </div>
                <div class="flex-1 min-w-[200px]">
                  <label class="block text-xs font-medium text-gray-600 mb-1">Owner Email</label>
                  <input v-model="newAgent.owner" type="email" required class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="owner@domain.com">
                </div>
                <div class="flex-1 min-w-[200px]">
                  <label class="block text-xs font-medium text-gray-600 mb-1">Approver Email</label>
                  <input v-model="newAgent.approver" type="email" required class="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="approver@domain.com">
                </div>
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600 mb-1">Public Key (ssh-ed25519)</label>
                <textarea v-model="newAgent.publicKey" required rows="2" class="w-full border border-gray-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="ssh-ed25519 AAAA..." />
              </div>
              <button type="submit" class="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition">
                Add Agent
              </button>
            </form>
          </div>

          <!-- Agents Table -->
          <div class="bg-white shadow rounded-lg overflow-hidden">
            <div v-if="agentsLoading" class="p-6 text-center text-gray-500">Loading...</div>
            <div v-else-if="agents.length === 0" class="p-6 text-center text-gray-500">No agents found.</div>
            <table v-else class="w-full">
              <thead class="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th class="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th class="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Owner</th>
                  <th class="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Approver</th>
                  <th class="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th class="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th class="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="a in agents" :key="a.id" class="hover:bg-gray-50">
                  <td class="px-4 py-3 text-sm text-gray-900">{{ a.name }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 font-mono text-xs">{{ a.owner }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600 font-mono text-xs">{{ a.approver }}</td>
                  <td class="px-4 py-3">
                    <span
                      class="px-2 py-0.5 rounded text-xs font-medium"
                      :class="a.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                    >
                      {{ a.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-xs text-gray-500">{{ formatDate(a.createdAt) }}</td>
                  <td class="px-4 py-3 text-right space-x-2">
                    <button class="text-xs text-blue-600 hover:text-blue-800" @click="startEditAgent(a)">Edit</button>
                    <button class="text-xs text-yellow-600 hover:text-yellow-800" @click="toggleAgent(a)">
                      {{ a.isActive ? 'Deactivate' : 'Activate' }}
                    </button>
                    <button class="text-xs text-red-600 hover:text-red-800" @click="deleteAgent(a.id)">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
