<template>
  <div>
    <UContainer v-if="error" class="mt-12 mb-16 2xl:mt-16">
      <UCard variant="subtle">
        <div>
          <span class="text-error-500">Fejlbesked: {{ error }}</span>
        </div>
      </UCard>
    </UContainer>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute();
const error = ref("");
const token = ref("");
const email = ref("");
const tokenRaw = route.query?.token;
const emailRaw = route.query?.email;
const { openResetPasswordModal } = useModals();

onMounted(() => {
  if (!tokenRaw || !emailRaw || typeof tokenRaw !== "string") {
    error.value = "Ugyldig URL";
    // TODO: report
    // await navigateTo('/');
  } else {
    token.value = tokenRaw as string;
    email.value = fromBase64Url(emailRaw as string);
    openResetPasswordModal(tokenRaw as string);
  }
});
</script>
