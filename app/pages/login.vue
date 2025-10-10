<template>
  <div>
    <div>login page</div>
    <div>TODO: open login modal and redirect to root</div>
  </div>
</template>

<script lang="ts" setup>
const { openLoginModal } = useLoginModal();

const { loggedIn, user } = useUserSession();
const route = useRoute();
const redirectTo = computed(() =>
  typeof route.query.redirectTo === "string" &&
  route.query.redirectTo.startsWith("/")
    ? route.query.redirectTo
    : "/cases",
);

await callOnce(async () => {
  const verifiedAt = user.value?.emailVerifiedAt;
  if (loggedIn.value && verifiedAt) {
    await navigateTo(redirectTo.value);
  } else if (loggedIn.value && !verifiedAt) {
    await navigateTo("/account-needs-verification");
  }
});

onMounted(async () => {
  const result = await openLoginModal();
  if (result) {
    await navigateTo(redirectTo.value);
  }
});
</script>
