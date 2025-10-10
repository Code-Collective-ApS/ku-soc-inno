<template>
  <div>Profile page</div>
</template>
<script lang="ts" setup>
const { loggedIn } = useUserSession();
const { openLoginModal } = useLoginModal();

callOnce(async () => {
  if (!loggedIn.value) {
    console.log("user is not logged in. Redirecting to /login..");
    await navigateTo("/cases");
    await openLoginModal();
  }
});
</script>
