<template>
  <div>
    <div>login page</div>
    <div>TODO: open login modal and redirect to root</div>
  </div>
</template>

<script lang="ts" setup>
const { openLoginModal } = useLoginModal();

onMounted(async () => {
  openLoginModal();
});
</script>
