import { ref } from 'vue'

interface UseEditAuthOptions {
  password: string
  onEnterEditMode?: () => void
  onExitEditMode?: () => void
}

export function useEditAuth(options: UseEditAuthOptions) {
  const isEditMode = ref(false)
  const showAuth = ref(false)
  const authPassword = ref('')
  const authError = ref(false)

  function openAuthModal() {
    showAuth.value = true
  }

  function verifyAuth() {
    if (authPassword.value.trim() === options.password) {
      isEditMode.value = true
      showAuth.value = false
      authPassword.value = ''
      authError.value = false
      options.onEnterEditMode?.()
      return true
    }

    authError.value = true
    authPassword.value = ''
    return false
  }

  function exitEditMode() {
    isEditMode.value = false
    options.onExitEditMode?.()
  }

  return {
    isEditMode,
    showAuth,
    authPassword,
    authError,
    openAuthModal,
    verifyAuth,
    exitEditMode,
  }
}
