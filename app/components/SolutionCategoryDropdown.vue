<template>
  <UInputMenu :items="items" />
</template>
<script setup lang="ts">
const items = ref([
  "Produkt",
  "Proces",
  "Service",
  "Forretningsmodel",
  "Kampagne (retorisk)",
]);
</script>
