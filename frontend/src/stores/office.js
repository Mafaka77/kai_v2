import { defineStore } from 'pinia'
import api from '../plugins/axios'
import { useDialogStore } from './dialog'

export const useOfficeStore = defineStore('office', {
  state: () => ({
    offices: [],
    districtsList: [],
    loading: false,
    showModal: false,
    isEditing: false,
    saving: false,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false
    },
    form: {
      id: null,
      name: '',
      district_id: '',
      lat: '',
      lng: '',
      lat2: '',
      lng2: '',
      radius: 100,
      start_time: '09:00',
      close_time: '17:00',
      grace_period: 15
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
    async fetchOffices(search = '', page = null) {
      this.loading = true
      try {
        if (page !== null) {
          this.pagination.page = page
        }
        const params = new URLSearchParams()
        if (search) params.append('search', search)
        params.append('page', this.pagination.page)
        params.append('limit', this.pagination.limit)

        const response = await api.get(`/offices?${params.toString()}`)
        if (response.data && response.data.status === 'success') {
          this.offices = response.data.data
          if (response.data.pagination) {
            this.pagination = response.data.pagination
          }
        }
      } catch (error) {
        console.error('Failed to fetch offices', error)
      } finally {
        this.loading = false
      }
    },

    changePage(newPage, search = '') {
      if (newPage < 1 || newPage > this.pagination.totalPages) return
      this.fetchOffices(search, newPage)
    },

    async fetchDistricts() {
      try {
        const response = await api.get('/districts')
        if (response.data && response.data.status === 'success') {
          this.districtsList = response.data.data
        }
      } catch (error) {
        console.error('Failed to fetch districts', error)
      }
    },

    openModal(office = null) {
      if (office) {
        this.isEditing = true
        this.form = {
          id: office.id,
          name: office.name,
          district_id: office.district_id,
          lat: office.lat,
          lng: office.lng,
          lat2: office.lat2 || '',
          lng2: office.lng2 || '',
          radius: parseInt(office.radius),
          start_time: office.start_time ? office.start_time.slice(0, 5) : '09:00',
          close_time: office.close_time ? office.close_time.slice(0, 5) : '17:00',
          grace_period: parseInt(office.grace_period)
        }
      } else {
        this.isEditing = false
        this.form = {
          id: null,
          name: '',
          district_id: '',
          lat: '',
          lng: '',
          lat2: '',
          lng2: '',
          radius: 100,
          start_time: '09:00',
          close_time: '17:00',
          grace_period: 15
        }
      }
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
    },

    async saveOffice(toast) {
      this.saving = true
      try {
        const url = this.isEditing ? `/offices/${this.form.id}` : `/offices`
        const method = this.isEditing ? 'put' : 'post'

        const payload = {
          name: this.form.name,
          district_id: this.form.district_id,
          lat: this.form.lat,
          lng: this.form.lng,
          lat2: this.form.lat2 || null,
          lng2: this.form.lng2 || null,
          radius: this.form.radius,
          start_time: this.form.start_time,
          close_time: this.form.close_time,
          grace_period: this.form.grace_period
        }

        const response = await api[method](url, payload)
        if (response.data && response.data.status === 'success') {
          this.closeModal()
          this.fetchOffices()
          toast.success(this.isEditing ? 'Office updated successfully' : 'Office created successfully')
        } else {
          toast.error(response.data?.message || 'Error saving office')
        }
      } catch (error) {
        console.error('Failed to save office', error)
        toast.error(error.response?.data?.message || 'An error occurred while saving.')
      } finally {
        this.saving = false
      }
    },

    async deleteOffice(id, toast) {
      const dialog = useDialogStore()
      const ok = await dialog.confirm({
        title: 'Delete Office',
        message: 'Are you sure you want to delete this office? This action cannot be undone.',
        type: 'danger',
        confirmText: 'Delete'
      })
      if (!ok) return

      try {
        const response = await api.delete(`/offices/${id}`)
        if (response.data && response.data.status === 'success') {
          this.fetchOffices()
          toast.success('Office deleted successfully')
        } else {
          toast.error(response.data?.message || 'Error deleting office')
        }
      } catch (error) {
        console.error('Failed to delete office', error)
        toast.error(error.response?.data?.message || 'An error occurred while deleting.')
      }
    }
  }
})
