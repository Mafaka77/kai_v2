<template>
  <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
      <div>
        <h3 class="text-base font-bold text-slate-900">
          {{ title }}
        </h3>
        <p class="text-xs text-slate-400 mt-0.5">
          {{ subtitle }}
        </p>
      </div>
      
      <!-- Interactive Filter Controls for Admin -->
      <div v-if="mode === 'admin'" class="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
        <!-- Office Search Input -->
        <div class="relative">
          <svg class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search office..."
            class="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 w-44 transition-all"
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div class="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/60">
          <button 
            @click="filterMode = 'all'"
            :class="[
              'px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer',
              filterMode === 'all' 
                ? 'bg-white text-indigo-600 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800'
            ]"
          >
            All ({{ chartData.length }})
          </button>
          <button 
            @click="filterMode = 'active'"
            :class="[
              'px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer',
              filterMode === 'active' 
                ? 'bg-white text-indigo-600 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800'
            ]"
          >
            With Sign-ins ({{ activeOfficesCount }})
          </button>
        </div>

        <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg shrink-0">
          <span v-if="searchQuery" class="text-indigo-600 font-bold">{{ filteredData.length }} result(s)</span>
          <span v-else class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          <span v-if="!searchQuery">Live Analytics</span>
        </span>
      </div>

      <div v-else>
        <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg shrink-0">
          <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          Weekly Breakdown (Mon – Today)
        </span>
      </div>
    </div>

    <!-- Chart Container -->
    <div ref="chartRef" class="w-full h-96 min-h-[380px]"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  title: { type: String, default: 'Office Attendance' },
  subtitle: { type: String, default: 'Attendance statistics chart' },
  mode: { type: String, default: 'admin' }, // 'admin' | 'manager'
  chartData: { type: Array, default: () => [] }
})

const chartRef = ref(null)
let chartInstance = null
const filterMode = ref('all') // 'all' | 'active'
const searchQuery = ref('')

const activeOfficesCount = computed(() => {
  return props.chartData.filter(item => item.count > 0).length
})

const filteredData = computed(() => {
  if (props.mode !== 'admin') return props.chartData

  let list = props.chartData

  if (filterMode.value === 'active') {
    const active = list.filter(item => item.count > 0)
    list = active.length ? active : list
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(item => item.office_name && item.office_name.toLowerCase().includes(q))
  }

  return list
})

