import { defineStore } from 'pinia'
import api from '../plugins/axios'

export const useConfigStore = defineStore('config', {
  state: () => ({
    offices: [],
    districts: [],
    loading: false,
    saving: false,
    editOffice: null,
    editError: '',
    showGlobalModal: false,
    globalSaving: false,
    globalError: '',
    globalForm: {
      start_time: '09:00',
      close_time: '17:00',
      radius: 100,
      grace_period: 15
    },
    editForm: {
      name: '',
      district_id: '',
      lat: '',
      lng: '',
      radius: '',
      grace_period: '',
      start_time: '',
      close_time: '',
      qr_code: ''
    }
  }),

  actions: {
    async fetchConfig() {
      this.loading = true
      try {
        const [offRes, distRes] = await Promise.all([
          api.get('/config/offices'),
          api.get('/config/districts')
        ])
        if (offRes.data?.status === 'success')  this.offices   = offRes.data.data
        if (distRes.data?.status === 'success') this.districts = distRes.data.data
      } catch (error) {
        console.error('Failed to load config', error)
      } finally {
        this.loading = false
      }
    },

    openEdit(office) {
      this.editOffice = office
      this.editError  = ''
      this.editForm = {
        name:         office.name         || '',
        district_id:  office.district_id  || '',
        lat:          office.lat          || '',
        lng:          office.lng          || '',
        radius:       office.radius       || '',
        grace_period: office.grace_period || '',
        start_time:   office.start_time   ? office.start_time.slice(0, 5) : '',
        close_time:   office.close_time   ? office.close_time.slice(0, 5) : '',
        qr_code:      office.QrCode?.code || ''
      }
    },

    closeEdit() {
      this.editOffice = null
      this.editError  = ''
    },

    async submitEdit(toast) {
      this.editError = ''
      this.saving = true
      try {
        const response = await api.put(`/config/offices/${this.editOffice.id}`, this.editForm)
        if (response.data?.status === 'success') {
          this.closeEdit()
          await this.fetchConfig()
          toast.success('Configuration updated successfully')
        } else {
          this.editError = response.data?.message || 'Error saving configuration'
          toast.error(this.editError)
        }
      } catch (error) {
        this.editError = error.response?.data?.message || 'An error occurred'
        toast.error(this.editError)
      } finally {
        this.saving = false
      }
    },

    formatTime(t) {
      if (!t) return '—'
      return t.slice(0, 5)
    },

    openGlobalModal() {
      if (this.offices.length > 0) {
        const first = this.offices[0]
        this.globalForm = {
          start_time:   first.start_time   ? first.start_time.slice(0, 5) : '09:00',
          close_time:   first.close_time   ? first.close_time.slice(0, 5) : '17:00',
          radius:       first.radius       ? parseInt(first.radius) : 100,
          grace_period: first.grace_period ? parseInt(first.grace_period) : 15
        }
      }
      this.globalError = ''
      this.showGlobalModal = true
    },

    closeGlobalModal() {
      this.showGlobalModal = false
      this.globalError = ''
    },

    async submitGlobalEdit(toast) {
      this.globalError = ''
      this.globalSaving = true
      try {
        const response = await api.put('/config/global', this.globalForm)
        if (response.data?.status === 'success') {
          this.closeGlobalModal()
          await this.fetchConfig()
          toast.success(response.data?.message || 'Global configuration applied to all offices')
        } else {
          this.globalError = response.data?.message || 'Error updating global configuration'
          toast.error(this.globalError)
        }
      } catch (error) {
        this.globalError = error.response?.data?.message || 'An error occurred'
        toast.error(this.globalError)
      } finally {
        this.globalSaving = false
      }
    }
  }
})
