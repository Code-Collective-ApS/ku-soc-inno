import CreateAccountModal from "../components/CreateAccountModal.vue";
import LoginModal from "../components/LoginModal.vue";
import FancyImageModal from "../components/FancyImageModal.vue";
import { useOverlay } from "#imports";

export function useModals() {
  const overlay = useOverlay();
  const loginModal = overlay.create(LoginModal);
  const createAccountModal = overlay.create(CreateAccountModal);
  const imageModal = overlay.create(FancyImageModal);

  async function openLoginModal(): Promise<boolean> {
    console.log("login modal opening!");
    const modalInstance = loginModal.open({});
    const result = await modalInstance.result;
    console.log("login modal close with reuslt:", result);
    return result;
  }
  async function openCreateAccountModal(): Promise<boolean> {
    console.log("create account modal opening!");
    const modalInstance = createAccountModal.open({});
    const result = await modalInstance.result;
    console.log("create account modal close with reuslt:", result);
    return result;
  }

  async function openFancyImageModal(src: string): Promise<boolean> {
    const modalInstance = imageModal.open({ src });
    const result = await modalInstance.result;
    return result;
  }

  return {
    openLoginModal,
    openCreateAccountModal,
    openFancyImageModal,
  };
}
