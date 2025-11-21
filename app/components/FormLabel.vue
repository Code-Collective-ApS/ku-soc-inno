<template>
  <div class="flex items-center gap-x-0.5 mb-1.5">
    <label class="text-sm text-slate-700 dark:text-slate-200 flex items-center">
      <slot />
    </label>
    <span
      v-if="required"
      class="text-sm inline-block -mt-2"
      :class="{ 'text-red-500': !_isValid, 'text-green-500': _isValid }"
      >*</span
    >
  </div>
</template>

<script setup lang="ts">
import { CalendarDate } from "@internationalized/date";

const props = defineProps({
  required: {
    type: Boolean,
    required: false,
    default: false,
  },
  isValid: {
    type: Function as PropType<
      (
        v: AnyObject | AnyType | Date | Omit<CalendarDate, "#private">,
      ) => boolean
    >,
    required: false,
    default: (v: AnyObject | AnyType) => !!v,
  },
  value: {
    type: [Object, String, Number, CalendarDate] as PropType<
      AnyObject | AnyType | Date | Omit<CalendarDate, "#private">
    >,
    required: false,
    default: undefined,
  },
});

const _isValid = computed(() => {
  if (!props.value) return false;
  return props.isValid(props.value);
});
</script>
