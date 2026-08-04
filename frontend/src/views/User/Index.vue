<template>
  <MainLayout>
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden relative">
      <!-- Header -->
      <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <h2 class="text-lg font-bold text-slate-800">Users Directory</h2>
        <button @click="openModal()" class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
          Add User
        </button>
      </div>

      <!-- Status Tabs & Search -->
      <div class="p-6 pb-2 border-b border-slate-100 bg-slate-50/30 space-y-4">
        <!-- Status Tabs (Active / Inactive) -->
        <div class="flex items-center gap-2 border-b border-slate-200/80 pb-4">
          <button 
            @click="setStatus('active')"
            :class="[
              'px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer',
              store.status === 'active'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            ]"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            Active Users
          </button>

          <button 
            @click="setStatus('inactive')"
            :class="[
              'px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer',
              store.status === 'inactive'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-100'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            ]"
          >
            <span class="w-2 h-2 rounded-full bg-rose-400"></span>
            Inactive Users
          </button>
        </div>

        <div class="relative max-w-sm">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input type="text" v-model="searchQuery" @input="handleSearch" class="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Search by name or mobile...">
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto p-6 pt-2">
        <table class="min-w-full divide-y divide-slate-200">
          <thead>
            <tr>
              <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">User</th>
              <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Contact</th>
              <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Designation</th>
              <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Placement</th>
              <th scope="col" class="px-3 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-100">
            <tr v-if="loading">
              <td colspan="5" class="px-3 py-8 text-center text-slate-500">Loading users...</td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="5" class="px-3 py-8 text-center text-slate-500">No users found.</td>
            </tr>
            <tr v-else v-for="user in users" :key="user.id" class="hover:bg-slate-50 transition-colors">
              <td class="px-3 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {{ user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U' }}
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-semibold text-slate-800">{{ user.full_name }}</div>
                    <div class="inline-flex items-center mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                         :class="user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : (user.role === 'Manager' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600')">
                      {{ user.role || 'User' }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-3 py-4 whitespace-nowrap">
                <div class="text-sm text-slate-600">{{ user.mobile }}</div>
              </td>
              <td class="px-3 py-4 whitespace-nowrap">
                <div class="text-sm text-slate-600">{{ user.designation || 'N/A' }}</div>
              </td>
              <td class="px-3 py-4 whitespace-nowrap">
                <div class="flex flex-wrap gap-1 mb-1">
                  <span v-for="office in user.Offices" :key="office.id" class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    {{ office.name }}
                  </span>
                  <span v-if="!user.Offices || user.Offices.length === 0" class="text-sm text-slate-400 italic">No Office Assigned</span>
                </div>
                <div class="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                     :class="!user.deleted_at ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'">
                  {{ !user.deleted_at ? 'Active' : 'Inactive' }}
                </div>
              </td>
              <td class="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="openModal(user)" class="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-md mr-2 transition-colors">Edit</button>
                <button v-if="!user.deleted_at" @click="toggleUserStatus(user.id, 'disable')" class="text-amber-600 hover:text-amber-900 bg-amber-50 px-3 py-1 rounded-md transition-colors">Disable</button>
                <button v-else @click="toggleUserStatus(user.id, 'enable')" class="text-emerald-600 hover:text-emerald-900 bg-emerald-50 px-3 py-1 rounded-md transition-colors">Enable</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div v-if="users.length > 0" class="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-xs text-slate-500">
          Showing <span class="font-bold text-slate-700">{{ paginationRange.from }}</span> to 
          <span class="font-bold text-slate-700">{{ paginationRange.to }}</span> of 
          <span class="font-bold text-slate-700">{{ store.pagination.total }}</span> users
        </div>

        <div class="flex items-center gap-2">
          <button 
            @click="changePage(store.pagination.page - 1)"
            :disabled="!store.pagination.hasPrevPage"
            class="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-600 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Previous</span>
          </button>

          <span class="text-xs font-bold text-slate-600 px-2">
            Page {{ store.pagination.page }} of {{ store.pagination.totalPages || 1 }}
          </span>

          <button 
            @click="changePage(store.pagination.page + 1)"
            :disabled="!store.pagination.hasNextPage"
            class="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-600 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Next</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- CRUD Modal -->
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/50 backdrop-blur-sm p-4">
        <div class="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl max-h-[90vh] flex flex-col">
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
            <h3 class="text-lg font-bold text-slate-800">
              {{ isEditing ? 'Edit User' : 'Add New User' }}
            </h3>
            <button @click="closeModal" class="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <!-- Modal Body -->
          <div class="p-6 overflow-y-auto">
            <form @submit.prevent="saveUser">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                  <input v-model="form.full_name" type="text" required class="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-1">Mobile Phone</label>
                  <input v-model="form.mobile" type="text" required class="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-1">Designation</label>
                  <input v-model="form.designation" type="text" class="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                </div>
                <div>
                  <label class="block text-sm font-semibold text-slate-700 mb-1">Role / Permissions</label>
                  <select v-model="form.role" class="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white">
                    <option value="User">Standard User</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">System Administrator</option>
                  </select>
                </div>
              </div>
              
              <div class="mb-4">
                <label class="block text-sm font-semibold text-slate-700 mb-1">
                  Password <span v-if="isEditing" class="text-slate-400 font-normal">(Leave blank to keep current)</span>
                </label>
                <input v-model="form.password" type="password" :required="!isEditing" class="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
              </div>
              
              <div class="mb-6">
                <div class="flex items-center justify-between mb-1.5">
                  <label class="block text-sm font-semibold text-slate-700">Office Placements (Multiple)</label>
                  <span v-if="form.office_ids && form.office_ids.length > 0" class="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {{ form.office_ids.length }} assigned
                  </span>
                </div>

                <!-- Search assignable offices -->
                <div class="mb-2 relative">
                  <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg class="h-3.5 w-3.5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input 
                    v-model="officeSearchQuery" 
                    type="text" 
                    placeholder="Search offices to assign..." 
                    class="block w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs bg-white"
                  />
                </div>

                <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 max-h-56 overflow-y-auto space-y-1.5">
                  <div v-if="searchedOffices.length === 0" class="text-xs text-slate-400 italic py-2 text-center">
                    No matching offices found.
                  </div>

                  <label 
                    v-for="office in searchedOffices" 
                    :key="office.id" 
                    class="flex items-center justify-between p-2 rounded-lg transition-all cursor-pointer select-none"
                    :class="isOfficeAssigned(office.id) ? 'bg-indigo-50/70 border border-indigo-200/80 shadow-2xs' : 'hover:bg-slate-100/60 border border-transparent'"
                  >
                    <div class="flex items-center gap-2.5 min-w-0">
                      <input 
                        type="checkbox" 
                        :value="office.id" 
                        v-model="form.office_ids" 
                        class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      >
                      <span class="text-xs font-semibold truncate" :class="isOfficeAssigned(office.id) ? 'text-indigo-900 font-bold' : 'text-slate-700'">
                        {{ office.name }}
                      </span>
                    </div>

                    <span v-if="isOfficeAssigned(office.id)" class="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-100/80 px-2 py-0.5 rounded shrink-0">
                      Assigned
                    </span>
                  </label>
                </div>

                <p v-if="!officeSearchQuery && filteredOffices.length > searchedOffices.length" class="mt-1.5 text-xs text-slate-400">
                  Showing {{ searchedOffices.length }} of {{ filteredOffices.length }} offices. Search above to find more.
                </p>
              </div>

              <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" @click="closeModal" class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Cancel
                </button>
                <button type="submit" :disabled="saving" class="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 flex items-center gap-2">
                  <svg v-if="saving" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  {{ isEditing ? 'Save Changes' : 'Create User' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '../../stores/user'
import MainLayout from '../../layouts/MainLayout.vue'

const store = useUserStore()
const {
  users,
  districts: districtsList,
  loading,
  showModal,
  isEditing,
  saving,
  form,
  filteredOffices
} = storeToRefs(store)

const searchQuery = ref('')
const officeSearchQuery = ref('')

const isOfficeAssigned = (officeId) => {
  return form.value.office_ids && form.value.office_ids.includes(officeId)
}

const searchedOffices = computed(() => {
  const assignedSet = new Set(form.value.office_ids || [])
  const query = officeSearchQuery.value.trim().toLowerCase()

  const assigned = []
  const unassigned = []

  filteredOffices.value.forEach(office => {
    if (assignedSet.has(office.id)) {
      assigned.push(office)
    } else {
      unassigned.push(office)
    }
  })

  assigned.sort((a, b) => a.name.localeCompare(b.name))
  unassigned.sort((a, b) => a.name.localeCompare(b.name))

  const combined = [...assigned, ...unassigned]

  if (!query) {
    const unassignedSlice = unassigned.slice(0, Math.max(20, 30 - assigned.length))
    return [...assigned, ...unassignedSlice]
  }

  return combined.filter(o => o.name.toLowerCase().includes(query))
})

const paginationRange = computed(() => {
  const pag = store.pagination
  if (!pag || pag.total === 0) return { from: 0, to: 0 }
  const from = (pag.page - 1) * pag.limit + 1
  const to = Math.min(pag.page * pag.limit, pag.total)
  return { from, to }
})

const changePage = (newPage) => {
  const pag = store.pagination
  if (newPage < 1 || newPage > pag.totalPages) return
  store.pagination.page = newPage
  fetchUsers()
}

const setStatus = (val) => {
  store.status = val
  store.pagination.page = 1
  fetchUsers()
}

const handleSearch = () => {
  store.pagination.page = 1
  fetchUsers()
}

const fetchUsers = () => store.fetchUsers(searchQuery.value)
const fetchDistrictsAndOffices = () => store.fetchDistrictsAndOffices()
const openModal = (user = null) => {
  officeSearchQuery.value = ''
  store.openModal(user)
}
const closeModal = () => {
  officeSearchQuery.value = ''
  store.closeModal()
}

const saveUser = async () => {
  const result = await store.saveUser()
  if (result && !result.success) {
    alert(result.message)
  }
}

const toggleUserStatus = (id, action) => store.toggleUserStatus(id, action)

onMounted(() => {
  fetchUsers()
  fetchDistrictsAndOffices()
})
</script>
