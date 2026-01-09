<template>
  <div class="text-sm font-mono">
    <p v-if="pending">Verifing email..</p>
    <div v-else>
      <p v-if="data?.isValid">Verification successfull!</p>
      <p v-else>Verification failed!</p>
      <pre>signature: {{ jwt }}</pre>
      <pre>response: {{ JSON.stringify(data, null, 4) }}</pre>
    </div>
    <div v-if="error" class="text-red-500">{{ error }}</div>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute();
const { fetch: refreshUser, user } = useUserSession();
const jwt = route.query?.jwt;
// const emailRaw = route.query?.email;
// const email = (emailRaw && typeof emailRaw === 'string') ? fromBase64Url(emailRaw) : null;

await callOnce(async () => {
  if (user.value?.emailVerifiedAt) {
    await navigateTo("/?emailVerified=2");
  }
});

if (!jwt) {
  throw createError({
    statusCode: 400,
    message: "You need to provide the correct query parameters",
  });
}

const { data, pending, error, refresh } = await useCsrfFetch(
  `/api/auth/verify-email`,
  {
    immediate: false,
    method: "POST",
    body: {
      jwt: jwt,
    },
    onResponse: async (ctx) => {
      console.log("got verify-email response:", ctx.response?._data);
      if (ctx.response.status === 204) {
        await navigateTo("/?emailVerified=2", { replace: true });
      }
      if (ctx.response?._data?.isValid) {
        await refreshUser();
        await navigateTo("/?emailVerified=1", { replace: true });
      }
    },
  },
);

onMounted(async () => {
  refresh();
});

definePageMeta({
  middleware: ["auth"],
});
</script>
