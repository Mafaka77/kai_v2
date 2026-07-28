import { defineStore } from 'pinia'
import api from '../plugins/axios'
import { useNotificationStore } from './notification'

const getTodayString = () => new Date().toISOString().split('T')[0]

export const useAttendanceAppealStore = defineStore('attendanceAppeal', {
  state: () => ({
    appeals: [],
    availableOffices: [],
    currentType: 'late_reason',
    loading: false,
    submitting: false,
    showModal: false,
    form: {
      type: 'on_Duty',
      start_date: getTodayString(),
      end_date: getTodayString(),
      reason: ''
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

  actions: {
    async fetchMyAppeals() {
      this.loading = true
      try {
        const params = new URLSearchParams()
        params.append('type', this.currentType)
        params.append('page', this.pagination.page)
        params.append('limit', this.pagination.limit)
        const res = await api.get(`/my-appeals?${params.toString()}`)
        if (res.data?.status === 'success') {
          this.appeals = res.data.data
          if (res.data.pagination) {
            this.pagination = res.data.pagination
          }
        }
      } catch (err) {
        console.error('Failed to fetch user appeals', err)
      } finally {
        this.loading = false
      }
    },

    async submitAppeal() {
      const toast = useNotificationStore()
      const startDate = this.form.start_date
      const endDate = this.form.end_date || startDate
      const reason = this.form.reason ? this.form.reason.trim() : ''

      if (!startDate || !reason) {
        toast.error('Please fill in start date and reason description.')
        return false
      }
      this.submitting = true
      try {
        const payload = {
          type: 'on_Duty',
          start_date: startDate,
          end_date: endDate,
          reason
        }
        const res = await api.post('/appeals', payload)
        if (res.data?.status === 'success') {
          this.showModal = false
          this.resetForm()
          toast.success(res.data?.message || 'On Duty appeal submitted successfully!')
          await this.fetchMyAppeals()
          return true
        } else {
          toast.error(res.data?.message || 'Error submitting appeal')
          return false
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to submit appeal')
        return false
      } finally {
        this.submitting = false
      }
    },

    setTab(val) {
      this.currentType = val
      this.pagination.page = 1
      this.fetchMyAppeals()
    },

    changePage(newPage) {
      if (newPage < 1 || newPage > this.pagination.totalPages) return
      this.pagination.page = newPage
      this.fetchMyAppeals()
    },

    resetForm() {
      this.form = {
        type: 'on_Duty',
        start_date: getTodayString(),
        end_date: getTodayString(),
        reason: ''
      }
    },

    openModal() {
      this.resetForm()
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
    }
  }
})
