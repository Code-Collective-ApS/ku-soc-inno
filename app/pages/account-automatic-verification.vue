<template>
  <div class="text-sm font-mono">
    <p v-if="pending">Verifing email..</p>
    <div v-else>
      <p v-if="data?.isValid">Verification successfull!</p>
      <p v-else>Verification failed!</p>
      <pre>signature: {{ signature }}</pre>
      <pre>response: {{ JSON.stringify(data, null, 4) }}</pre>
    </div>
    <div v-if="error" class="text-red-500">{{ error }}</div>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute();
const { fetch: refreshUser, user } = useUserSession();
const signature = route.query?.sig;

await callOnce(async () => {
  if (user.value?.emailVerifiedAt) {
    await navigateTo("/?emailVerified=2");
  }
});

if (!signature) {
  throw createError({
    statusCode: 400,
    statusMessage: "You need to provide the correct query parameters",
  });
}

const { data, pending, error, refresh } = await useCsrfFetch(
  `/api/auth/verify-email`,
  {
    immediate: false,
    method: "POST",
    body: {
      sig: signature,
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
