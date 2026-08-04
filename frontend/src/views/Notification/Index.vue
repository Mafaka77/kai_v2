<template>
  <MainLayout>
    <div class="space-y-8 max-w-7xl mx-auto">
      <!-- Page Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Push Notifications</h1>
            <span 
              class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-2xs"
              :class="userRole === 'Admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'"
            >
              {{ userRole === 'Admin' ? '👑 Admin (System-Wide)' : '🏢 Manager (Office-Scoped)' }}
            </span>
          </div>
          <p class="text-slate-500 mt-1 text-sm">
            {{ userRole === 'Admin' 
                ? 'Send Firebase push notifications to all employees or specific office departments.' 
                : 'Send Firebase push notifications to employees in your managed offices.' 
            }}
          </p>
        </div>

        <button 
          @click="openModal" 
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-100 transition-all cursor-pointer self-start md:self-auto"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span>Send Push Notification</span>
        </button>
      </div>

      <!-- Main Notifications Table Card -->
      <div class="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        <div class="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h2 class="text-base font-bold text-slate-800">Sent Notification History</h2>
          </div>

          <div class="text-xs font-semibold text-slate-500">
            Total Sent: <span class="font-bold text-slate-900">{{ pagination.total }}</span>
          </div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/80 border-b border-slate-100 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                <th class="py-3.5 px-6">Notification Details</th>
                <th class="py-3.5 px-6">Target Scope</th>
                <th class="py-3.5 px-6">Action Link</th>
                <th class="py-3.5 px-6">Sent Date</th>
                <th class="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-sm">
              <tr v-if="loading">
                <td colspan="5" class="py-12 text-center text-slate-400 font-medium">
                  <div class="flex flex-col items-center justify-center gap-2">
                    <svg class="animate-spin h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading push notifications...</span>
                  </div>
                </td>
              </tr>

              <tr v-else-if="notifications.length === 0">
                <td colspan="5" class="py-12 text-center text-slate-400">
                  <svg class="w-10 h-10 mx-auto text-slate-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <p class="font-semibold text-sm">No notification records found.</p>
                  <p class="text-xs text-slate-400 mt-1">Click "Send Push Notification" above to broadcast a new message.</p>
                </td>
              </tr>

              <tr 
                v-else 
                v-for="item in notifications" 
                :key="item.id"
                class="hover:bg-slate-50/70 transition-colors"
              >
                <td class="py-4 px-6 max-w-xs">
                  <div class="font-bold text-slate-900 leading-snug">{{ item.title }}</div>
                  <div class="text-xs text-slate-500 line-clamp-2 mt-0.5">{{ item.body }}</div>
                </td>

                <td class="py-4 px-6 whitespace-nowrap">
                  <span 
                    v-if="!item.office_id" 
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/80"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                    System-Wide (All Employees)
                  </span>
                  <span 
                    v-else 
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/80"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    {{ item.Office?.name || 'Office #' + item.office_id }}
                  </span>
                </td>

                <td class="py-4 px-6 whitespace-nowrap">
                  <a 
                    v-if="item.url" 
                    :href="item.url" 
                    target="_blank" 
                    class="text-xs font-semibold text-indigo-600 hover:text-indigo-800 underline truncate max-w-[180px] inline-block"
                  >
                    {{ item.url }}
                  </a>
                  <span v-else class="text-xs text-slate-400 italic">None</span>
                </td>

                <td class="py-4 px-6 whitespace-nowrap text-xs font-medium text-slate-600">
                  {{ formatDateReadable(item.created_at || item.schedule_at) }}
                </td>

                <td class="py-4 px-6 whitespace-nowrap text-right">
                  <button 
                    @click="deleteNotification(item.id)" 
                    class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Notification"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Footer -->
        <div v-if="notifications.length > 0" class="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-xs text-slate-500 font-medium">
            Page <span class="font-bold text-slate-800">{{ pagination.page }}</span> of <span class="font-bold text-slate-800">{{ pagination.totalPages || 1 }}</span>
          </div>

          <div class="flex items-center gap-2">
            <button 
              @click="changePage(pagination.page - 1)" 
              :disabled="!pagination.hasPrevPage || loading"
              class="px-3.5 py-1.5 bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl shadow-2xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              Previous
            </button>
            <button 
              @click="changePage(pagination.page + 1)" 
              :disabled="!pagination.hasNextPage || loading"
              class="px-3.5 py-1.5 bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl shadow-2xs hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Send Push Notification Modal -->
      <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-lg overflow-hidden transform transition-all">
          <div class="p-6 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <h3 class="font-bold text-slate-900 text-lg">Send Push Notification</h3>
                <p class="text-xs text-slate-500 font-medium">Broadcast message to employee devices</p>
              </div>
            </div>
            <button @click="closeModal" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="sendNotification" class="p-6 space-y-4">
            <!-- Target Audience Dropdown -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Target Audience / Office *
              </label>
              
              <select 
                v-model="form.office_id" 
                required 
                class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 font-semibold bg-white"
              >
                <option v-if="userRole === 'Admin'" value="all">
                  🌐 All Employees (System Wide)
                </option>
                <option v-else value="all">
                  🏢 All My Managed Offices
                </option>

                <option v-for="off in offices" :key="off.id" :value="off.id">
                  🏢 Office: {{ off.name }}
                </option>
              </select>

              <p class="text-[11px] text-slate-400 mt-1 font-medium">
                {{ userRole === 'Admin' 
                    ? 'Admins can broadcast system-wide to all users or target a specific office department.' 
                    : 'Managers can only target employees belonging to their managed offices.' 
                }}
              </p>
            </div>

            <!-- Title -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Notification Title *
              </label>
              <input 
                type="text" 
                v-model="form.title" 
                required 
                placeholder="e.g. Office Announcement / Important Update"
                class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 font-medium"
              />
            </div>

            <!-- Message Body -->
            <div>
              <div class="flex items-center justify-between mb-1">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Message Body *
                </label>
                <span class="text-[11px] font-semibold text-slate-400">{{ form.body.length }}/500</span>
              </div>
              <textarea 
                v-model="form.body" 
                rows="4" 
                required 
                maxlength="500"
                placeholder="Type your message to be delivered to employee phones..."
                class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 font-medium"
              ></textarea>
            </div>

            <!-- Optional Link / Action URL -->
            <div>
              <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Optional Action URL / Link
              </label>
              <input 
                type="url" 
                v-model="form.url" 
                placeholder="https://example.com/announcement"
                class="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-slate-800 font-medium"
              />
            </div>

            <!-- Modal Footer -->
            <div class="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button 
                type="button" 
                @click="closeModal" 
                class="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                :disabled="sending"
                class="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <svg v-if="sending" class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ sending ? 'Sending Notification...' : 'Send Push Notification' }}</span>
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
import MainLayout from '../../layouts/MainLayout.vue'
import api from '../../plugins/axios'

