<template>
  <div class="relative flex items-center">
    <UInputMenu
      v-model="model"
      class="w-full"
      :size="size"
      placeholder="Vælg sektor"
      value-key="value"
      :items="items"
    />
    <ClearInputButton v-if="model" @click="reset" />
  </div>
</template>
<script setup lang="ts">
import { ORGANIZATION_SECTORS, type OrganizationSector } from "~~/shared/utils/organization_sector";
const model = defineModel<OrganizationSector>();

defineProps({
  size: {
    type: String as PropType<'xs' | 'sm' | 'md' | 'lg' | 'xl'>,
    required: false,
    default: () => 'md',
  },
});

const items = Object.entries(ORGANIZATION_SECTORS).map(
  ([_orgSect, sectVal]) => {
    return {
      label: sectVal.human,
      value: sectVal.value,
    };
  },
);

function reset() {
  model.value = undefined;
}
</script>
