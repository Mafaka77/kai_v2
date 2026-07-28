<template>
  <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
      <div>
        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>👥</span>
          <span>Staff Attendance Breakdown ({{ dateLabel }})</span>
        </h3>
        <p class="text-xs text-slate-400 mt-0.5">
          Real-time sign-in logs for employees in {{ officeName || 'your office' }}
        </p>
      </div>

      <!-- Search Box -->
      <div class="relative w-full sm:w-64">
        <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input 
          v-model="search"
          type="text" 
          placeholder="Filter employee..."
          class="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>
    </div>

    <!-- Attendance Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs text-slate-600">
        <thead class="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
          <tr>
            <th class="py-3 px-4">Employee</th>
            <th class="py-3 px-4">Designation</th>
            <th class="py-3 px-4">Sign In Time</th>
            <th class="py-3 px-4">Sign Out Time</th>
            <th class="py-3 px-4 text-right">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="filteredUsers.length === 0">
            <td colspan="5" class="py-8 text-center text-slate-400 font-medium">
              No staff attendance records found
            </td>
          </tr>
          <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-slate-50/80 transition-colors">
            <td class="py-3 px-4">
              <div class="font-bold text-slate-900">{{ user.full_name }}</div>
              <div class="text-[10px] text-slate-400 font-mono">{{ user.mobile || 'No mobile' }}</div>
            </td>
            <td class="py-3 px-4 font-medium text-slate-600">
              {{ user.designation }}
            </td>
            <td class="py-3 px-4 font-semibold text-slate-800">
              <span v-if="user.signin_at" class="flex items-center gap-1 text-slate-700">
                <svg class="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ formatTime(user.signin_at) }}
              </span>
              <span v-else class="text-slate-300 font-mono text-[11px]">—</span>
            </td>
            <td class="py-3 px-4 font-semibold text-slate-800">
              <span v-if="user.signout_at" class="flex items-center gap-1 text-slate-700">
                <svg class="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {{ formatTime(user.signout_at) }}
              </span>
              <span v-else class="text-slate-300 font-mono text-[11px]">—</span>
            </td>
            <td class="py-3 px-4 text-right">
              <span 
                v-if="user.status === 'Present'"
                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Present
              </span>
              <span 
                v-else-if="user.status === 'Late'"
                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Late
              </span>
              <span 
                v-else
                class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                Absent
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  users: { type: Array, default: () => [] },
  officeName: { type: String, default: '' },
  dateLabel: { type: String, default: 'Today' }
})

const search = ref('')

const filteredUsers = computed(() => {
  if (!search.value) return props.users
  const q = search.value.toLowerCase()
  return props.users.filter(u => 
    u.full_name?.toLowerCase().includes(q) ||
    u.designation?.toLowerCase().includes(q) ||
    u.status?.toLowerCase().includes(q)
  )
})

const formatTime = (dt) => {
  if (!dt) return ''
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}
</script>