const initChart = () => {
  if (!chartRef.value) return
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  let option = {}

  if (props.mode === 'admin') {
    // Admin: Present, Late, Absent Stacked Bar Chart for Offices
    const dataList = filteredData.value
    const categories = dataList.map(item => item.office_name)
    const presentValues = dataList.map(item => item.present || 0)
    const lateValues = dataList.map(item => item.late || 0)
    const absentValues = dataList.map(item => item.absent || 0)

    const initialEndPercentage = categories.length > 10 
      ? Math.min(100, Math.max(10, Math.floor((10 / categories.length) * 100))) 
      : 100

    option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params) => {
          if (!params || !params.length) return ''
          const officeName = params[0].name
          let present = 0
          let late = 0
          let absent = 0

          params.forEach(p => {
            if (p.seriesName === 'Present (On Time)') present = p.value
            if (p.seriesName === 'Late') late = p.value
            if (p.seriesName === 'Absent') absent = p.value
          })
          const totalStaff = present + late + absent

          return `<div class="p-2 font-sans text-xs">
            <div class="font-bold text-slate-900 text-sm mb-1.5 pb-1 border-b border-slate-100">${officeName}</div>
            <div class="space-y-1">
              <div class="flex items-center justify-between gap-4 text-emerald-600 font-semibold">
                <span>Present (On Time):</span>
                <strong>${present}</strong>
              </div>
              <div class="flex items-center justify-between gap-4 text-amber-600 font-semibold">
                <span>Late Sign-in:</span>
                <strong>${late}</strong>
              </div>
              <div class="flex items-center justify-between gap-4 text-rose-500 font-semibold">
                <span>Absent:</span>
                <strong>${absent}</strong>
              </div>
              <div class="border-t border-slate-100 pt-1 flex items-center justify-between gap-4 text-slate-700 font-bold">
                <span>Total Office Staff:</span>
                <strong>${totalStaff}</strong>
              </div>
            </div>
          </div>`
        }
      },
      legend: {
        data: ['Present (On Time)', 'Late', 'Absent'],
        top: 0,
        textStyle: { color: '#475569', fontSize: 11, fontWeight: 600 }
      },
      grid: {
        top: 40,
        right: 25,
        bottom: categories.length > 10 ? 65 : 45,
        left: 45,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories.length ? categories : ['No Data'],
        axisLabel: {
          interval: 0,
          rotate: categories.length > 5 ? 35 : 0,
          color: '#64748b',
          fontSize: 11,
          fontWeight: 600
        },
        axisLine: { lineStyle: { color: '#cbd5e1' } }
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        axisLabel: { color: '#64748b', fontSize: 11 },
        splitLine: { lineStyle: { color: '#f1f5f9' } }
      },
      dataZoom: categories.length > 10 ? [
        {
          type: 'slider',
          show: true,
          xAxisIndex: [0],
          start: 0,
          end: initialEndPercentage,
          bottom: 5,
          height: 22,
          borderColor: '#e2e8f0',
          fillerColor: 'rgba(79, 70, 229, 0.15)',
          handleStyle: { color: '#4f46e5' },
          textStyle: { color: '#64748b', fontSize: 10 }
        },
        {
          type: 'inside',
          xAxisIndex: [0],
          start: 0,
          end: initialEndPercentage
        }
      ] : [],
      series: [
        {
          name: 'Present (On Time)',
          type: 'bar',
          stack: 'attendance',
          data: presentValues.length ? presentValues : [0],
          barWidth: '40%',
          itemStyle: { color: '#10b981' } // Emerald green
        },
        {
          name: 'Late',
          type: 'bar',
          stack: 'attendance',
          data: lateValues.length ? lateValues : [0],
          barWidth: '40%',
          itemStyle: { color: '#f59e0b' } // Amber yellow
        },
        {
          name: 'Absent',
          type: 'bar',
          stack: 'attendance',
          data: absentValues.length ? absentValues : [0],
          barWidth: '40%',
          itemStyle: { color: '#f43f5e', borderRadius: [6, 6, 0, 0] } // Rose red
        }
      ]
    }
  } else {
    // Manager: Per-Employee Weekly Attendance Breakdown Chart
    const categories = props.chartData.map(item => item.employee_name)
    const presentValues = props.chartData.map(item => item.present || 0)
    const lateValues = props.chartData.map(item => item.late || 0)
    const absentValues = props.chartData.map(item => item.absent || 0)

    const initialEndPercentage = categories.length > 8 
      ? Math.min(100, Math.max(10, Math.floor((8 / categories.length) * 100))) 
      : 100

    option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params) => {
          if (!params || !params.length) return ''
          const empName = params[0].name
          let present = 0
          let late = 0
          let absent = 0

          params.forEach(p => {
            if (p.seriesName === 'Present Days') present = p.value
            if (p.seriesName === 'Late Days') late = p.value
            if (p.seriesName === 'Absent Days') absent = p.value
          })

          return `<div class="p-2 font-sans text-xs">
            <div class="font-bold text-slate-900 text-sm mb-1.5 pb-1 border-b border-slate-100">${empName}</div>
            <div class="space-y-1">
              <div class="flex items-center justify-between gap-4 text-emerald-600 font-semibold">
                <span>Present Days:</span>
                <strong>${present} days</strong>
              </div>
              <div class="flex items-center justify-between gap-4 text-amber-600 font-semibold">
                <span>Late Days:</span>
                <strong>${late} days</strong>
              </div>
              <div class="flex items-center justify-between gap-4 text-rose-500 font-semibold">
                <span>Absent Days:</span>
                <strong>${absent} days</strong>
              </div>
            </div>
          </div>`
        }
      },
      legend: {
        data: ['Present Days', 'Late Days', 'Absent Days'],
        top: 0,
        textStyle: { color: '#475569', fontSize: 11, fontWeight: 600 }
      },
      grid: {
        top: 40,
        right: 20,
        bottom: categories.length > 8 ? 65 : 45,
        left: 45,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: categories.length ? categories : ['No Staff'],
        axisLabel: {
          interval: 0,
          rotate: categories.length > 5 ? 30 : 0,
          color: '#64748b',
          fontSize: 11,
          fontWeight: 600
        },
        axisLine: { lineStyle: { color: '#cbd5e1' } }
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        max: props.chartData[0]?.working_days || 5,
        axisLabel: { color: '#64748b', fontSize: 11 },
        splitLine: { lineStyle: { color: '#f1f5f9' } }
      },
      dataZoom: categories.length > 8 ? [
        {
          type: 'slider',
          show: true,
          xAxisIndex: [0],
          start: 0,
          end: initialEndPercentage,
          bottom: 5,
          height: 22,
          borderColor: '#e2e8f0',
          fillerColor: 'rgba(79, 70, 229, 0.15)',
          handleStyle: { color: '#4f46e5' },
          textStyle: { color: '#64748b', fontSize: 10 }
        },
        {
          type: 'inside',
          xAxisIndex: [0],
          start: 0,
          end: initialEndPercentage
        }
      ] : [],
      series: [
        {
          name: 'Present Days',
          type: 'bar',
          stack: 'employee_weekly',
          data: presentValues,
          barWidth: '40%',
          itemStyle: { color: '#10b981' }
        },
        {
          name: 'Late Days',
          type: 'bar',
          stack: 'employee_weekly',
          data: lateValues,
          barWidth: '40%',
          itemStyle: { color: '#f59e0b' }
        },
        {
          name: 'Absent Days',
          type: 'bar',
          stack: 'employee_weekly',
          data: absentValues,
          barWidth: '40%',
          itemStyle: { color: '#f43f5e', borderRadius: [6, 6, 0, 0] }
        }
      ]
    }
  }

  chartInstance.setOption(option, true)
}

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

watch([() => props.chartData, filterMode, searchQuery], () => {
  initChart()
}, { deep: true })

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>
