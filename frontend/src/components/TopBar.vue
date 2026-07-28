<template>
  <header class="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 z-10 shrink-0">
    <div class="flex items-center gap-4">
      <button @click="$emit('toggle-sidebar')" class="text-slate-500 hover:text-slate-700 transition-colors focus:outline-none">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div class="text-slate-500 font-medium text-sm flex items-center gap-2">
        <span class="hover:text-blue-600 cursor-pointer transition-colors">Dashboard</span>
        <span class="text-slate-300">/</span>
        <span class="hover:text-blue-600 cursor-pointer transition-colors">Overview</span>
      </div>
    </div>
    
    <div class="flex items-center gap-4">
      <div class="hidden sm:block text-right leading-tight">
        <div class="text-slate-800 font-semibold text-sm">Administrator</div>
        <div class="text-slate-500 text-xs font-medium">Head Office</div>
      </div>
      <div class="relative cursor-pointer hover:ring-2 hover:ring-blue-100 rounded-full transition-all">
        <div class="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold shadow-sm">
          A
        </div>
      </div>
    </div>
  </header>
</template>
