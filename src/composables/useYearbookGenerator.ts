import type { Letter } from '@/types'

/**
 * 年度情书电子书生成器
 * 把某年的所有情书渲染成可打印的 HTML 字符串（无外部依赖，纯前端）
 */
export function useYearbookGenerator() {
  /**
   * 把日期字符串格式化为 "XXXX年X月X日"
   */
  function formatFullDate(dateStr: string) {
    const d = new Date(dateStr)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
  }

  /**
   * 按月份对情书分组
   */
  function groupByMonth(letters: Letter[]) {
    const groups: Record<number, Letter[]> = {}
    for (const l of letters) {
      const m = new Date(l.date).getMonth() + 1
      if (!groups[m]) groups[m] = []
      groups[m].push(l)
    }
    return groups
  }

  /**
   * 生成电子书 HTML 字符串
   * @param year  年份
   * @param letters  该年情书数组（调用者负责过滤）
   * @param authorName  署名（可选）
   */
  function generateYearbookHTML(year: number, letters: Letter[], authorName = '你和我') {
    const sorted = [...letters].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    const groups = groupByMonth(sorted)
    const months = Object.keys(groups).map(Number).sort((a, b) => a - b)

    /* ── 目录 HTML ── */
    let tocHTML = ''
    let letterIndex = 0
    for (const m of months) {
      tocHTML += `<div class="toc-month">${m}月</div>`
      for (const l of groups[m] ?? []) {
        letterIndex++
        tocHTML += `
          <div class="toc-item">
            <span class="toc-num">${String(letterIndex).padStart(2, '0')}</span>
            <span class="toc-title">${escapeHTML(l.title)}</span>
            <span class="toc-date">${formatFullDate(l.date)}</span>
          </div>`
      }
    }

    /* ── 正文 HTML ── */
    let bodyHTML = ''
    letterIndex = 0
    for (const m of months) {
      for (const l of groups[m] ?? []) {
        letterIndex++
        const paragraphs = l.content
          .split(/\n+/)
          .filter(p => p.trim())
          .map(p => `<p>${escapeHTML(p)}</p>`)
          .join('')
        bodyHTML += `
          <div class="letter-page">
            <div class="letter-index">${String(letterIndex).padStart(2, '0')}</div>
            <h2 class="letter-title">${escapeHTML(l.title)}</h2>
            <div class="letter-meta-line">
              <span>${formatFullDate(l.date)}</span>
              ${l.tag ? `<span class="tag">${escapeHTML(l.tag)}</span>` : ''}
            </div>
            <div class="letter-body">${paragraphs}</div>
          </div>`
      }
    }

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${year}年 情书集</title>
  <style>
    /* ── 全局 ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    @import url('https://fonts.loli.net/css2?family=Noto+Serif+SC:wght@400;600;700&display=swap');

    :root {
      --morandi-bg: #FDFBF7;
      --morandi-primary: #C4A8A2;
      --morandi-deep: #9B7B76;
      --morandi-text: #3D2E2C;
      --morandi-secondary: #7A6D6B;
      --morandi-border: #E8DFDB;
      --morandi-accent: #D4C4BE;
    }

    html, body {
      background: var(--morandi-bg);
      color: var(--morandi-text);
      font-family: 'Noto Serif SC', 'STSong', 'SimSun', serif;
      line-height: 1.8;
    }

    /* ── 封面 ── */
    .cover {
      width: 100%;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      page-break-after: always;
      position: relative;
      padding: 80px 60px;
      background: linear-gradient(160deg, #FDFBF7 0%, #F2EBE6 100%);
    }
    .cover-ornament {
      font-size: 48px;
      margin-bottom: 32px;
      opacity: 0.6;
    }
    .cover-year {
      font-size: 96px;
      font-weight: 700;
      color: var(--morandi-primary);
      letter-spacing: 8px;
      line-height: 1;
      margin-bottom: 12px;
    }
    .cover-title {
      font-size: 28px;
      color: var(--morandi-deep);
      letter-spacing: 12px;
      margin-bottom: 40px;
    }
    .cover-divider {
      width: 80px;
      height: 1px;
      background: var(--morandi-primary);
      margin: 0 auto 32px;
      opacity: 0.5;
    }
    .cover-subtitle {
      font-size: 15px;
      color: var(--morandi-secondary);
      letter-spacing: 4px;
    }
    .cover-count {
      margin-top: 60px;
      font-size: 13px;
      color: var(--morandi-secondary);
      letter-spacing: 2px;
      border: 1px solid var(--morandi-border);
      padding: 8px 24px;
      border-radius: 999px;
    }
    .cover-footer {
      position: absolute;
      bottom: 48px;
      font-size: 12px;
      color: var(--morandi-secondary);
      opacity: 0.5;
      letter-spacing: 2px;
    }

    /* ── 目录 ── */
    .toc-page {
      padding: 80px 100px;
      page-break-after: always;
      min-height: 100vh;
    }
    .toc-header {
      font-size: 13px;
      letter-spacing: 6px;
      color: var(--morandi-secondary);
      text-transform: uppercase;
      margin-bottom: 48px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--morandi-border);
    }
    .toc-month {
      font-size: 11px;
      letter-spacing: 4px;
      color: var(--morandi-primary);
      margin: 24px 0 8px;
      text-transform: uppercase;
    }
    .toc-item {
      display: flex;
      align-items: baseline;
      gap: 12px;
      padding: 6px 0;
      border-bottom: 1px dotted var(--morandi-border);
    }
    .toc-num {
      font-size: 11px;
      color: var(--morandi-primary);
      min-width: 24px;
      flex-shrink: 0;
    }
    .toc-title {
      flex: 1;
      font-size: 14px;
      color: var(--morandi-text);
    }
    .toc-date {
      font-size: 11px;
      color: var(--morandi-secondary);
      flex-shrink: 0;
    }

    /* ── 情书正文 ── */
    .letter-page {
      padding: 80px 120px;
      page-break-before: always;
      min-height: 100vh;
      position: relative;
    }
    .letter-index {
      font-size: 11px;
      letter-spacing: 3px;
      color: var(--morandi-primary);
      margin-bottom: 24px;
    }
    .letter-title {
      font-size: 26px;
      font-weight: 600;
      color: var(--morandi-text);
      margin-bottom: 16px;
      line-height: 1.4;
    }
    .letter-meta-line {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      color: var(--morandi-secondary);
      margin-bottom: 40px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--morandi-border);
    }
    .tag {
      background: var(--morandi-accent);
      color: var(--morandi-deep);
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 11px;
    }
    .letter-body p {
      font-size: 15px;
      color: var(--morandi-text);
      line-height: 2;
      margin-bottom: 16px;
      text-indent: 2em;
    }

    /* ── 打印 ── */
    @media print {
      .print-btn { display: none !important; }
      .cover, .toc-page, .letter-page { page-break-after: always; }
      @page { margin: 0; size: A4; }
    }

    /* ── 打印按钮（仅预览时可见） ── */
    .print-btn {
      position: fixed;
      bottom: 32px;
      right: 32px;
      background: var(--morandi-primary);
      color: white;
      border: none;
      border-radius: 999px;
      padding: 14px 28px;
      font-size: 14px;
      font-family: inherit;
      letter-spacing: 2px;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(196,168,162,0.4);
      transition: all 0.2s;
      z-index: 999;
    }
    .print-btn:hover {
      background: var(--morandi-deep);
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(196,168,162,0.5);
    }
  </style>
</head>
<body>

  <!-- 封面 -->
  <div class="cover">
    <div class="cover-ornament">💌</div>
    <div class="cover-year">${year}</div>
    <div class="cover-title">情 书 集</div>
    <div class="cover-divider"></div>
    <div class="cover-subtitle">${escapeHTML(authorName)}</div>
    <div class="cover-count">共 ${sorted.length} 封情书</div>
    <div class="cover-footer">以文字留住每一个相爱的瞬间</div>
  </div>

  <!-- 目录 -->
  <div class="toc-page">
    <div class="toc-header">目 录 · Contents</div>
    ${tocHTML}
  </div>

  <!-- 正文 -->
  ${bodyHTML}

  <!-- 打印按钮 -->
  <button class="print-btn" onclick="window.print()">保存为 PDF ↗</button>

</body>
</html>`
  }

  /**
   * 转义 HTML 特殊字符，防止 XSS
   */
  function escapeHTML(str: string) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  /**
   * 在新标签页中预览电子书
   */
  function openYearbook(year: number, letters: Letter[], authorName?: string) {
    const html = generateYearbookHTML(year, letters, authorName)
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const win = window.open(url, '_blank')
    // 延迟释放 URL，确保新窗口加载完成
    setTimeout(() => URL.revokeObjectURL(url), 30000)
    return win
  }

  return {
    generateYearbookHTML,
    openYearbook
  }
}
