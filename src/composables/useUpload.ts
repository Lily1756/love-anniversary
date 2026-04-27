import { ref } from 'vue'

const CLOUDINARY_CLOUD_NAME = 'dcpzdsdxc'
const CLOUDINARY_UPLOAD_PRESET = 'love_site_preset'
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

export interface UploadTask {
  id: string
  file: File
  name: string
  progress: number
  status: 'pending' | 'compressing' | 'uploading' | 'done' | 'error'
  url: string
  error: string
}

export function useUpload() {
  const tasks = ref<UploadTask[]>([])
  const isUploading = ref(false)

  function compressImage(file: File, maxWidth = 1920, quality = 0.85): Promise<File> {
    return new Promise((resolve) => {
      if (file.size < 500 * 1024) {
        resolve(file)
        return
      }
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        URL.revokeObjectURL(url)
        let w = img.width
        let h = img.height
        if (w > maxWidth) {
          h = Math.round(h * maxWidth / w)
          w = maxWidth
        }
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }))
          } else {
            resolve(file)
          }
        }, 'image/jpeg', quality)
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve(file)
      }
      img.src = url
    })
  }

  async function uploadFile(file: File): Promise<string> {
    const task: UploadTask = {
      id: `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      name: file.name,
      progress: 0,
      status: 'pending',
      url: '',
      error: '',
    }
    tasks.value.push(task)

    try {
      task.status = 'compressing'
      task.progress = 20
      const compressed = await compressImage(file, 1200, 0.85)

      task.status = 'uploading'
      task.progress = 50

      const formData = new FormData()
      formData.append('file', compressed)
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(30000),
      })

      if (!response.ok) {
        throw new Error(`Cloudinary upload failed: ${response.status}`)
      }

      const data = await response.json()
      task.url = data.secure_url
      task.progress = 100
      task.status = 'done'
      return data.secure_url
    } catch (err: any) {
      task.status = 'error'
      task.error = err.message || '上传失败'
      throw err
    }
  }

  async function uploadFiles(files: FileList | File[]): Promise<string[]> {
    isUploading.value = true
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'))
    const results: string[] = []

    for (const file of imageFiles) {
      try {
        const url = await uploadFile(file)
        results.push(url)
      } catch {
        // 单个文件失败继续上传其他文件
      }
    }

    isUploading.value = false
    return results
  }

  function clearTasks() {
    tasks.value = []
  }

  return {
    tasks,
    isUploading,
    uploadFile,
    uploadFiles,
    clearTasks,
  }
}
