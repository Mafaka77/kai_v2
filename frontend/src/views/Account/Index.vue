<template>
  <MainLayout>
    <div class="space-y-8">
      
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">User Accounts</h1>
          <p class="text-slate-500 mt-1 text-sm">
            Manage user accounts, active/inactive statuses, device bindings, and profile details.
          </p>
        </div>
      </div>

      <!-- Main Container Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        <!-- Status Tabs, Office Filter, Search Header -->
        <div class="p-6 border-b border-slate-100 bg-slate-50/30 space-y-4">
          
          <!-- Top Row: Status Tabs (Active / Inactive) -->
          <div class="flex items-center gap-2 border-b border-slate-200/80 pb-4">
            <button 
              @click="setStatus('active')"
              :class="[
                'px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer',
                statusTab === 'active'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              ]"
            >
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              Active Accounts
            </button>

            <button 
              @click="setStatus('inactive')"
              :class="[
                'px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer',
                statusTab === 'inactive'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-100'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              ]"
            >
              <span class="w-2 h-2 rounded-full bg-rose-400"></span>
              Inactive Accounts
            </button>
          </div>

          <!-- Bottom Row: Office Tabs & Search -->
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
            <PillTabs 
              :tabs="officeTabs" 
              :modelValue="selectedOffice" 
              @update:modelValue="setOffice" 
            />

            <!-- Search Field -->
            <div class="relative w-full lg:w-80">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 0114 0z" />
                </svg>
              </span>
              <input 
                v-model="searchQuery"
                @input="handleSearch"
                type="text" 
                placeholder="Search name or mobile..." 
                class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all shadow-inner"
              />
            </div>
          </div>

        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-24 text-slate-400">
          <svg class="animate-spin h-10 w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm font-medium">Fetching accounts...</span>
        </div>

        <!-- Empty State -->
        <div v-else-if="accounts.length === 0" class="p-6 text-center text-slate-500 py-24">
          <svg class="w-16 h-16 mx-auto text-slate-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p class="text-slate-900 font-bold text-lg">No {{ statusTab }} Accounts</p>
          <p class="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            No accounts match your current office and search criteria.
          </p>
        </div>

        <!-- EHMS Data Table -->
        <div v-else>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse text-left">
              <thead>
                <tr class="bg-slate-50 border-b border-slate-100">
                  <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider">Employee</th>
                  <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider">Mobile</th>
                  <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider">Role</th>
                  <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider">Offices</th>
                  <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider text-center">Status</th>
                  <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider text-center">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr 
                  v-for="user in accounts" 
                  :key="user.id"
                  class="hover:bg-slate-50/50 transition-colors group"
                >
                  <!-- Employee -->
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3 cursor-pointer" @click="viewDetails(user.id)">
                      <div class="w-10 h-10 rounded-xl bg-indigo-50 flex-shrink-0 flex items-center justify-center text-indigo-600 font-bold text-sm group-hover:bg-indigo-100 transition-colors border border-indigo-100">
                        {{ user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U' }}
                      </div>
                      <div>
                        <div class="font-bold text-slate-900 text-sm hover:text-indigo-600 transition-colors">{{ user.full_name }}</div>
                        <div class="text-slate-400 text-xs mt-0.5">{{ user.designation || 'Staff Member' }}</div>
                      </div>
                    </div>
                  </td>

                  <!-- Mobile -->
                  <td class="px-6 py-4 text-sm text-slate-600 font-medium">
                    {{ user.mobile || '-' }}
                  </td>

                  <!-- Role Badge -->
                  <td class="px-6 py-4">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      {{ getUserRole(user) }}
                    </span>
                  </td>

                  <!-- Office Badges -->
                  <td class="px-6 py-4">
                    <div class="flex flex-wrap gap-1.5">
                      <span 
                        v-for="office in user.Offices" 
                        :key="office.id"
                        class="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold text-[11px] rounded-lg border border-slate-200/60"
                      >
                        {{ office.name }}
                      </span>
                    </div>
                  </td>

                  <!-- Status Badge -->
                  <td class="px-6 py-4 text-center">
                    <span 
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-xs"
                      :class="[
                        user.deleted_at ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      ]"
                    >
                      <span 
                        class="w-1.5 h-1.5 rounded-full" 
                        :class="user.deleted_at ? 'bg-rose-500' : 'bg-emerald-500'"
                      ></span>
                      {{ user.deleted_at ? 'Inactive' : 'Active' }}
                    </span>
                  </td>

                  <!-- Actions -->
                  <td class="px-6 py-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <!-- View Details -->
                      <button 
                        @click="viewDetails(user.id)" 
                        class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                        title="View Account Details & Devices"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>

                      <!-- Edit Profile -->
                      <button 
                        @click="openEditModal(user)" 
                        class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                        title="Edit Account Details"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      <!-- Activate Button (if Inactive) -->
                      <button 
                        v-if="user.deleted_at"
                        @click="handleActivate(user.id)" 
                        class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                      >
                        Activate
                      </button>

                      <!-- Deactivate Button (if Active) -->
                      <button 
                        v-else
                        @click="handleDeactivate(user.id)" 
                        class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Deactivate
                      </button>
                    </div>
                  </td>

                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination Footer -->
          <div class="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="text-xs text-slate-500">
              Showing <span class="font-bold text-slate-700">{{ paginationRange.from }}</span> to 
              <span class="font-bold text-slate-700">{{ paginationRange.to }}</span> of 
              <span class="font-bold text-slate-700">{{ pagination.total }}</span> accounts
            </div>

            <div class="flex items-center gap-2">
              <button 
                @click="changePage(pagination.page - 1)"
                :disabled="!pagination.hasPrevPage"
                class="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-600 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </button>

              <span class="text-xs font-bold text-slate-600 px-2">
                Page {{ pagination.page }} of {{ pagination.totalPages || 1 }}
              </span>

              <button 
                @click="changePage(pagination.page + 1)"
                :disabled="!pagination.hasNextPage"
                class="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-600 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
              >
                <span>Next</span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- Account Details Drawer -->
      <div v-if="selectedUserDetail" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex justify-end">
        <div class="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto space-y-6 flex flex-col justify-between">
          <div>
            <!-- Header -->
            <div class="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 class="text-lg font-bold text-slate-900">Account Details</h3>
              <button @click="selectedUserDetail = null" class="text-slate-400 hover:text-slate-600 cursor-pointer">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Profile Info & Activation Bar -->
            <div class="py-6 flex flex-col items-center border-b border-slate-100">
              <div class="w-20 h-20 rounded-2xl bg-indigo-100 text-indigo-700 font-black text-2xl flex items-center justify-center mb-3">
                {{ selectedUserDetail.full_name ? selectedUserDetail.full_name.charAt(0).toUpperCase() : 'U' }}
              </div>
              <h4 class="text-lg font-bold text-slate-900">{{ selectedUserDetail.full_name }}</h4>
              <p class="text-xs font-semibold text-slate-400 mt-0.5">{{ selectedUserDetail.designation || 'Staff Member' }}</p>
              
              <div class="flex items-center gap-2 mt-3">
                <span class="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full">
                  {{ getUserRole(selectedUserDetail) }}
                </span>

                <button 
                  v-if="selectedUserDetail.deleted_at"
                  @click="handleActivate(selectedUserDetail.id)"
                  class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-xs cursor-pointer"
                >
                  Activate Account
                </button>
                <button 
                  v-else
                  @click="handleDeactivate(selectedUserDetail.id)"
                  class="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 font-bold text-xs rounded-full cursor-pointer"
                >
                  Deactivate Account
                </button>
              </div>
            </div>

            <!-- Detailed Grid -->
            <div class="py-4 space-y-4 text-xs">
              <div>
                <span class="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">Mobile Number</span>
                <span class="text-slate-800 font-bold text-sm mt-0.5 block">{{ selectedUserDetail.mobile || '-' }}</span>
              </div>
              <div>
                <span class="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">Employment Number</span>
                <span class="text-slate-800 font-bold text-sm mt-0.5 block">{{ selectedUserDetail.employee_no || '-' }}</span>
              </div>

              <!-- Assigned Offices -->
              <div>
                <span class="text-slate-400 font-semibold uppercase tracking-wider block text-[10px] mb-2">Assigned Offices</span>
                <div class="flex flex-wrap gap-1.5">
                  <span 
                    v-for="office in selectedUserDetail.Offices" 
                    :key="office.id" 
                    class="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg border border-slate-200"
                  >
                    {{ office.name }}
                  </span>
                </div>
              </div>

              <!-- Registered Devices -->
              <div>
                <span class="text-slate-400 font-semibold uppercase tracking-wider block text-[10px] mb-2">Bound Hardware Devices</span>
                <div v-if="selectedUserDetail.Devices && selectedUserDetail.Devices.length > 0" class="space-y-2">
                  <div 
                    v-for="device in selectedUserDetail.Devices" 
                    :key="device.id"
                    class="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div class="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <span class="w-2 h-2 rounded-full" :class="device.active ? 'bg-emerald-500' : 'bg-amber-500'"></span>
                        {{ device.name || 'Bound Device' }}
                      </div>
                      <div class="text-[11px] text-slate-500 font-mono mt-0.5">UID: {{ device.uid || device.id }}</div>
                    </div>
                    <div class="flex items-center gap-1">
                      <button 
                        @click="handleToggleDevice(device)"
                        class="px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer"
                        :class="device.active ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'"
                      >
                        {{ device.active ? 'Disable' : 'Enable' }}
                      </button>
                      <button 
                        @click="handleDeleteDevice(device.id)"
                        class="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Unlink Device"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                <div v-else class="text-slate-400 italic">No hardware device bound to this user.</div>
              </div>
            </div>
          </div>

          <div class="space-y-2 pt-4 border-t border-slate-100">
            <button 
              @click="openEditModal(selectedUserDetail)" 
              class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Edit Account Profile
            </button>
            <button 
              @click="handlePermanentDelete(selectedUserDetail.id)" 
              class="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Permanently Delete Account
            </button>
          </div>
        </div>
      </div>

      <!-- Edit Account Modal -->
      <div v-if="editFormUser" class="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
        <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-5">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-lg font-bold text-slate-900">Edit Account</h3>
            <button @click="editFormUser = null" class="text-slate-400 hover:text-slate-600 cursor-pointer">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="submitEditForm" class="space-y-4 text-xs">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Employment Number</label>
              <input v-model="editForm.employee_no" type="text" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500" placeholder="e.g. EMP-102" />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Full Name *</label>
              <input v-model="editForm.full_name" type="text" required class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500" />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
              <input v-model="editForm.mobile" type="text" required class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500" />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">Designation</label>
              <input v-model="editForm.designation" type="text" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500" placeholder="e.g. Assistant Inspector" />
            </div>

            <div>
              <label class="block font-semibold text-slate-700 mb-1">New Password (leave blank to keep current)</label>
              <input v-model="editForm.password" type="password" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500" placeholder="••••••••" />
            </div>

            <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button type="button" @click="editFormUser = null" class="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 cursor-pointer">
                Cancel
              </button>
              <button type="submit" :disabled="submittingEdit" class="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-sm cursor-pointer disabled:opacity-50">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MainLayout from '../../layouts/MainLayout.vue'
import PillTabs from '../../components/PillTabs.vue'
import api from '../../plugins/axios'

const accounts = ref([])
const offices = ref([])
const statusTab = ref('active')
const selectedOffice = ref(null)
const searchQuery = ref('')
const loading = ref(false)
const selectedUserDetail = ref(null)

const editFormUser = ref(null)
const submittingEdit = ref(false)
const editForm = ref({
  id: null,
  employee_no: '',
  full_name: '',
  mobile: '',
  designation: '',
  password: ''
})

const pagination = ref({
  total: 0,
  page: 1,
  limit: 15,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false
})

const paginationRange = computed(() => {
  if (pagination.value.total === 0) return { from: 0, to: 0 }
  const from = (pagination.value.page - 1) * pagination.value.limit + 1
  const to = Math.min(pagination.value.page * pagination.value.limit, pagination.value.total)
  return { from, to }
})

const officeTabs = computed(() => {
  const tabs = [{ value: '', label: 'All Offices' }]
  offices.value.forEach(o => {
    tabs.push({ value: o.id.toString(), label: o.name })
  })
  return tabs
})

const setStatus = (val) => {
  statusTab.value = val
  pagination.value.page = 1
  fetchAccounts()
}

const setOffice = (val) => {
  selectedOffice.value = val
  pagination.value.page = 1
  fetchAccounts()
}

const handleSearch = () => {
  pagination.value.page = 1
  fetchAccounts()
}

const changePage = (newPage) => {
  if (newPage < 1 || newPage > pagination.value.totalPages) return
  pagination.value.page = newPage
  fetchAccounts()
}

const fetchAccounts = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    params.append('status', statusTab.value)
    params.append('page', pagination.value.page)
    params.append('limit', pagination.value.limit)
    if (selectedOffice.value) params.append('office_id', selectedOffice.value)
    if (searchQuery.value) params.append('search', searchQuery.value)

    const response = await api.get(`/accounts?${params.toString()}`)
    if (response.data && response.data.status === 'success') {
      accounts.value = response.data.data
      offices.value = response.data.offices || []
      if (response.data.pagination) {
        pagination.value = response.data.pagination
      }
    }
  } catch (error) {
    console.error('Failed to fetch accounts', error)
  } finally {
    loading.value = false
  }
}

