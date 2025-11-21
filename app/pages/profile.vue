<template>
  <UContainer class="mt-12 mb-16 2xl:mt-16">
    <PageTitle>Profil</PageTitle>
    <div>
      <UCard class="mb-9" variant="subtle">
        <template #header> Skift email </template>
        <ChangeEmailForm />
      </UCard>
      <UCard class="mb-9" variant="subtle">
        <template #header> Skift password </template>
        <ChangePasswordForm />
      </UCard>
      <UCard variant="subtle">
        <template #header> Slet konto </template>
        <DeleteAccountForm />
      </UCard>
    </div>
  </UContainer>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: ["auth"],
});
</script>
