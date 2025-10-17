<template>
  <UContainer class="mt-12 mb-16 2xl:mt-16">
    <UBreadcrumb
      separator-icon="i-lucide-arrow-right"
      :items="breadcrumb"
      class="mb-3"
    />
    <PageTitle>Browse cases</PageTitle>
    <UTable :data="cases" :loading="pendingCases" />
    <div v-if="error" class="text-error-500" v-text="error" />
  </UContainer>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from "@nuxt/ui";
useToasters();
const casesStore = useCasesStore();
const { cases, pendingCases } = storeToRefs(casesStore);
const casesOffset = ref(0);
const casesTake = ref(6);
const { error } = await useAsyncData(
  "cases",
  () => casesStore.fetchCases(casesTake, casesOffset),
  {
    immediate: true,
    server: false,
  },
);
const breadcrumb = ref<BreadcrumbItem[]>([
  {
    label: "Cases",
    icon: "i-lucide-book-open",
    to: "/cases",
  },
  {
    label: "Browse",
  },
]);
</script>
