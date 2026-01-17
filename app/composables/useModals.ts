import CreateAccountModal from "../components/CreateAccountModal.vue";
import LoginModal from "../components/LoginModal.vue";
import FancyImageModal from "../components/FancyImageModal.vue";
import ConfirmModal from "../components/ConfirmModal.vue";
import ForgotPasswordModal from "../components/ForgotPasswordModal.vue";
import { useOverlay, useRoute, computed, watch } from "#imports";
import ResetPasswordModal from "~/components/ResetPasswordModal.vue";
import type { LocationQuery } from "vue-router";

export function useModals() {
  const route = useRoute();
  const _path = computed(() => route.path);
  const _query = computed(() => route.query);
  const overlay = useOverlay();
  const loginModal = overlay.create(LoginModal);
  const createAccountModal = overlay.create(CreateAccountModal);
  const imageModal = overlay.create(FancyImageModal);
  const forgotPasswordModal = overlay.create(ForgotPasswordModal);
  const confirmModal = overlay.create(ConfirmModal);
  const resetPasswordModal = overlay.create(ResetPasswordModal);

  async function openLoginModal(): Promise<boolean> {
    const modalInstance = loginModal.open({});
    const result = await modalInstance.result;
    return result;
  }
  async function openCreateAccountModal(): Promise<boolean> {
    const modalInstance = createAccountModal.open();
    const result = await modalInstance.result;
    return result;
  }

  async function openFancyImageModal(src: string): Promise<boolean> {
    const modalInstance = imageModal.open({ src });
    const result = await modalInstance.result;
    return result;
  }

  async function openForgotPasswordModal(): Promise<boolean> {
    const modalInstance = forgotPasswordModal.open();
    const result = await modalInstance.result;
    return result;
  }
  async function openResetPasswordModal(jwt: string): Promise<boolean> {
    const modalInstance = resetPasswordModal.open({ jwt: jwt });
    const result = await modalInstance.result;
    return result;
  }

  async function openConfirmModal(
    title: string,
    description: string,
  ): Promise<boolean> {
    const modalInstance = confirmModal.open({
      title,
      description,
    });
    const result = await modalInstance.result;
    return result;
  }

  watch(
    [_path, _query],
    ([_, query]: [string, LocationQuery]) => {
      if (query?.openLoginModal === "1") {
        return openLoginModal();
      }
    },
    { immediate: true },
  );

  return {
    openLoginModal,
    openCreateAccountModal,
    openConfirmModal,
    openFancyImageModal,
    openForgotPasswordModal,
    openResetPasswordModal,
  };
}
