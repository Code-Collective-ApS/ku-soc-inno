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
const jwt = ref("");
const email = ref("");
const jwtRaw = route.query?.jwt;
const emailRaw = route.query?.email;
const { openResetPasswordModal } = useModals();

onMounted(() => {
  if (!jwtRaw || !emailRaw || typeof jwtRaw !== "string") {
    error.value = "Ugyldig URL";
    // TODO: report
    // await navigateTo('/');
  } else {
    jwt.value = jwtRaw as string;
    email.value = fromBase64Url(emailRaw as string);
    openResetPasswordModal(jwtRaw as string);
  }
});
</script>
