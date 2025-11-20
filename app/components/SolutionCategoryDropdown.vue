<template>
  <UInputMenu
    v-model="value"
    class="w-full"
    placeholder="Vælg/skriv løsningskategori"
    value-key="value"
    :items="items"
    create-item
    multiple
    @create="onCreate"
  >
    <template #create-item-label="{ item }"> Vælg "{{ item }}" </template>
  </UInputMenu>
</template>
<script setup lang="ts">
import { SOLUTION_CATEGORIES } from "~~/shared/utils/solution_categories";
const items = ref(
  Object.entries(SOLUTION_CATEGORIES).map(([_orgType, orgVal]) => {
    return {
      label: orgVal.human,
      value: orgVal.value,
    };
  }),
);

const value = defineModel<string[]>({ default: () => [] });

function onCreate(item: string) {
  items.value.push({ label: item, value: item });
  value.value.push(item);
}
</script>
