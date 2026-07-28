import { defineStore } from 'pinia'
import api from '../plugins/axios'
import { useNotificationStore } from './notification'

export const useChangeOfficeStore = defineStore('changeOffice', {
  state: () => ({
    requests: [],
    availableOffices: [],
    officeSearch: '',
    loading: false,
    submitting: false,
    showModal: false,
    form: {
      office_id: '',
      remark: ''
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
    filteredOffices: (state) => {
      if (!state.officeSearch) {
        return state.availableOffices.slice(0, 20)
      }
      const q = state.officeSearch.toLowerCase().trim()
      return state.availableOffices.filter(o => o.name && o.name.toLowerCase().includes(q))
    }
  },

  actions: {
    async fetchMyRequests() {
      this.loading = true
      try {
        const params = new URLSearchParams()
        params.append('page', this.pagination.page)
        params.append('limit', this.pagination.limit)
        const res = await api.get(`/my-posting-requests?${params.toString()}`)
        if (res.data?.status === 'success') {
          this.requests = res.data.data
          if (res.data.pagination) {
            this.pagination = res.data.pagination
          }
        }
      } catch (err) {
        console.error('Failed to fetch posting requests', err)
      } finally {
        this.loading = false
      }
    },

    async fetchOffices() {
      try {
        const res = await api.get('/offices')
        if (res.data?.status === 'success') {
          this.availableOffices = res.data.data
        }
      } catch (err) {
        console.error('Failed to fetch offices', err)
      }
    },

    async submitRequest() {
      const toast = useNotificationStore()
      if (!this.form.office_id) {
        toast.error('Please select a target office.')
        return false
      }
      this.submitting = true
      try {
        const res = await api.post('/posting-requests', {
          office_id: parseInt(this.form.office_id),
          remark: this.form.remark ? this.form.remark.trim() : null
        })
        if (res.data?.status === 'success') {
          this.showModal = false
          this.resetForm()
          toast.success(res.data?.message || 'Office change request submitted successfully!')
          await this.fetchMyRequests()
          return true
        } else {
          toast.error(res.data?.message || 'Error submitting request')
          return false
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to submit office change request')
        return false
      } finally {
        this.submitting = false
      }
    },

    changePage(newPage) {
      if (newPage < 1 || newPage > this.pagination.totalPages) return
      this.pagination.page = newPage
      this.fetchMyRequests()
    },

    resetForm() {
      this.form = {
        office_id: '',
        remark: ''
      }
      this.officeSearch = ''
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
