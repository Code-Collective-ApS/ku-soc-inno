<template>
  <div class="flex gap-1.5 items-center">
    <div v-if="c">
      <UBadge
        class="cursor-pointer transition-all hover:bg-sky-200"
        size="md"
        variant="soft"
        color="info"
        :label="getPrettySector(c.sector as OrganizationSector)"
        icon="i-mdi-briefcase-outline"
        :ui="{
          label: 'truncate pl-[19px]',
          leadingIcon: 'shrink-0 w-[14px] h-[14px] absolute',
        }"
        @click="() => emit('click:orgsector', c!.sector)"
      />
    </div>
    <div v-if="c && c.organizationType">
      <UBadge
        class="cursor-pointer transition-all hover:bg-sky-200"
        size="md"
        variant="soft"
        color="info"
        :label="getPrettyOrgType(c.organizationType as OrganizationType)"
        icon="i-mdi-account-supervisor"
        :ui="{
          label: 'truncate pl-[19px]',
          leadingIcon: 'shrink-0 w-[15px] h-[15px] absolute',
        }"
        @click="() => emit('click:orgtype', c!.organizationType)"
      />
    </div>
    <div v-for="tag in c?.categoryTags || []" :key="tag.id">
      <UBadge
        class="cursor-pointer transition-all hover:bg-sky-200"
        size="md"
        variant="soft"
        color="secondary"
        :label="tag.tag"
        @click="() => emit('click:tag', tag.tag)"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  c: {
    type: Object as PropType<CaseSerialized>,
    required: false,
    default: () => undefined,
  },
});

const emit = defineEmits<{
  "click:orgsector": [OrganizationSector];
  "click:orgtype": [OrganizationType];
  "click:tag": [string];
}>();
</script>
