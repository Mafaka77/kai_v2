<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <!-- Stat 1: Today's Status -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center hover:shadow-md transition-all">
      <div class="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mr-5 shrink-0 font-bold">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </div>
      <div>
        <div class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Today Punch</div>
        <div class="text-lg font-black text-slate-800">
          <span v-if="loading" class="animate-pulse bg-slate-200 h-6 w-16 block rounded"></span>
          <span v-else-if="stats.today_signin" class="text-emerald-600 font-bold text-base flex items-center gap-1">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            {{ formatTime(stats.today_signin) }}
          </span>
          <span v-else class="text-slate-400 font-medium text-sm">Not Punched</span>
        </div>
      </div>
    </div>

    <!-- Stat 2: Monthly Sign-ins -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center hover:shadow-md transition-all">
      <div class="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mr-5 shrink-0 font-bold">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </div>
      <div>
        <div class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Monthly Days</div>
        <div class="text-3xl font-black text-slate-800">
          <span v-if="loading" class="animate-pulse bg-slate-200 h-8 w-16 block rounded"></span>
          <span v-else>{{ stats.attendances_this_month || 0 }}</span>
        </div>
        <p class="text-[10px] text-slate-400 font-medium mt-1">Days present this month</p>
      </div>
    </div>

    <!-- Stat 3: My Pending Appeals -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center hover:shadow-md transition-all">
      <div class="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mr-5 shrink-0 font-bold">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </div>
      <div>
        <div class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">My Appeals</div>
        <div class="text-3xl font-black text-slate-800">
          <span v-if="loading" class="animate-pulse bg-slate-200 h-8 w-16 block rounded"></span>
          <span v-else>{{ stats.pending_appeals || 0 }}</span>
        </div>
        <router-link to="/attendance-appeal" class="text-[10px] text-amber-600 hover:underline font-semibold mt-1 inline-block">View Appeals &rarr;</router-link>
      </div>
    </div>

    <!-- Stat 4: My Office Transfer Requests -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center hover:shadow-md transition-all">
      <div class="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mr-5 shrink-0 font-bold">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
      </div>
      <div>
        <div class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">My Transfers</div>
        <div class="text-3xl font-black text-slate-800">
          <span v-if="loading" class="animate-pulse bg-slate-200 h-8 w-16 block rounded"></span>
          <span v-else>{{ stats.pending_posting_requests || 0 }}</span>
        </div>
        <router-link to="/change-office" class="text-[10px] text-rose-600 hover:underline font-semibold mt-1 inline-block">View Requests &rarr;</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false }
})

const formatTime = (dt) => {
  if (!dt) return ''
  return new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}
</script>
