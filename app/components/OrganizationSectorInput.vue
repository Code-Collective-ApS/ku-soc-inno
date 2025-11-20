<template>
  <UInputMenu
    class="w-full"
    placeholder="Vælg sektor"
    value-key="value"
    :items="items"
  />
</template>
<script setup lang="ts">
import { ORGANIZATION_SECTORS } from "~~/shared/utils/organization_sector";
const items = Object.entries(ORGANIZATION_SECTORS).map(
  ([_orgSect, sectVal]) => {
    return {
      label: sectVal.human,
      value: sectVal.value,
    };
  },
);
</script>
