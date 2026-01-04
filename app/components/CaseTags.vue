<template>
<div class="flex gap-1.5 items-center">
  <div v-if="c">
    <UBadge
      size="md"
      variant="soft"
      color="info"
      :label="getPrettySector(c.sector as OrganizationSector)"
      icon="i-mdi-briefcase-outline"
      :ui="{
        label: 'truncate pl-[19px]',
        leadingIcon: 'shrink-0 w-[14px] h-[14px] absolute'
      }"
    />
  </div>
  <div v-if="c">
    <UBadge
      size="md"
      variant="soft"
      color="info"
      :label="getPrettyOrgType(c.organizationType as OrganizationType)"
      icon="i-mdi-account-supervisor"
      :ui="{
        label: 'truncate pl-[19px]',
        leadingIcon: 'shrink-0 w-[15px] h-[15px] absolute'
      }"
    />
  </div>
  <div v-for="tag in (c?.categoryTags || [])" :key="tag.id">
    <UBadge size="md" variant="soft" color="secondary" :label="tag.tag" />
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
</script>
