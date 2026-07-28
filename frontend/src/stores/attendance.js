import { defineStore } from 'pinia'
import api from '../plugins/axios'

export const useAttendanceStore = defineStore('attendance', {
  state: () => ({
    attendances: [],
    offices: [],
    summary: { total: 0, present: 0, late: 0, absent: 0, leave: 0 },
    loading: false,
    selectedOfficeId: '',
    selectedDate: new Date().toISOString().split('T')[0],
    statusFilter: 'all',
    pagination: {
      total: 0,
      page: 1,
      limit: 15,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false
    }
  }),

  actions: {
    async fetchAttendances() {
      this.loading = true
      try {
        const params = new URLSearchParams()
        if (this.selectedOfficeId) params.append('office_id', this.selectedOfficeId)
        
        // Pass empty string if explicitly cleared, else pass selectedDate
        params.append('date', this.selectedDate !== null ? this.selectedDate : '')
        if (this.statusFilter && this.statusFilter !== 'all') params.append('status_filter', this.statusFilter)
        params.append('page', this.pagination.page)
        params.append('limit', this.pagination.limit)
        
        const response = await api.get(`/attendances?${params.toString()}`)
        if (response.data && response.data.status === 'success') {
          this.attendances = response.data.data
          this.offices = response.data.offices || []
          if (response.data.summary) {
            this.summary = response.data.summary
          }
          if (response.data.pagination) {
            this.pagination = response.data.pagination
          }
        }
      } catch (error) {
        console.error('Failed to fetch attendance', error)
      } finally {
        this.loading = false
      }
    },

    setOffice(id) {
      this.selectedOfficeId = id
      this.pagination.page = 1
      this.fetchAttendances()
    },

    setDate(date) {
      this.selectedDate = date
      this.pagination.page = 1
      this.fetchAttendances()
    },

    setStatusFilter(filter) {
      this.statusFilter = filter
      this.pagination.page = 1
      this.fetchAttendances()
    },

    changePage(newPage) {
      if (newPage < 1 || newPage > this.pagination.totalPages) return
      this.pagination.page = newPage
      this.fetchAttendances()
    }
  }
})
