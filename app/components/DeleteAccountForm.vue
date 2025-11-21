<template>
  <div>
    <div>
      <p class="text-sm mb-3 max-w-xl w-full">
        Du kan til enhver tid slette alle dine data.
      </p>
      <p class="text-sm max-w-xl mb-6">
        Dine publicerede løsninger og cases vil stadig være tilgængelige. Hvis
        du gerne vil slette dem, opfordrer vi dig til at gøre det først.
      </p>
    </div>
    <div class="flex flex-col gap-6">
      <div>
        <UButton
          class="cursor-pointer"
          variant="subtle"
          color="error"
          @click="confirmDeleteAccount"
        >
          Slet konto
        </UButton>
      </div>
      <UAlert
        v-if="errorMsg"
        :description="errorMsg"
        variant="subtle"
        color="error"
        icon="i-mdi-error-outline"
        class="light:text-error-600"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ConfirmModal } from "#components";

const { fetch } = useUserSession();
const overlay = useOverlay();
const modalConfirm = overlay.create(ConfirmModal, {
  props: {
    title: "Bekræft sletning af data",
    description:
      "Er du sikker på at du vil slette din konto ? Denne handling kan ikke fortydes.",
  },
});
const loading = ref(false);
const errorMsg = ref("");
const toast = useToast();

async function confirmDeleteAccount() {
  const ok = await modalConfirm.open();
  if (ok) {
    $fetch("/api/users/delete-my-account", {
      method: "DELETE",
      onResponse: async (ctx) => {
        if (ctx.response.status !== 204) {
          const msg = await parseApiError(ctx.error || ctx.response._data);
          errorMsg.value = msg;
        } else {
          toast.add({
            title: "Din konto er slettet, permanent",
            color: "success",
            icon: "i-mdi-check",
            duration: 60000, // one full minute
          });
          fetch();
          navigateTo("/");
        }
        loading.value = false;
      },
      onResponseError: async (ctx) => {
        errorMsg.value = await parseApiError(ctx.error || ctx.response._data);
        loading.value = false;
      },
    });
  }
}
</script>
