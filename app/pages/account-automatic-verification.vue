<template>
  <UContainer class="mt-9">
    <div class="text-sm font-mono">
      <p v-if="pending">Verificerer email..</p>
      <div v-else-if="status !== 'idle'">
        <p v-if="data?.isValid">Verifikaation af email lykkedes!</p>
        <p v-else>Verifikation af email fejlede :-(</p>
        <pre>token: {{ verifyEmailToken }}</pre>
        <pre>response: {{ JSON.stringify(data, null, 4) }}</pre>
      </div>
      <div v-if="error" class="text-red-500">{{ error }}</div>
      <div v-if="!pending" class="mt-3">
        <UButton
          to="/account-needs-verification"
          variant="subtle"
          color="secondary"
        >
          Prøv igen
        </UButton>
      </div>
    </div>
  </UContainer>
</template>

<script lang="ts" setup>
const route = useRoute();
const { fetch: refreshUser, user } = useUserSession();
const verifyEmailToken = route.query?.token;

await callOnce(async () => {
  if (user.value?.emailVerifiedAt) {
    await navigateTo("/?emailVerified=2");
  }
});

if (!verifyEmailToken) {
  throw createError({
    statusCode: 400,
    message: "You need to provide the correct query parameters",
  });
}

const { data, pending, error, refresh, status } = await useCsrfFetch(
  `/api/auth/verify-email`,
  {
    immediate: false,
    method: "POST",
    body: {
      verify_email_token: verifyEmailToken,
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
