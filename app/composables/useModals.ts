import CreateAccountModal from "~/components/CreateAccountModal.vue";
import LoginModal from "~/components/LoginModal.vue";

export function useModals() {
  const overlay = useOverlay();
  const loginModal = overlay.create(LoginModal);
  const createAccountModal = overlay.create(CreateAccountModal);

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

  return {
    openLoginModal,
    openCreateAccountModal,
  };
}
