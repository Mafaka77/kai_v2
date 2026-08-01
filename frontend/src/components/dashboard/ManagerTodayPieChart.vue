<template>
  <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
    <div class="flex items-center justify-between border-b border-slate-100 pb-4">
      <div>
        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>📊</span>
          <span>Attendance Ratio (Today)</span>
        </h3>
        <p class="text-xs text-slate-400 mt-0.5">
          Present, Late, and Absent breakdown
        </p>
      </div>
      <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg shrink-0">
        <span class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
        Today Status
      </span>
    </div>

    <!-- Donut Chart Container -->
    <div ref="chartRef" class="w-full h-80 min-h-[300px]"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  dateLabel: { type: String, default: 'Today' },
  chartData: { type: Array, default: () => [] }
})

const chartRef = ref(null)
let chartInstance = null

const initChart = () => {
  if (!chartRef.value) return
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        return `<div class="p-1 font-sans text-xs">
          <div class="font-bold text-slate-800 mb-1">${params.name}</div>
          <div class="font-semibold text-indigo-600">Count: <strong>${params.value}</strong> (${params.percent}%)</div>
        </div>`
      }
    },
    legend: {
      bottom: '0%',
      left: 'center',
      textStyle: { color: '#475569', fontSize: 11, fontWeight: 600 }
    },
    series: [
      {
        name: 'Office Attendance',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['50%', '42%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: '#1e293b'
          }
        },
        labelLine: {
          show: false
        },
        data: props.chartData.length ? props.chartData : [
          { name: 'Present (On Time)', value: 0, itemStyle: { color: '#10b981' } },
          { name: 'Late Sign-in', value: 0, itemStyle: { color: '#f59e0b' } },
          { name: 'Absent', value: 0, itemStyle: { color: '#f43f5e' } }
        ]
      }
    ]
  }

  chartInstance.setOption(option, true)
}

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize()
  }
}

watch(() => props.chartData, () => {
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
