/**
 * 数据路径常量
 * 重要：所有数据引用必须通过此文件，确保路径一致性
 */

// 线上数据路径 - 构建时从 public/ 提供
export const DATA_PATHS = {
  // 静态数据
  PHOTOS: '/data/photos.json',
  ALBUMS: '/data/albums.json',
  TRAVELS: '/data/travels.json',
  DIARIES: '/data/diaries.json',
  WISHES: '/data/wishes.json',
  CAPSULES: '/data/capsules.json',
  CONFIG: '/data/config.json',

  // 获取完整路径（用于 fetch 等）
  getPhotoData: () => '/data/photos.json',
  getTravelData: () => '/data/travels.json',
  getDiaryData: () => '/data/diaries.json',
  getWishData: () => '/data/wishes.json',
  getCapsuleData: () => '/data/capsules.json',
}

// 开发环境数据路径前缀
export const DEV_DATA_PREFIX = import.meta.env.DEV
  ? '/data'  // Vite 开发服务器从 public 提供
  : '/data'  // 生产环境从根路径

// 本地隔离区路径（不提交到 Git）
export const LOCAL_BACKUP_PATHS = {
  ROOT: '.local_backup/',
  TEST_DATA: '.local_backup/test_data/',
  DATA_HISTORY: '.local_backup/data_history/',
  ARCHIVED_VERSIONS: '.local_backup/archived_versions/',
}

// 数据操作规则
export const DATA_RULES = `
数据存储规则：
1. 线上数据 → 必须存放在 public/data/
2. 本地测试 → 必须存放在 .local_backup/test_data/
3. 历史备份 → 必须存放在 .local_backup/data_history/

禁止：
- 在根目录创建 data/ 文件夹
- 在 dist/ 中存放源数据
- 直接引用相对路径如 ../data/
`

// 验证路径是否符合规范
export function validateDataPath(path: string): boolean {
  // 必须是绝对路径或以 /data/ 开头
  return path.startsWith('/data/') || path.startsWith('public/data/')
}

// 获取标准化的 GitHub 路径（用于 saveViaGithub）
export function getStandardGithubPath(fileName: string): string {
  if (!fileName.endsWith('.json')) {
    fileName += '.json'
  }
  return `public/data/${fileName}`
}