const notifications = ref([])
const offices = ref([])
const userRole = ref('Manager')
const loading = ref(false)
const sending = ref(false)
const showModal = ref(false)

const pagination = ref({
  total: 0,
  page: 1,
  limit: 15,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false
})

const form = ref({
  office_id: 'all',
  title: '',
  body: '',
  url: ''
})

const fetchNotifications = async (page = 1) => {
  loading.value = true
  try {
    const res = await api.get(`/notifications?page=${page}&limit=${pagination.value.limit}`)
    if (res.data?.status === 'success') {
      notifications.value = res.data.data || []
      offices.value = res.data.offices || []
      userRole.value = res.data.role || 'Manager'
      if (res.data.pagination) {
        pagination.value = res.data.pagination
      }
    }
  } catch (err) {
    console.error('Failed to fetch notifications', err)
  } finally {
    loading.value = false
  }
}

const changePage = (newPage) => {
  if (newPage < 1 || newPage > pagination.value.totalPages) return
  fetchNotifications(newPage)
}

const openModal = () => {
  form.value = {
    office_id: 'all',
    title: '',
    body: '',
    url: ''
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const sendNotification = async () => {
  if (!form.value.title || !form.value.body) return
  sending.value = true
  try {
    const payload = {
      office_id: form.value.office_id,
      title: form.value.title,
      body: form.value.body,
      url: form.value.url || null
    }

    const res = await api.post('/notifications', payload)
    if (res.data?.status === 'success') {
      closeModal()
      await fetchNotifications(1)
      alert('Push notification sent successfully!')
    } else {
      alert(res.data?.message || 'Failed to send notification')
    }
  } catch (err) {
    console.error('Failed to send notification', err)
    alert(err.response?.data?.message || 'Error sending notification')
  } finally {
    sending.value = false
  }
}

const deleteNotification = async (id) => {
  if (!confirm('Are you sure you want to delete this notification record?')) return
  try {
    const res = await api.delete(`/notifications/${id}`)
    if (res.data?.status === 'success') {
      await fetchNotifications(pagination.value.page)
    }
  } catch (err) {
    console.error('Failed to delete notification', err)
    alert('Failed to delete notification record')
  }
}

const formatDateReadable = (dateStr) => {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchNotifications()
})
</script>
