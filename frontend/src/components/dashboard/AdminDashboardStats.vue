<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
    <!-- Stat 1: Total Users -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center hover:shadow-md transition-all">
      <div class="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mr-5 shrink-0 font-bold">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
      </div>
      <div>
        <div class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Users</div>
        <div class="text-3xl font-black text-slate-800">
          <span v-if="loading" class="animate-pulse bg-slate-200 h-8 w-16 block rounded"></span>
          <span v-else>{{ stats.users || 0 }}</span>
        </div>
      </div>
    </div>

    <!-- Stat 2: Total Offices -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center hover:shadow-md transition-all">
      <div class="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mr-5 shrink-0 font-bold">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
      </div>
      <div>
        <div class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Offices</div>
        <div class="text-3xl font-black text-slate-800">
          <span v-if="loading" class="animate-pulse bg-slate-200 h-8 w-16 block rounded"></span>
          <span v-else>{{ stats.offices || 0 }}</span>
        </div>
        <p v-if="!loading" class="text-[10px] text-blue-600 font-semibold mt-1">
          {{ stats.active_offices || 0 }} active with sign-ins
        </p>
      </div>
    </div>

    <!-- Stat 3: Sign-ins (Today/Yesterday) -->
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
      </div>
    </div>

    <!-- Stat 4: Users on Active Leave -->
    <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex items-center hover:shadow-md transition-all">
      <div class="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mr-5 shrink-0 font-bold">
        <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div>
        <div class="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">On Active Leave</div>
        <div class="text-3xl font-black text-slate-800">
          <span v-if="loading" class="animate-pulse bg-slate-200 h-8 w-16 block rounded"></span>
          <span v-else>{{ stats.employees_on_leave || 0 }}</span>
        </div>
        <p v-if="!loading" class="text-[10px] text-amber-600 font-semibold mt-1">users currently on leave</p>
      </div>
    </div>
  </div>

</template>

<script setup>
defineProps({
  stats: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false }
})
</script>
