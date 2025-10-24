<template>
  <div class="awdkjhawdkjh">
    <UPageHero
      :headline="`soc-inno v${pkgVersion}`"
      title="Explore sociological cases"
      description="A Nuxt/Vue-integrated UI library providing a rich set of fully-styled, accessible and highly customizable components for building modern web applications."
      :links="[
        {
          label: 'Browse cases',
          class: 'cursor-pointer',
          to: '/cases/browse',
        },
        {
          label: 'Create a new case',
          to: '/cases/new',
          color: 'secondary',
          variant: 'outline',
        },
      ]"
    />
    <div v-if="error" class="text-center text-error-500" v-text="error" />
  </div>
</template>

<script setup lang="ts">
useToasters();
const casesStore = useCasesStore();
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
const versionStore = useVersionStore();
const { version: pkgVersion } = storeToRefs(versionStore);
await useAsyncData("version", versionStore.refreshVersion, {
  immediate: true,
  server: true,
});
</script>
