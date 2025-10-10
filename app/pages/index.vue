<template>
  <div />
</template>
<script lang="ts" setup>
useToasters();
onMounted(async () => {
  await navigateTo("/cases");
});
</script>