const viewDetails = async (id) => {
  try {
    const response = await api.get(`/accounts/${id}`)
    if (response.data && response.data.status === 'success') {
      selectedUserDetail.value = response.data.data
    }
  } catch (error) {
    console.error('Failed to load user details', error)
  }
}

const handleActivate = async (id) => {
  if (!confirm('Do you want to ACTIVATE this account?')) return
  try {
    const response = await api.put(`/accounts/${id}/activate`)
    if (response.data && response.data.status === 'success') {
      if (selectedUserDetail.value && selectedUserDetail.value.id === id) {
        selectedUserDetail.value.deleted_at = null
      }
      await fetchAccounts()
    }
  } catch (error) {
    console.error('Failed to activate account', error)
  }
}

const handleDeactivate = async (id) => {
  if (!confirm('Do you want to DEACTIVATE this account?')) return
  try {
    const response = await api.put(`/accounts/${id}/deactivate`)
    if (response.data && response.data.status === 'success') {
      if (selectedUserDetail.value && selectedUserDetail.value.id === id) {
        selectedUserDetail.value.deleted_at = new Date().toISOString()
      }
      await fetchAccounts()
    }
  } catch (error) {
    console.error('Failed to deactivate account', error)
  }
}

const handlePermanentDelete = async (id) => {
  if (!confirm('Are you sure you want to PERMANENTLY DELETE this user account and all bound devices?')) return
  try {
    const response = await api.delete(`/accounts/${id}`)
    if (response.data && response.data.status === 'success') {
      selectedUserDetail.value = null
      await fetchAccounts()
    }
  } catch (error) {
    console.error('Failed to delete account', error)
  }
}

