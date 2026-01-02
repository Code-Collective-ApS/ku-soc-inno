<template>
<div class="relative flex items-center">
  <UInputMenu
    v-model="value"
    class="w-full"
    placeholder="Vælg/skriv type af organisation"
    value-key="value"
    :items="items"
    create-item
    :size="size"
    clear
    @create="onCreate"
  >
    <template #create-item-label="{ item }"> Vælg "{{ item }}" </template>
  </UInputMenu>
  <ClearInputButton v-if="value" @click="reset" />
</div>
</template>
<script setup lang="ts">
import { ORGANIZATION_TYPES, type OrganizationType } from "~~/shared/utils/organization_type";
const items = ref(
  Object.entries(ORGANIZATION_TYPES).map(([_orgType, orgVal]) => {
    return {
      label: orgVal.human,
      value: orgVal.value,
    };
  }),
);

defineProps({
  size: {
    type: String as PropType<'xs' | 'sm' | 'md' | 'lg' | 'xl'>,
    required: false,
    default: () => 'md',
  },
});

const value = defineModel<OrganizationType | string>();

function onCreate(item: string) {
  items.value.push({ label: item, value: item });
  value.value = item;
}

function reset() {
  value.value = undefined;
}
</script>
