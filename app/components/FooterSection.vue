<template>
  <UFooter class="bg-secondary-50 py-12">
    <div class="flex flex-col items-center gap-3">
      <UTooltip text="Open GitHub repository in new tab">
        <p class="text-sm text-gray-500">
          This application is open source (MIT).
        </p>
        <UButton
          class="opacity-90"
          color="neutral"
          variant="ghost"
          to="https://github.com/Code-Collective-ApS/ku-soc-inno"
          target="_blank"
          icon="mdi:github"
          aria-label="GitHub repository"
        />
      </UTooltip>
      <p class="text-sm text-gray-500">
        Københavns Universitet &copy;
        <span v-text="new Date().getFullYear()" />
      </p>
      <KULogo class="mt-6" />
    </div>
  </UFooter>
</template>
