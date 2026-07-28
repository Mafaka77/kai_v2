<template>
  <MainLayout>
    <div class="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden relative">
      <!-- Header -->
      <div class="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <h2 class="text-lg font-bold text-slate-800">Districts Management</h2>
        <button @click="openModal()" class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Add District
        </button>
      </div>

      <!-- Search -->
      <div class="p-6 pb-2">
        <div class="relative max-w-sm">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input type="text" v-model="searchQuery" @input="fetchDistricts" class="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Search districts...">
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto p-6 pt-2">
        <table class="min-w-full divide-y divide-slate-200">
          <thead>
            <tr>
              <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">District Code</th>
              <th scope="col" class="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">District Name</th>
              <th scope="col" class="px-3 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-slate-100">
            <tr v-if="loading">
              <td colspan="3" class="px-3 py-8 text-center text-slate-500">Loading districts...</td>
            </tr>
            <tr v-else-if="districts.length === 0">
              <td colspan="3" class="px-3 py-8 text-center text-slate-500">No districts found.</td>
            </tr>
            <tr v-else v-for="district in districts" :key="district.id" class="hover:bg-slate-50 transition-colors">
              <td class="px-3 py-4 whitespace-nowrap">
                <div class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                  {{ district.code }}
                </div>
              </td>
              <td class="px-3 py-4 whitespace-nowrap">
                <div class="text-sm font-semibold text-slate-800">{{ district.name }}</div>
              </td>
              <td class="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button @click="openModal(district)" class="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-md mr-2">Edit</button>
                <button @click="deleteDistrict(district.id)" class="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- CRUD Modal -->
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900/50 backdrop-blur-sm p-4">
        <div class="relative w-full max-w-md bg-white rounded-2xl shadow-xl">
          <!-- Modal Header -->
          <div class="flex items-center justify-between p-5 border-b border-slate-100">
            <h3 class="text-lg font-bold text-slate-800">
              {{ isEditing ? 'Edit District' : 'Add New District' }}
            </h3>
            <button @click="closeModal" class="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          <!-- Modal Body -->
          <div class="p-6">
            <form @submit.prevent="saveDistrict">
              <div class="mb-4">
                <label class="block text-sm font-semibold text-slate-700 mb-1">District Code</label>
                <input v-model="form.code" type="text" required class="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="e.g. AIZ">
              </div>
              <div class="mb-6">
                <label class="block text-sm font-semibold text-slate-700 mb-1">District Name</label>
                <input v-model="form.name" type="text" required class="block w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="e.g. Aizawl">
              </div>
              
              <div class="flex items-center justify-end gap-3">
                <button type="button" @click="closeModal" class="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Cancel
                </button>
                <button type="submit" :disabled="saving" class="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 flex items-center gap-2">
                  <svg v-if="saving" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  {{ isEditing ? 'Save Changes' : 'Create District' }}
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
import { ref, onMounted } from 'vue'
import MainLayout from '../../layouts/MainLayout.vue'
import api from '../../plugins/axios'
import { useDialogStore } from '../../stores/dialog'
import { useNotificationStore } from '../../stores/notification'

const dialog = useDialogStore()
const toast = useNotificationStore()

const districts = ref([])
const loading = ref(false)
const searchQuery = ref('')
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const saving = ref(false)

const form = ref({
  code: '',
  name: ''
})

const fetchDistricts = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (searchQuery.value) params.append('search', searchQuery.value)
    
    const response = await api.get(`/districts?${params.toString()}`)
    if (response.data && response.data.status === 'success') {
      districts.value = response.data.data
    }
  } catch (error) {
    console.error('Failed to fetch districts', error)
  } finally {
    loading.value = false
  }
}

const openModal = (district = null) => {
  if (district) {
    isEditing.value = true
    editingId.value = district.id
    form.value = {
      code: district.code || '',
      name: district.name || ''
    }
  } else {
    isEditing.value = false
    editingId.value = null
    form.value = {
      code: '',
      name: ''
    }
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const saveDistrict = async () => {
  saving.value = true
  try {
    const url = isEditing.value ? `/districts/${editingId.value}` : '/districts'
    const method = isEditing.value ? 'put' : 'post'
    
    const response = await api[method](url, {
      code: form.value.code,
      name: form.value.name
    })
    
    if (response.data && response.data.status === 'success') {
      closeModal()
      toast.success(isEditing.value ? 'District updated successfully' : 'District created successfully')
      fetchDistricts()
    } else {
      toast.error(response.data?.message || 'Error saving district')
    }
  } catch (error) {
    console.error('Failed to save district', error)
    toast.error(error.response?.data?.message || 'An error occurred while saving.')
  } finally {
    saving.value = false
  }
}

const deleteDistrict = async (id) => {
  const ok = await dialog.confirm({
    title: 'Delete District',
    message: 'Are you sure you want to delete this district? This action cannot be undone.',
    type: 'danger',
    confirmText: 'Delete'
  })
  if (!ok) return
  
  try {
    const response = await api.delete(`/districts/${id}`)
    if (response.data && response.data.status === 'success') {
      toast.success('District deleted successfully')
      fetchDistricts()
    } else {
      toast.error(response.data?.message || 'Error deleting district')
    }
  } catch (error) {
    console.error('Failed to delete district', error)
    toast.error(error.response?.data?.message || 'An error occurred while deleting.')
  }
}

onMounted(() => {
  fetchDistricts()
})
</script>
