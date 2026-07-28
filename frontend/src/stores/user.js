import { defineStore } from 'pinia'
import api from '../plugins/axios'
import { useDialogStore } from './dialog'
import { useNotificationStore } from './notification'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [],
    districts: [],
    offices: [],
    status: 'active',
    loading: false,
    showModal: false,
    isEditing: false,
    saving: false,
    form: {
      id: null,
      full_name: '',
      mobile: '',
      designation: '',
      role: 'User',
      password: '',
      office_ids: []
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
    filteredOffices: (state) => state.offices
  },

  actions: {
    async fetchUsers(search = '') {
      this.loading = true
      try {
        const queryParams = new URLSearchParams()
        queryParams.append('status', this.status)
        queryParams.append('page', this.pagination.page)
        queryParams.append('limit', this.pagination.limit)
        if (search) {
          queryParams.append('search', search)
        }
        const response = await api.get(`/users?${queryParams.toString()}`)
        if (response.data && response.data.status === 'success') {
          this.users = response.data.data
          if (response.data.pagination) {
            this.pagination = response.data.pagination
          }
        }
      } catch (error) {
        console.error('Failed to fetch users', error)
      } finally {
        this.loading = false
      }
    },

    async fetchDistrictsAndOffices() {
      try {
        const offRes = await api.get('/offices')
        if (offRes.data && offRes.data.status === 'success') {
          this.offices = offRes.data.data
        }
      } catch (error) {
        console.error('Failed to fetch offices data', error)
      }
    },

    openModal(user = null) {
      if (user) {
        this.isEditing = true
        this.form = {
          id: user.id,
          full_name: user.full_name || '',
          mobile: user.mobile || '',
          designation: user.designation || '',
          role: user.role || 'User',
          password: '',
          office_ids: user.Offices ? user.Offices.map(o => o.id) : []
        }
      } else {
        this.isEditing = false
        this.form = {
          id: null,
          full_name: '',
          mobile: '',
          designation: '',
          role: 'User',
          password: '',
          office_ids: []
        }
      }
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
    },

    async saveUser() {
      this.saving = true
      try {
        const url = this.isEditing ? `/users/${this.form.id}` : `/users`
        const method = this.isEditing ? 'put' : 'post'
        
        // Clean up empty optional fields
        const payload = { ...this.form }
        if (!payload.password) delete payload.password
        
        const response = await api[method](url, payload)
        if (response.data && response.data.status === 'success') {
          this.closeModal()
          await this.fetchUsers()
          return { success: true }
        } else {
          return { success: false, message: response.data?.message || 'Error saving user' }
        }
      } catch (error) {
        console.error('Failed to save user', error)
        const errMsg = error.response?.data?.message || 'An error occurred while saving.'
        return { success: false, message: errMsg }
      } finally {
        this.saving = false
      }
    },

    async toggleUserStatus(id, action) {
      const dialog = useDialogStore()
      const toast = useNotificationStore()
      const isDisable = action === 'disable' || action === 'deactivate'

      const ok = await dialog.confirm({
        title: isDisable ? 'Disable User Account' : 'Restore User Account',
        message: isDisable
          ? 'Are you sure you want to disable this user? They will not be able to log in.'
          : 'Are you sure you want to enable this user?',
        type: isDisable ? 'danger' : 'info',
        confirmText: isDisable ? 'Disable User' : 'Enable User'
      })
        
      if (!ok) return false
      
      try {
        const url = isDisable ? `/users/${id}` : `/users/${id}/restore`
        const method = isDisable ? 'delete' : 'put'

        const response = await api[method](url)
        if (response.data && response.data.status === 'success') {
          toast.success(response.data?.message || `User ${isDisable ? 'disabled' : 'enabled'} successfully`)
          await this.fetchUsers()
          return true
        } else {
          toast.error(response.data?.message || `Error trying to ${action} user`)
          return false
        }
      } catch (error) {
        console.error(`Failed to ${action} user`, error)
        toast.error(error.response?.data?.message || `An error occurred while trying to ${action} user`)
        return false
      }
    }
  }
})
