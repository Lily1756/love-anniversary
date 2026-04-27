import { ref } from 'vue'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface SaveResult {
  success: boolean
  error?: string
}

interface TriggerSaveOptions {
  delayMs?: number
  savingMessage?: string
  successMessage?: string
}

export function useDebouncedSave() {
  const saveStatus = ref<SaveStatus>('idle')
  const saveMessage = ref('')
  let saveTimer: ReturnType<typeof setTimeout> | null = null

  function setSaveState(status: SaveStatus, message: string) {
    saveStatus.value = status
    saveMessage.value = message
  }

  function triggerDebouncedSave(
    saveAction: () => Promise<SaveResult>,
    options: TriggerSaveOptions = {}
  ) {
    const {
      delayMs = 800,
      savingMessage = '正在保存...',
      successMessage = '已保存',
    } = options

    if (saveTimer) clearTimeout(saveTimer)
    setSaveState('saving', savingMessage)

    saveTimer = setTimeout(async () => {
      const result = await saveAction()
      if (result.success) {
        setSaveState('saved', successMessage)
        setTimeout(() => {
          if (saveStatus.value === 'saved') {
            saveStatus.value = 'idle'
          }
        }, 2000)
      } else {
        setSaveState('error', `保存失败: ${result.error}`)
      }
    }, delayMs)
  }

  return {
    saveStatus,
    saveMessage,
    setSaveState,
    triggerDebouncedSave,
  }
}
