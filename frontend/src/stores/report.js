import { defineStore } from 'pinia'
import api from '../plugins/axios'

const getTodayString = () => new Date().toISOString().split('T')[0]
const getThreeDaysAgoString = () => new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

export const useReportStore = defineStore('report', {
  state: () => ({
    reports: [],
    offices: [],
    loading: false,
    generating: false,
    pollInterval: null,
    form: {
      office_id: '',
      fromDate: getThreeDaysAgoString(),
      toDate: getTodayString()
    },
    pagination: {
      total: 0,
      page: 1,
      limit: 15,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false
    }
  }),

  getters: {
    paginationRange: (state) => {
      if (state.pagination.total === 0) return { from: 0, to: 0 }
      const from = (state.pagination.page - 1) * state.pagination.limit + 1
      const to = Math.min(state.pagination.page * state.pagination.limit, state.pagination.total)
      return { from, to }
    }
  },

  actions: {
    async fetchReports(silent = false) {
      if (!silent) this.loading = true
      try {
        const params = new URLSearchParams()
        params.append('page', this.pagination.page)
        params.append('limit', this.pagination.limit)

        const response = await api.get(`/reports?${params.toString()}`)
        if (response.data && response.data.status === 'success') {
          this.reports = response.data.data
          this.offices = response.data.offices || []
          if (this.offices.length > 0 && !this.form.office_id) {
            this.form.office_id = this.offices[0].id || this.offices[0].value
          }
          if (response.data.pagination) {
            this.pagination = response.data.pagination
          }

          // Check if any report is still processing
          const hasProcessing = this.reports.some(r => r.status === 'Processing' || r.path === 'pending')
          if (hasProcessing) {
            this.startPolling()
          } else {
            this.stopPolling()
          }
        }
      } catch (error) {
        console.error('Failed to fetch reports', error)
      } finally {
        if (!silent) this.loading = false
      }
    },

    startPolling() {
      if (this.pollInterval) return
      this.pollInterval = setInterval(() => {
        this.fetchReports(true)
      }, 2000)
    },

    stopPolling() {
      if (this.pollInterval) {
        clearInterval(this.pollInterval)
        this.pollInterval = null
      }
    },

    async generateReport(toast) {
      if (!this.form.office_id) {
        if (toast) toast.error('Please select an office.')
        else alert('Please select an office.')
        return
      }

      this.generating = true
      try {
        const response = await api.post('/reports', this.form)
        if (response.data && response.data.status === 'success') {
          await this.fetchReports()
          if (toast) toast.success('Report generation queued')
        } else {
          const msg = response.data?.message || 'Error generating report'
          if (toast) toast.error(msg)
          else alert(msg)
        }
      } catch (error) {
        console.error('Failed to generate report', error)
        const msg = error.response?.data?.message || 'An error occurred while generating report.'
        if (toast) toast.error(msg)
        else alert(msg)
      } finally {
        this.generating = false
      }
    },

    async downloadReport(report, toast) {
      if (report.status === 'Processing') {
        const msg = 'Report is still being generated. Please refresh and try again shortly.'
        if (toast) toast.info(msg)
        else alert(msg)
        return
      }
      try {
        const response = await api.get(`/reports/${report.id}/download`, { responseType: 'blob' })
        const url = window.URL.createObjectURL(new Blob([response.data], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        }))
        const link = document.createElement('a')
        link.href = url
        const safeTitle = (report.title || `report_${report.id}`)
          .replace(/[^a-z0-9_\- ]/gi, '')
          .replace(/\s+/g, '_')
          .slice(0, 60)
        link.setAttribute('download', `${safeTitle}.xlsx`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Failed to download report', error)
        const msg = error.response?.data?.message || 'Error downloading report'
        if (toast) toast.error(msg)
        else alert(msg)
      }
    },

    async deleteReport(id, toast) {
      if (!confirm('Are you sure you want to delete this report?')) return
      try {
        const response = await api.delete(`/reports/${id}`)
        if (response.data && response.data.status === 'success') {
          await this.fetchReports()
          if (toast) toast.success('Report deleted successfully')
        }
      } catch (error) {
        console.error('Failed to delete report', error)
        if (toast) toast.error(error.response?.data?.message || 'Failed to delete report')
      }
    },

    changePage(newPage) {
      if (newPage < 1 || newPage > this.pagination.totalPages) return
      this.pagination.page = newPage
      this.fetchReports()
    },

    formatDate(dateString) {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
})
