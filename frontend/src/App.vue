<template>
  <router-view />
  <NotificationToast />
  <AlertDialog />
</template>

<script setup>
import NotificationToast from './components/NotificationToast.vue'
import AlertDialog from './components/AlertDialog.vue'
</script>
