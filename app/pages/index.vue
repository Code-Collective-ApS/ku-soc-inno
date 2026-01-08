<template>
  <div>
    <UPageHero
      :headline="`soc-inno v${pkgVersion}`"
      title="Udforsk sociologiske cases"
      description="Soc-inno er et offentligt arkiv over sociologiske cases og tilhørende løsninger."
      :links="[
        {
          label: 'Browse cases',
          class: 'cursor-pointer',
          to: '/cases/browse',
        },
        {
          label: 'Opret ny case',
          to: '/cases/new',
          color: 'secondary',
          variant: 'subtle',
        },
      ]"
    />
    <div v-if="error" class="text-center text-error-500" v-text="error" />
  </div>
</template>

<script setup lang="ts">
import { useCasesStore } from "~/stores/useCasesStore";
import { useVersionStore } from "~/stores/useVersionStore";

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
