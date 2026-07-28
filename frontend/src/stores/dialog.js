import { defineStore } from 'pinia'

export const useDialogStore = defineStore('dialog', {
  state: () => ({
    isOpen: false,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    type: 'warning', // 'danger' | 'warning' | 'info' | 'success'
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isAlert: false, // true = single OK button, false = Confirm/Cancel
    resolve: null
  }),

  actions: {
    confirm({
      title = 'Confirm Action',
      message = 'Are you sure you want to proceed?',
      type = 'warning',
      confirmText = 'Confirm',
      cancelText = 'Cancel'
    }) {
      this.title = title
      this.message = message
      this.type = type
      this.confirmText = confirmText
      this.cancelText = cancelText
      this.isAlert = false
      this.isOpen = true

      return new Promise((resolve) => {
        this.resolve = resolve
      })
    },

    alert({
      title = 'Notification',
      message = '',
      type = 'info',
      confirmText = 'OK'
    }) {
      this.title = title
      this.message = message
      this.type = type
      this.confirmText = confirmText
      this.isAlert = true
      this.isOpen = true

      return new Promise((resolve) => {
        this.resolve = resolve
      })
    },

    handleConfirm() {
      this.isOpen = false
      if (this.resolve) {
        this.resolve(true)
        this.resolve = null
      }
    },

    handleCancel() {
      this.isOpen = false
      if (this.resolve) {
        this.resolve(false)
        this.resolve = null
      }
    }
  }
})
