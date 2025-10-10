<template>
  <div>
    <!-- TODO: research what this does -->
    <NuxtRouteAnnouncer />
    <UApp>
      <LayoutHeader />
      <UMain>
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </UMain>
      <FooterSection />
    </UApp>
  </div>
</template>