const openEditModal = (user) => {
  editFormUser.value = user
  editForm.value = {
    id: user.id,
    employee_no: user.employee_no || '',
    full_name: user.full_name || '',
    mobile: user.mobile || '',
    designation: user.designation || '',
    password: ''
  }
}

const submitEditForm = async () => {
  submittingEdit.value = true
  try {
    const response = await api.put(`/accounts/${editForm.value.id}`, editForm.value)
    if (response.data && response.data.status === 'success') {
      editFormUser.value = null
      if (selectedUserDetail.value && selectedUserDetail.value.id === editForm.value.id) {
        selectedUserDetail.value = response.data.data
      }
      await fetchAccounts()
    }
  } catch (error) {
    console.error('Failed to update account', error)
    alert(error.response?.data?.message || 'Error updating account')
  } finally {
    submittingEdit.value = false
  }
}

const handleToggleDevice = async (device) => {
  try {
    const response = await api.put(`/accounts/devices/${device.id}/toggle`)
    if (response.data && response.data.status === 'success') {
      device.active = response.data.data.active
    }
  } catch (error) {
    console.error('Failed to toggle device', error)
  }
}

const handleDeleteDevice = async (deviceId) => {
  if (!confirm('Do you want to unlink this hardware device?')) return
  try {
    const response = await api.delete(`/accounts/devices/${deviceId}`)
    if (response.data && response.data.status === 'success') {
      if (selectedUserDetail.value && selectedUserDetail.value.Devices) {
        selectedUserDetail.value.Devices = selectedUserDetail.value.Devices.filter(d => d.id !== deviceId)
      }
    }
  } catch (error) {
    console.error('Failed to delete device', error)
  }
}

const getUserRole = (user) => {
  if (user.role) return user.role
  if (user.Roles && user.Roles.length > 0) return user.Roles[0].name
  return 'Staff'
}

onMounted(() => {
  fetchAccounts()
})
</script>
