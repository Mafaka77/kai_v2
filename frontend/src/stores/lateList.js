import { defineStore } from 'pinia'
import api from '../plugins/axios'

export const useLateListStore = defineStore('lateList', {
  state: () => ({
    users: [],
    offices: [],
    selectedOffice: '',
    searchQuery: '',
    loading: false,
    exporting: false,
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
    async fetchList() {
      this.loading = true
      try {
        const params = new URLSearchParams()
        if (this.selectedOffice) params.append('office_id', this.selectedOffice)
        if (this.searchQuery) params.append('search', this.searchQuery)
        params.append('page', this.pagination.page)
        params.append('limit', this.pagination.limit)

        const response = await api.get(`/latelist?${params.toString()}`)
        if (response.data && response.data.status === 'success') {
          this.users = response.data.data
          this.offices = response.data.offices || []
          if (response.data.pagination) {
            this.pagination = response.data.pagination
          }
        }
      } catch (error) {
        console.error('Failed to fetch late list', error)
      } finally {
        this.loading = false
      }
    },

    setOffice(val) {
      this.selectedOffice = val
      this.pagination.page = 1
      this.fetchList()
    },

    setSearch(val) {
      this.searchQuery = val
      this.pagination.page = 1
      this.fetchList()
    },

    changePage(newPage) {
      if (newPage < 1 || newPage > this.pagination.totalPages) return
      this.pagination.page = newPage
      this.fetchList()
    },

    async exportCsv() {
      this.exporting = true
      try {
        const params = new URLSearchParams()
        if (this.selectedOffice) params.append('office_id', this.selectedOffice)
        if (this.searchQuery) params.append('search', this.searchQuery)

        const response = await api.get(`/latelist/export?${params.toString()}`, {
          responseType: 'blob'
        })

        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', 'late_list_report.csv')
        document.body.appendChild(link)
        link.click()
        link.remove()
      } catch (error) {
        console.error('Failed to export late list', error)
      } finally {
        this.exporting = false
      }
    }
  }
})
