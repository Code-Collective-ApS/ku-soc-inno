<template>
  <div>
    <div v-if="!hasSentMail" class="mb-6">
      You still need to verify your email.
    </div>
    <div class="mb-6 flex items-center gap-x-3">
      <UButton
        v-if="!hasSentMail"
        :loading="loading"
        color="info"
        size="lg"
        @click="resendEmail"
        >Resend email</UButton
      >
      <div v-if="hasSentMail" class="flex items-center gap-x-2">
        <UIcon class="text-xl text-success-500" name="i-mdi-check" />
        <p>We sent you an email ! Remember to check spam</p>
      </div>
    </div>
    <UAlert
      v-if="error"
      icon="i-mdi-error-outline"
      color="error"
      variant="subtle"
      :description="error"
    />
  </div>
</template>

<script lang="ts" setup>
const error = ref("");
const loading = ref(false);
const hasSentMail = ref(false);
const { user } = useUserSession();

callOnce(async () => {
  if (user.value?.emailVerifiedAt) {
    console.log("email is already verified - will redirect");
    await navigateTo("/?emailVerified=2", { redirectCode: 302 });
  }
});

const { $csrfFetch } = useNuxtApp();

async function resendEmail() {
  try {
    loading.value = true;
    error.value = "";
    const res = await $csrfFetch("/api/auth/verify-email-resend", {
      method: "POST",
    });
    if (!res.ok) {
      throw new Error("Verify email response did not return ok=true");
    }
    hasSentMail.value = true;
  } catch (e: unknown) {
    const msg = await parseApiError(e as Error | string);
    error.value = msg;
  } finally {
    loading.value = false;
  }
}

definePageMeta({
  middleware: ["auth"],
});
</script>
