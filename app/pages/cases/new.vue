<template>
  <UContainer class="mt-12 mb-16 2xl:mt-16">
    <UBreadcrumb
      separator-icon="i-lucide-arrow-right"
      :items="breadcrumb"
      class="mb-3"
    />
    <PageTitle>Create new case</PageTitle>
    <CaseForm />
  </UContainer>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from "@nuxt/ui";
useToasters();
const breadcrumb = ref<BreadcrumbItem[]>([
  {
    label: "Cases",
    icon: "i-lucide-book-open",
    to: "/cases",
  },
  {
    label: "Create new",
    to: "/cases/new",
  },
]);
definePageMeta({
  middleware: ["auth"],
});
</script>
