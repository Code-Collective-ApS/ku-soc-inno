import CreateAccountModal from "../components/CreateAccountModal.vue";
import LoginModal from "../components/LoginModal.vue";
import FancyImageModal from "../components/FancyImageModal.vue";
import ConfirmModal from "../components/ConfirmModal.vue";
import ForgotPasswordModal from "../components/ForgotPasswordModal.vue";
import { useOverlay } from "#imports";
import ResetPasswordModal from "~/components/ResetPasswordModal.vue";
import type { LocationQuery } from "vue-router";

export function useModals() {
  const overlay = useOverlay();
  const loginModal = shallowRef(overlay.create(LoginModal));
  const createAccountModal = shallowRef(overlay.create(CreateAccountModal));
  const imageModal = shallowRef(overlay.create(FancyImageModal));
  const forgotPasswordModal = shallowRef(overlay.create(ForgotPasswordModal));
  const confirmModal = shallowRef(overlay.create(ConfirmModal));
  const resetPasswordModal = shallowRef(overlay.create(ResetPasswordModal));

  async function openLoginModal(): Promise<boolean> {
    console.log("Open login modal called");
    const modalInstance = loginModal.value.open({});
    const result = await modalInstance.result;
    return result;
  }
  async function openCreateAccountModal(): Promise<boolean> {
    const modalInstance = createAccountModal.value.open();
    const result = await modalInstance.result;
    return result;
  }

  async function openFancyImageModal(src: string): Promise<boolean> {
    const modalInstance = imageModal.value.open({ src });
    const result = await modalInstance.result;
    return result;
  }

  async function openForgotPasswordModal(): Promise<boolean> {
    const modalInstance = forgotPasswordModal.value.open();
    const result = await modalInstance.result;
    return result;
  }
  async function openResetPasswordModal(
    resetPasswordToken: string,
  ): Promise<boolean> {
    const modalInstance = resetPasswordModal.value.open({
      token: resetPasswordToken,
    });
    const result = await modalInstance.result;
    return result;
  }

  async function openConfirmModal(
    title: string,
    description: string,
  ): Promise<boolean> {
    const modalInstance = confirmModal.value.open({
      title,
      description,
    });
    const result = await modalInstance.result;
    return result;
  }

  function handleQuery(q: LocationQuery) {
    if (q.openLoginModal === "1") {
      console.log("useModals on mounted openLoginModal()");
      return openLoginModal();
    }
  }

  return {
    openLoginModal,
    openCreateAccountModal,
    openConfirmModal,
    openFancyImageModal,
    openForgotPasswordModal,
    openResetPasswordModal,
    handleQuery,
  };
}
