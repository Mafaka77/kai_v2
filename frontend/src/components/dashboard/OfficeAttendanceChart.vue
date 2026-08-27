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
          <button 
            @click="filterMode = 'inactive'"
            :class="[
              'px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer',
              filterMode === 'inactive' 
                ? 'bg-white text-indigo-600 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800'
            ]"
          >
            No Sign-ins ({{ inactiveOfficesCount }})
          </button>
        </div>

        <!-- Export PDF Button -->
        <button 
          @click="exportToPDF"
          :disabled="isExporting"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
          :title="`Export ${filterMode === 'active' ? 'With Sign-ins (' + activeOfficesCount + ')' : filterMode === 'inactive' ? 'No Sign-ins (' + inactiveOfficesCount + ')' : 'All (' + chartData.length + ')'} to PDF`"
        >
          <svg v-if="isExporting" class="w-3.5 h-3.5 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-3.5 h-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span>Export PDF</span>
        </button>

        <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg shrink-0">
          <span v-if="searchQuery" class="text-indigo-600 font-bold">{{ filteredData.length }} result(s)</span>
          <span v-else class="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
          <span v-if="!searchQuery">Live Analytics</span>
        </span>
      </div>

      <div v-else class="flex items-center gap-2 flex-wrap">
        <button 
          @click="exportToPDF"
          :disabled="isExporting"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
          title="Export Attendance to PDF"
        >
          <svg v-if="isExporting" class="w-3.5 h-3.5 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg v-else class="w-3.5 h-3.5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span>Export PDF</span>
        </button>

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
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

const props = defineProps({
  title: { type: String, default: 'Office Attendance' },
  subtitle: { type: String, default: 'Attendance statistics chart' },
  mode: { type: String, default: 'admin' }, // 'admin' | 'manager'
  chartData: { type: Array, default: () => [] }
})

const chartRef = ref(null)
let chartInstance = null
const filterMode = ref('all') // 'all' | 'active' | 'inactive'
const searchQuery = ref('')
const isExporting = ref(false)

const activeOfficesCount = computed(() => {
  return props.chartData.filter(item => item.count > 0).length
})

const inactiveOfficesCount = computed(() => {
  return props.chartData.filter(item => !item.count || item.count === 0).length
})

const filteredData = computed(() => {
  if (props.mode !== 'admin') return props.chartData

  let list = props.chartData

  if (filterMode.value === 'active') {
    list = list.filter(item => item.count > 0)
  } else if (filterMode.value === 'inactive') {
    list = list.filter(item => !item.count || item.count === 0)
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim().toLowerCase()
    list = list.filter(item => item.office_name && item.office_name.toLowerCase().includes(q))
  }

  return list
})

