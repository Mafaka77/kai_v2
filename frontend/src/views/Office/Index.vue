<template>
  <MainLayout>
    <div class="space-y-8">
      
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Offices Management</h1>
          <p class="text-slate-500 mt-1 text-sm">Configure and manage offices, locations, working timings, and geofencing configurations.</p>
        </div>
        <button 
          @click="openModal()" 
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm shadow-lg shadow-indigo-100 hover:shadow-indigo-200 transition-all transform active:scale-95 flex items-center justify-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Office
        </button>
      </div>

      <!-- Main Content Card -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        <!-- Search Header -->
        <div class="p-6 border-b border-slate-100 bg-slate-50/30">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <h2 class="text-lg font-semibold text-slate-800">All Offices</h2>
            
            <div class="relative w-full lg:w-80">
              <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input 
                v-model="searchQuery" 
                @input="onSearch" 
                type="text" 
                placeholder="Search offices..." 
                class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all shadow-inner"
              />
            </div>
          </div>
        </div>

        <!-- Table / Empty State -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-24 text-slate-400">
          <svg class="animate-spin h-10 w-10 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-sm font-medium">Loading offices...</span>
        </div>

        <div v-else-if="offices.length === 0" class="p-6 text-center text-slate-500 py-24">
          <svg class="w-16 h-16 mx-auto text-slate-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p class="text-slate-700 font-semibold text-lg">No offices found</p>
          <p class="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
            Try adjusting your search query or add a new office listing.
          </p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full border-collapse text-left">
            <thead>
              <tr class="bg-slate-50 border-b border-slate-100">
                <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider w-[35%]">Office Name</th>
                <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider w-[25%]">District</th>
                <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider w-[25%]">Timings & Grace</th>
                <th class="text-slate-500 font-semibold text-xs uppercase px-6 py-4.5 tracking-wider w-[15%] text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr 
                v-for="office in offices" 
                :key="office.id" 
                class="hover:bg-slate-50/50 transition-colors group"
              >
                <!-- Name -->
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-semibold text-sm group-hover:bg-indigo-100 transition-colors shrink-0">
                      {{ office.name.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-slate-800">{{ office.name }}</div>
                      <div class="text-[11px] text-slate-400 font-mono mt-0.5">Primary: {{ office.lat }}, {{ office.lng }}</div>
                      <div v-if="office.lat2 && office.lng2" class="text-[11px] text-slate-500 font-mono mt-0.5">2nd: {{ office.lat2 }}, {{ office.lng2 }}</div>
                    </div>
                  </div>
                </td>

                <!-- District -->
                <td class="px-6 py-4">
                  <span class="text-sm text-slate-600 font-medium">{{ office.District?.name || 'N/A' }}</span>
                </td>

                <!-- Timings -->
                <td class="px-6 py-4">
                  <div class="text-sm text-slate-700 font-semibold">{{ formatTime(office.start_time) }} - {{ formatTime(office.close_time) }}</div>
                  <div class="text-[11px] text-slate-400 mt-0.5 font-medium">{{ office.grace_period }} min grace · {{ office.radius }}m radius</div>
                </td>

                <!-- Actions -->
                <td class="px-6 py-4 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <button 
                      @click="openModal(office)" 
                      class="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all font-bold text-xs cursor-pointer"
                    >
                      Edit
                    </button>
                    <button 
                      @click="deleteOffice(office.id)" 
                      class="text-rose-600 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl transition-all font-bold text-xs cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <div v-if="offices.length > 0" class="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-xs text-slate-500">
            Showing <span class="font-bold text-slate-700">{{ paginationRange.from }}</span> to 
            <span class="font-bold text-slate-700">{{ paginationRange.to }}</span> of 
            <span class="font-bold text-slate-700">{{ pagination.total }}</span> offices
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

      <!-- CRUD Modal -->
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
        <div class="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-y-auto max-h-[95vh] flex flex-col">
          
          <!-- Modal Header -->
          <div class="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0">
            <h3 class="font-bold text-slate-900 text-base">
              {{ isEditing ? 'Edit Office' : 'Add New Office' }}
            </h3>
            <button @click="closeModal" class="text-slate-400 hover:text-slate-600 cursor-pointer">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Modal Body -->
          <form @submit.prevent="saveOffice" class="p-6 space-y-5">
            <div>
              <label class="block font-semibold text-slate-700 text-xs mb-1.5">Office Name *</label>
              <input v-model="form.name" type="text" required class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500">
            </div>
            
            <div>
              <label class="block font-semibold text-slate-700 text-xs mb-1.5">District *</label>
              <select v-model="form.district_id" required class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 bg-white">
                <option value="" disabled>Select a district...</option>
                <option v-for="district in districtsList" :key="district.id" :value="district.id">
                  {{ district.name }}
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block font-semibold text-slate-700 text-xs mb-1.5">Latitude *</label>
                <input v-model="form.lat" type="text" required class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500">
              </div>
              <div>
                <label class="block font-semibold text-slate-700 text-xs mb-1.5">Longitude *</label>
                <input v-model="form.lng" type="text" required class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500">
              </div>
            </div>

            <!-- Secondary Campus / Location Fields -->
            <div class="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-700">Secondary Campus Location</span>
                <span class="text-[10px] text-slate-400 font-medium">(Optional second geofence location)</span>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block font-semibold text-slate-600 text-[11px] mb-1">Latitude 2</label>
                  <input v-model="form.lat2" type="text" placeholder="e.g. 23.7365" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500">
                </div>
                <div>
                  <label class="block font-semibold text-slate-600 text-[11px] mb-1">Longitude 2</label>
                  <input v-model="form.lng2" type="text" placeholder="e.g. 92.7176" class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500">
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block font-semibold text-slate-700 text-xs mb-1.5">Radius (meters) *</label>
                <input v-model="form.radius" type="number" required class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500">
              </div>
              <div>
                <label class="block font-semibold text-slate-700 text-xs mb-1.5">Grace Period (mins) *</label>
                <input v-model="form.grace_period" type="number" required class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500">
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block font-semibold text-slate-700 text-xs mb-1.5">Start Time *</label>
                <input v-model="form.start_time" type="time" required class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500">
              </div>
              <div>
                <label class="block font-semibold text-slate-700 text-xs mb-1.5">Close Time *</label>
                <input v-model="form.close_time" type="time" required class="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500">
              </div>
            </div>
            
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                @click="closeModal" 
                class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                :disabled="saving" 
                class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-100 disabled:opacity-70 flex items-center gap-2 cursor-pointer"
              >
                <svg v-if="saving" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isEditing ? 'Save Changes' : 'Create Office' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import MainLayout from '../../layouts/MainLayout.vue'
import { useOfficeStore } from '../../stores/office'
import { useNotificationStore } from '../../stores/notification'

const toast = useNotificationStore()
const store = useOfficeStore()

const {
  offices,
  districtsList,
  loading,
  showModal,
  isEditing,
  saving,
  form,
  pagination,
  paginationRange
} = storeToRefs(store)

const searchQuery = ref('')

const fetchOffices = () => store.fetchOffices(searchQuery.value)
const onSearch = () => {
  store.pagination.page = 1
  fetchOffices()
}
const changePage = (newPage) => store.changePage(newPage, searchQuery.value)
const fetchDistricts = () => store.fetchDistricts()
const openModal = (office = null) => store.openModal(office)
const closeModal = () => store.closeModal()
const saveOffice = () => store.saveOffice(toast)
const deleteOffice = (id) => store.deleteOffice(id, toast)

const formatTime = (t) => {
  if (!t) return '—'
  return t.slice(0, 5)
}

onMounted(() => {
  fetchOffices()
  fetchDistricts()
})
</script>
