<template>
  <UInputMenu
    v-model="value"
    class="w-full"
    placeholder="Vælg/skriv type af organisation"
    value-key="value"
    :items="items"
    create-item
    @create="onCreate"
  >
    <template #create-item-label="{ item }"> Vælg "{{ item }}" </template>
  </UInputMenu>
</template>
<script setup lang="ts">
import { ORGANIZATION_TYPES } from "~~/shared/utils/organization_type";
const items = ref(
  Object.entries(ORGANIZATION_TYPES).map(([_orgType, orgVal]) => {
    return {
      label: orgVal.human,
      value: orgVal.value,
    };
  }),
);

const value = defineModel<string>();

function onCreate(item: string) {
  items.value.push({ label: item, value: item });
  value.value = item;
}
</script>
