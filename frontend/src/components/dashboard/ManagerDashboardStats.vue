<template>
  <div class="space-y-6 mb-8">
    
    <!-- Top 4 Metric Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Stat 1: Office Employees -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center hover:shadow-md transition-all">
        <div class="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mr-5 shrink-0 font-bold">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        </div>
        <div>
          <div class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Office Staff</div>
          <div class="text-3xl font-black text-slate-800">
            <span v-if="loading" class="animate-pulse bg-slate-200 h-8 w-16 block rounded"></span>
            <span v-else>{{ stats.office_users || 0 }}</span>
          </div>
          <p class="text-[10px] text-indigo-600 font-semibold mt-1">{{ stats.office_name || 'Assigned Office' }}</p>
        </div>
      </div>

      <!-- Stat 2: Today's Sign-ins -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center hover:shadow-md transition-all">
        <div class="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mr-5 shrink-0 font-bold">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <div class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{{ stats.date_label ? `${stats.date_label} Sign-ins` : 'Today Sign-ins' }}</div>
          <div class="text-3xl font-black text-slate-800">
            <span v-if="loading" class="animate-pulse bg-slate-200 h-8 w-16 block rounded"></span>
            <span v-else>{{ stats.attendances_today || 0 }}</span>
          </div>
          <p class="text-[10px] text-slate-400 font-medium mt-1">{{ stats.date_label || "Today's office attendance" }}</p>
        </div>
      </div>

      <!-- Stat 3: Pending Appeals -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center hover:shadow-md transition-all">
        <div class="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mr-5 shrink-0 font-bold">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <div class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Pending Appeals</div>
          <div class="text-3xl font-black text-slate-800">
            <span v-if="loading" class="animate-pulse bg-slate-200 h-8 w-16 block rounded"></span>
            <span v-else>{{ stats.pending_appeals || 0 }}</span>
          </div>
          <router-link to="/appeals" class="text-[10px] text-amber-600 hover:underline font-semibold mt-1 inline-block">View Appeals &rarr;</router-link>
        </div>
      </div>

      <!-- Stat 4: Employees on Leave -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center hover:shadow-md transition-all">
        <div class="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mr-5 shrink-0 font-bold">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        </div>
        <div>
          <div class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Employees on Leave</div>
          <div class="text-3xl font-black text-slate-800">
            <span v-if="loading" class="animate-pulse bg-slate-200 h-8 w-16 block rounded"></span>
            <span v-else>{{ stats.employees_on_leave_count || 0 }}</span>
          </div>
          <p class="text-[10px] text-purple-600 font-semibold mt-1">Currently on leave today</p>
        </div>
      </div>
    </div>

    <!-- Recent Approval Required Requests Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- Panel 1: Recent Attendance Appeals Approval Required -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
              ⚠️
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900">Appeals Pending Approval</h3>
              <p class="text-[11px] text-slate-400">Attendance appeal requests from office staff</p>
            </div>
          </div>
          <router-link to="/appeals" class="text-xs font-bold text-amber-600 hover:underline">
            View All ({{ stats.pending_appeals || 0 }})
          </router-link>
        </div>

        <!-- Appeals List -->
        <div class="space-y-3">
          <div v-if="loading" class="space-y-2">
            <div v-for="i in 3" :key="i" class="animate-pulse bg-slate-100 h-14 rounded-xl"></div>
          </div>

          <div v-else-if="!stats.recent_appeals || stats.recent_appeals.length === 0" class="py-6 text-center text-slate-400 text-xs font-medium">
            No pending attendance appeals requiring approval 🎉
          </div>

          <div 
            v-else
            v-for="appeal in stats.recent_appeals" 
            :key="appeal.id"
            class="p-3.5 bg-slate-50/80 hover:bg-slate-100/80 rounded-xl border border-slate-100 flex items-center justify-between gap-3 transition-colors"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-900">{{ appeal.employee_name }}</span>
                <span class="text-[10px] text-slate-400 font-medium">({{ appeal.designation }})</span>
                <span class="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-800 font-semibold rounded-md">Pending</span>
              </div>
              <p class="text-[11px] text-slate-500 line-clamp-1">
                <strong>Date:</strong> {{ formatDate(appeal.start_date) }} <span v-if="appeal.end_date && appeal.end_date !== appeal.start_date">to {{ formatDate(appeal.end_date) }}</span> • <em>"{{ appeal.reason }}"</em>
              </p>
            </div>

            <!-- Approve & Reject Action Buttons for Appeals -->
            <div class="flex items-center gap-2 shrink-0">
              <button 
                @click="approveAppeal(appeal.id)" 
                :disabled="processingAppealId === appeal.id"
                class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
              >
                <svg v-if="processingAppealId === appeal.id" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Approve</span>
              </button>

              <button 
                @click="rejectAppeal(appeal.id)" 
                :disabled="processingAppealId === appeal.id"
                class="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 active:bg-rose-100 text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Panel 2: Device Approval Required List -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              📱
            </div>
            <div>
              <h3 class="text-sm font-bold text-slate-900">Device Approval Required</h3>
              <p class="text-[11px] text-slate-400">Mobile binding requests (Pending Approval)</p>
            </div>
          </div>
          <router-link to="/accounts" class="text-xs font-bold text-blue-600 hover:underline">
            View Accounts ({{ stats.pending_devices || 0 }})
          </router-link>
        </div>

        <!-- Devices Approval Required List -->
        <div class="space-y-3">
          <div v-if="loading" class="space-y-2">
            <div v-for="i in 3" :key="i" class="animate-pulse bg-slate-100 h-14 rounded-xl"></div>
          </div>

          <div v-else-if="!stats.recent_device_requests || stats.recent_device_requests.length === 0" class="py-6 text-center text-slate-400 text-xs font-medium">
            No device binding requests requiring approval 🎉
          </div>

          <div 
            v-else
            v-for="dev in stats.recent_device_requests" 
            :key="dev.id"
            class="p-3.5 bg-slate-50/80 hover:bg-slate-100/80 rounded-xl border border-slate-100 flex items-center justify-between gap-3 transition-colors"
          >
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-900">{{ dev.employee_name }}</span>
                <span class="text-[10px] text-slate-400 font-medium">({{ dev.designation }})</span>
                <span class="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-700 font-semibold rounded-md border border-amber-200">
                  {{ dev.status || 'Pending' }}
                </span>
              </div>
              <p class="text-[11px] text-slate-500 line-clamp-1">
                <strong>Device:</strong> {{ dev.device_name }} <span class="text-slate-400 font-mono">({{ dev.device_uid }})</span>
              </p>
            </div>

            <!-- Approve & Reject Action Buttons for Devices -->
            <div class="flex items-center gap-2 shrink-0">
              <button 
                @click="approveDevice(dev.id)" 
                :disabled="processingDeviceId === dev.id"
                class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1"
              >
                <svg v-if="processingDeviceId === dev.id" class="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Approve</span>
              </button>

              <button 
                @click="rejectDevice(dev.id)" 
                :disabled="processingDeviceId === dev.id"
                class="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 active:bg-rose-100 text-slate-600 font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useManagerDashboardStore } from '../../stores/managerDashboard'

const props = defineProps({
  stats: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false }
})

const managerDashboardStore = useManagerDashboardStore()
const { processingDeviceId, processingAppealId } = storeToRefs(managerDashboardStore)

const approveAppeal = (appealId) => managerDashboardStore.approveAppeal(appealId, props.stats)
const rejectAppeal  = (appealId) => managerDashboardStore.rejectAppeal(appealId, props.stats)
const approveDevice = (deviceId) => managerDashboardStore.approveDevice(deviceId, props.stats)
const rejectDevice  = (deviceId) => managerDashboardStore.rejectDevice(deviceId, props.stats)

const formatDate = (d) => {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}
</script>