const exportToPDF = () => {
  if (isExporting.value) return
  isExporting.value = true

  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })

    const currentDateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    if (props.mode === 'admin') {
      const isFilterActive = filterMode.value === 'active'
      const isFilterInactive = filterMode.value === 'inactive'
      const isFilterAll = filterMode.value === 'all'

      let activeList = props.chartData.filter(item => item.count > 0)
      let inactiveList = props.chartData.filter(item => !item.count || item.count === 0)

      if (searchQuery.value.trim()) {
        const q = searchQuery.value.trim().toLowerCase()
        activeList = activeList.filter(item => item.office_name && item.office_name.toLowerCase().includes(q))
        inactiveList = inactiveList.filter(item => item.office_name && item.office_name.toLowerCase().includes(q))
      }

      // Title, sub-label and filename based on current filter selection
      let reportTitle = props.title || 'Statewide Office Attendance Report'
      let filterLabel = 'All Offices'
      let filenamePrefix = 'office_attendance_all'

      if (isFilterActive) {
        reportTitle += ' — With Sign-ins'
        filterLabel = `With Sign-ins (${activeList.length})`
        filenamePrefix = 'offices_with_signins'
      } else if (isFilterInactive) {
        reportTitle += ' — No Sign-ins'
        filterLabel = `No Sign-ins (${inactiveList.length})`
        filenamePrefix = 'offices_no_signins'
      }

      // Header Banner
      doc.setFillColor(79, 70, 229) // Indigo 600
      doc.rect(0, 0, 210, 24, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.text(reportTitle, 14, 11)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(224, 231, 255)
      doc.text(`Generated: ${currentDateStr} | Filter: ${filterLabel}${searchQuery.value.trim() ? ` (Search: "${searchQuery.value.trim()}")` : ''}`, 14, 18)

      // Summary KPI Section
      doc.setTextColor(30, 41, 59)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('Attendance Overview Summary', 14, 32)

      const totalOffices = props.chartData.length
      const totalStaff = props.chartData.reduce((sum, item) => sum + (parseInt(item.total_staff) || 0), 0)
      const totalPresent = props.chartData.reduce((sum, item) => sum + (parseInt(item.present) || 0), 0)
      const totalLate = props.chartData.reduce((sum, item) => sum + (parseInt(item.late) || 0), 0)
      const totalSignins = totalPresent + totalLate

      // Metrics Summary Table
      autoTable(doc, {
        startY: 35,
        head: [['Total System Offices', 'With Sign-ins', 'No Sign-ins', 'Total Staff', 'Total Sign-ins (Present / Late)']],
        body: [[
          `${totalOffices}`,
          `${activeOfficesCount.value} (${totalOffices ? Math.round((activeOfficesCount.value / totalOffices) * 100) : 0}%)`,
          `${inactiveOfficesCount.value} (${totalOffices ? Math.round((inactiveOfficesCount.value / totalOffices) * 100) : 0}%)`,
          `${totalStaff}`,
          `${totalSignins} (${totalPresent} / ${totalLate})`
        ]],
        theme: 'grid',
        headStyles: {
          fillColor: [241, 245, 249],
          textColor: [51, 65, 85],
          fontStyle: 'bold',
          fontSize: 8,
          halign: 'center'
        },
        bodyStyles: {
          fontSize: 9,
          fontStyle: 'bold',
          textColor: [15, 23, 42],
          halign: 'center',
          cellPadding: 3
        }
      })

      let currentY = doc.lastAutoTable.finalY + 9

      // Section 1: Offices With Sign-ins (Rendered for 'all' or 'active')
      if (isFilterAll || isFilterActive) {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(16, 185, 129) // Emerald 600
        doc.text(
          isFilterAll ? `1. Offices With Sign-ins (${activeList.length})` : `Offices With Sign-ins (${activeList.length})`,
          14,
          currentY
        )

        const activeRows = activeList.map((item, index) => {
          const staff = parseInt(item.total_staff) || 0
          const present = parseInt(item.present) || 0
          const late = parseInt(item.late) || 0
          const absent = parseInt(item.absent) || 0
          const total = present + late
          const pct = staff > 0 ? `${Math.round((total / staff) * 100)}%` : '—'
          return [
            index + 1,
            item.office_name || '—',
            staff,
            present,
            late,
            absent,
            total,
            pct
          ]
        })

        autoTable(doc, {
          startY: currentY + 3,
          head: [['#', 'Office Name', 'Total Staff', 'Present', 'Late', 'Absent', 'Total Sign-ins', 'Turnout %']],
          body: activeRows.length ? activeRows : [['—', 'No offices with sign-ins recorded', '—', '—', '—', '—', '—', '—']],
          theme: 'striped',
          headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
          styles: { fontSize: 8, cellPadding: 2.2 },
          columnStyles: {
            0: { cellWidth: 10, halign: 'center' },
            1: { cellWidth: 55 },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 18, halign: 'center' },
            4: { cellWidth: 18, halign: 'center' },
            5: { cellWidth: 18, halign: 'center' },
            6: { cellWidth: 25, halign: 'center' },
            7: { cellWidth: 20, halign: 'center' }
          }
        })

        currentY = doc.lastAutoTable.finalY + 10
      }

      // Section 2: Offices With No Sign-ins (Rendered for 'all' or 'inactive')
      if (isFilterAll || isFilterInactive) {
        if (isFilterAll && currentY > 255) {
          doc.addPage()
          currentY = 15
        }

        doc.setFont('helvetica', 'bold')
        doc.setFontSize(11)
        doc.setTextColor(225, 29, 72) // Rose 600
        doc.text(
          isFilterAll ? `2. Offices With No Sign-ins (${inactiveList.length})` : `Offices With No Sign-ins (${inactiveList.length})`,
          14,
          currentY
        )

        const inactiveRows = inactiveList.map((item, index) => {
          const staff = parseInt(item.total_staff) || 0
          return [
            index + 1,
            item.office_name || '—',
            staff,
            '0 Sign-ins Recorded'
          ]
        })

        autoTable(doc, {
          startY: currentY + 3,
          head: [['#', 'Office Name', 'Total Staff', 'Status']],
          body: inactiveRows.length ? inactiveRows : [['—', 'No offices without sign-ins recorded', '—', 'Active']],
          theme: 'striped',
          headStyles: { fillColor: [225, 29, 72], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
          styles: { fontSize: 8, cellPadding: 2.2 },
          columnStyles: {
            0: { cellWidth: 12, halign: 'center' },
            1: { cellWidth: 95 },
            2: { cellWidth: 35, halign: 'center' },
            3: { cellWidth: 42, halign: 'center' }
          }
        })
      }

      // Page numbers footer
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(148, 163, 184)
        doc.text(
          `Page ${i} of ${pageCount} — Generated via KAI Attendance System`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 7,
          { align: 'center' }
        )
      }

      doc.save(`${filenamePrefix}_${new Date().toISOString().split('T')[0]}.pdf`)
    } else {
      // Manager mode: Weekly Employee Breakdown PDF
      doc.setFillColor(79, 70, 229)
      doc.rect(0, 0, 210, 24, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.text(props.title || 'Weekly Employee Attendance Breakdown', 14, 11)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      doc.setTextColor(224, 231, 255)
      doc.text(`Generated: ${currentDateStr} | Monday – Today`, 14, 18)

      const empRows = props.chartData.map((item, index) => {
        const present = parseInt(item.present) || 0
        const late = parseInt(item.late) || 0
        const absent = parseInt(item.absent) || 0
        const total = present + late
        const totalDays = item.working_days || (present + late + absent) || 5
        const rate = totalDays > 0 ? `${Math.round((total / totalDays) * 100)}%` : '—'
        return [
          index + 1,
          item.employee_name || 'Staff',
          `${present} days`,
          `${late} days`,
          `${absent} days`,
          rate
        ]
      })

      autoTable(doc, {
        startY: 32,
        head: [['#', 'Employee Name', 'Present Days', 'Late Days', 'Absent Days', 'Attendance Rate']],
        body: empRows.length ? empRows : [['—', 'No employee data recorded', '—', '—', '—', '—']],
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 2.5 },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },
          1: { cellWidth: 70 },
          2: { cellWidth: 25, halign: 'center' },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 25, halign: 'center' },
          5: { cellWidth: 27, halign: 'center' }
        }
      })

      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(8)
        doc.setTextColor(148, 163, 184)
        doc.text(
          `Page ${i} of ${pageCount} — Generated via KAI Attendance System`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 7,
          { align: 'center' }
        )
      }

      doc.save(`weekly_employee_attendance_${new Date().toISOString().split('T')[0]}.pdf`)
    }
  } catch (error) {
    console.error('Failed to export PDF:', error)
    alert('Failed to generate PDF export: ' + error.message)
  } finally {
    isExporting.value = false
  }
}

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
