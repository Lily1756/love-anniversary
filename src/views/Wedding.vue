<template>
  <div class="wedding-page">
    <!-- 顶部导航 -->
    <nav class="wedding-nav">
      <router-link to="/" class="back-link">← 纪念册</router-link>
      <a v-for="item in navItems" :key="item.id" :href="'#' + item.id" @click.prevent="scrollTo(item.id)">{{ item.label }}</a>
    </nav>

    <div class="wedding-main">
      <!-- Hero -->
      <header class="wedding-hero">
        <span class="hero-tag">旅行婚礼 + 答谢宴</span>
        <h1>从双方父母见面到答谢宴完成<br>全程执行手册</h1>
        <p class="hero-subtitle">2026年5月 — 2027年6月 · 放缓节奏 · 享受旅程</p>
        <div class="hero-divider" />
      </header>

      <!-- 一、大节点时间轴 -->
      <section id="timeline">
        <h2 class="section-title">⏳ 大节点时间轴</h2>
        <div class="timeline">
          <div v-for="(item, i) in timelineItems" :key="i" class="tl-item" :class="{ milestone: item.milestone }">
            <div class="tl-date">{{ item.date }}</div>
            <div class="tl-title">{{ item.title }}</div>
            <div class="tl-desc">{{ item.desc }}</div>
          </div>
        </div>
      </section>

      <!-- 二、分阶段 Todo -->
      <section id="phases">
        <h2 class="section-title">📦 分阶段 Todo 清单</h2>
        <div v-for="phase in phases" :key="phase.id" class="phase-card">
          <h3 class="phase-header">{{ phase.header }}</h3>
          <p v-if="phase.date" class="phase-date">{{ phase.date }}</p>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th v-for="h in phase.tableHeaders" :key="h">{{ h }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, ri) in phase.rows" :key="ri">
                  <td v-for="(cell, ci) in row" :key="ci" v-html="cell" />
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="phase.note" class="note-box" v-html="phase.note" />
        </div>
      </section>

      <!-- 三、日历视图 -->
      <section id="calendar">
        <h2 class="section-title">📅 2026年日历视图</h2>
        <div class="cal-section">
          <div v-for="month in calendarMonths" :key="month.name" class="cal-block">
            <div class="cal-month-title">📅 {{ month.name }}</div>
            <div v-for="(item, i) in month.items" :key="i" class="cal-item">
              <span class="cal-date">{{ item.date }}</span>
              <span v-if="item.tag" class="cal-tag" :class="item.tagClass">{{ item.tag }}</span>
              <span v-html="item.text" />
            </div>
          </div>
        </div>
      </section>

      <!-- 四、检查点 -->
      <section id="checkpoints">
        <h2 class="section-title">✅ 关键决策检查点</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>检查点</th><th>最晚日期</th><th>决策内容</th><th>必须完成</th></tr>
            </thead>
            <tbody>
              <tr v-for="(cp, i) in checkpoints" :key="i">
                <td>检查点{{ i + 1 }}</td>
                <td>{{ cp.date }}</td>
                <td v-html="cp.content" />
                <td v-html="cp.required" />
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- 五、分工 -->
      <section id="division">
        <h2 class="section-title">👫 男女分工</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>时间段</th><th>男方</th><th>女方</th><th>共同</th></tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in divisionRows" :key="i">
                <td><strong>{{ row.period }}</strong></td>
                <td>{{ row.male }}</td>
                <td>{{ row.female }}</td>
                <td>{{ row.together }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <footer class="wedding-footer">
        <p>旅行婚礼+答谢宴 · 全程执行手册 © 2026-2027</p>
        <p style="font-size:0.7rem;">放缓节奏 · 享受旅程 · 幸福绵长</p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
const navItems = [
  { id: 'timeline', label: '时间轴' },
  { id: 'phases', label: '各阶段' },
  { id: 'calendar', label: '日历' },
  { id: 'checkpoints', label: '检查点' },
  { id: 'division', label: '分工' },
]

function scrollTo(id: string) {
  const el = document.getElementById(id)
  if (el) {
    const top = el.getBoundingClientRect().top + window.pageYOffset - 64
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

const timelineItems = [
  { date: '2026.05.02', title: '💎 双方父母正式见面', desc: '敲定彩礼、订婚时间；试探旅行婚礼态度', milestone: true },
  { date: '2026.05.10', title: '💡 三金/钻戒购买（提前）', desc: '订婚可用' },
  { date: '2026.05.10', title: '北京购房策略对齐', desc: '确定区域、预算、户型' },
  { date: '2026.05.31', title: '北京第一轮看房完成', desc: '锁定目标小区范围' },
  { date: '2026.06.14', title: '北京第二轮看房完成', desc: '聚焦2-3个满意小区' },
  { date: '2026.06.30', title: '💡 婚纱照拍摄完成（提前）', desc: '精修时间充裕' },
  { date: '2026.06.30', title: '💡 婚前体检完成（提前）', desc: '发现问题可调理' },
  { date: '2026.07.31', title: '💡 婚礼策划咨询完成（提前）', desc: '锁定心仪团队' },
  { date: '2026.08.31', title: '代县购房看房完成', desc: '男方父母同步视频' },
  { date: '2026.09.15', title: '北京交定金 / 代县签约', desc: '锁定房源' },
  { date: '2026.09.15', title: '💡 婚纱礼服试穿/定制（提前）', desc: '轻婚纱提前准备' },
  { date: '2026.09.26-27', title: '💎 订婚仪式', desc: '完成订婚', milestone: true },
  { date: '2026.10.31', title: '💡 答谢宴餐厅踩点完成（提前）', desc: '锁定餐厅' },
  { date: '2026.11.15', title: '💎 领取结婚证', desc: '全国通办', milestone: true },
  { date: '2026.11.15', title: '旅行婚礼机票/酒店预订完成', desc: '提前锁定价格' },
  { date: '2026.12.31', title: '旅行婚礼策划/流程/服装确定', desc: '筹备完毕' },
  { date: '2027.02.15', title: '💡 轻婚纱/礼服购买或租赁到位', desc: '旅行用' },
  { date: '2027.03.31', title: '签证/旅行物品准备完毕', desc: '出发倒计时' },
  { date: '2027.04.15', title: '抵达旅行目的地', desc: '提前适应' },
  { date: '2027.04-05', title: '💎 旅行婚礼', desc: '仪式+旅拍+蜜月', milestone: true },
  { date: '2027.06', title: '💎 答谢宴', desc: '播放视频，宴请亲友', milestone: true },
]

const phases = [
  {
    id: 'phase1',
    header: '🎯 第一阶段：双方父母见面（2026.04.25 - 05.05）',
    tableHeaders: ['最晚完成时间', 'Todo', '产出物', '负责人'],
    rows: [
      ['<span class="pill">4月25日</span>', '两人内部对齐：彩礼、订婚时间、旅行婚礼倾向', '《两人内部共识清单》', '两人共同'],
      ['<span class="pill">4月27日</span>', '各自向父母探底：彩礼预期、订婚态度、旅行婚礼态度', '《男方/女方父母摸底反馈》', '两人各自'],
      ['<span class="pill">4月27日</span>', '交换摸底结果，预判冲突点', '《冲突预判与应对表》', '两人共同'],
      ['<span class="pill">4月28日</span>', '选定见面餐厅，预订包间', '餐厅确认', '男为主，女配合'],
      ['<span class="pill">4月29日</span>', '确认参与人员、上门人数、见面流程、角色分工', '《见面流程表》《角色分工表》', '两人共同'],
      ['<span class="pill">4月30日</span>', '男方采购见面礼、准备红包、父母整理着装', '见面礼到位', '男方'],
      ['<span class="pill">5月1日</span>', '女方家整理准备、提醒父母注意事项、准备应急方案', '准备就绪', '女方'],
    ],
  },
  {
    id: 'phase2',
    header: '🏠 第二阶段：提前启动期 + 北京购房（2026.05.03 - 09.30）',
    date: '💡 标记项为可提前启动事项，与主线并行推进',
    tableHeaders: ['最晚完成时间', 'Todo', '要求/产出', '负责人', '备注'],
    rows: [
      ['<span class="pill">5月10日</span>', '北京购房策略对齐', '确定区域、预算、户型、学区、贷款比例', '两人共同', ''],
      ['<span class="pill gold">5月10日</span>', '💡 三金/钻戒购买（提前）', '订婚仪式如需交换戒指，提前备好', '女为主', '关注金价促销'],
      ['<span class="pill">5月17日</span>', '线上筛选北京房源', '锁定5-8个目标小区，建立看房清单', '两人', '贝壳/链家'],
      ['<span class="pill gold">5月17日</span>', '💡 领证证件照拍摄（提前）', '找好工作室，状态好时拍', '两人', '全国通办'],
      ['<span class="pill">5月31日</span>', '北京第一轮看房完成', '每次3-5套，拍照记录，评分对比', '两人', '利用周末'],
      ['<span class="pill">6月14日</span>', '北京第二轮看房完成', '聚焦2-3个最满意小区，反复对比', '两人', '利用周末'],
      ['<span class="pill gold">6月30日</span>', '💡 婚纱照拍摄完成（提前）', '利用看房间隙周末；避开旺季', '两人（女为主）', '风格确定即可'],
      ['<span class="pill gold">6月30日</span>', '💡 婚前体检完成（提前）', '三甲医院或妇幼保健院', '两人共同', '部分项目有效期6个月'],
      ['<span class="pill gold">7月31日</span>', '💡 婚礼策划咨询完成（提前）', '了解目的地婚礼市场，锁定心仪团队', '女为主', '只咨询不定'],
      ['<span class="pill">8月15日</span>', '代县购房需求明确', '父母住+回老家；确定面积、楼层、预算', '两人+男方父母', '远程沟通'],
      ['<span class="pill">8月31日</span>', '男方父母代县看房完成', '锁定2-3套，拍照视频同步新人', '男方父母', '新人远程决策'],
      ['<span class="pill">9月15日</span>', '北京交定金+签认购书', '定金一般10万以内，明确违约条款', '两人', ''],
      ['<span class="pill">9月15日</span>', '代县谈判+签约', '确定价格、付款方式', '男方+父母', '流程简单'],
      ['<span class="pill gold">9月15日</span>', '💡 婚纱礼服试穿/定制（提前）', '旅行婚礼轻婚纱，轻便易携带', '女为主', ''],
    ],
  },
  {
    id: 'phase3',
    header: '💍 第三阶段：订婚筹备（2026.09.01 - 10.11）',
    tableHeaders: ['最晚完成时间', 'Todo', '要求/产出', '负责人'],
    rows: [
      ['<span class="pill">9月15日</span>', '细化聘礼/六礼/三金清单', '确定彩礼、三金、改口费具体数额与交付方式', '两人与父母'],
      ['<span class="pill">9月20日</span>', '确定订婚具体日期', '建议：9月26-27日或10月10-11日，避开国庆高铁高峰', '两人与父母'],
      ['<span class="pill">9月25日</span>', '确认订婚场所与流程', '订场地、定流程、确定司仪或长辈致辞、准备红包', '两人共同'],
      ['<span class="pill">9月30日</span>', '订婚物品准备到位', '选购订婚戒指、准备礼金、通知亲友、预订高铁票', '两人分头'],
      ['<span class="pill green">9.26-27/10.10-11</span>', '💎 举行订婚仪式', '登门下聘、交换戒指、敬茶等环节；不要临时加环节；不聊买房', '两家人协同'],
    ],
    note: '<strong>日期选择建议：</strong><br>• <strong>9月26-27日</strong>：国庆前一周，高铁票好买，亲友时间充裕<br>• <strong>10月10-11日</strong>：国庆后一周，避开高峰，需考虑亲友节后上班<br>• <strong>不推荐10月1-7日</strong>：高铁票紧张，酒店涨价',
  },
  {
    id: 'phase4',
    header: '📝 第四阶段：领证 + 旅行婚礼筹备（2026.10 - 12）',
    tableHeaders: ['最晚完成时间', 'Todo', '要求/产出', '负责人'],
    rows: [
      ['<span class="pill">10月31日</span>', '确定旅行婚礼方案', '目的地、日期、预算、参与人员', '两人共同'],
      ['<span class="pill">10月31日</span>', '确定答谢宴初步方案', '规模、形式、预算', '两人与父母'],
      ['<span class="pill gold">10月31日</span>', '💡 答谢宴餐厅踩点完成（提前）', '锁定好餐厅，淡季谈价；只踩点不定', '两人与父母'],
      ['<span class="pill green">11月15日</span>', '💎 领取结婚证', '婚检、证件照、领证（免户口本）', '两人共同'],
      ['<span class="pill">11月15日</span>', '预订旅行婚礼机票/酒店', '提前订更便宜，可退改优先', '两人分头'],
      ['<span class="pill">11月30日</span>', '联系目的地婚礼策划/摄影', '看真实案例，签合同', '女为主'],
      ['<span class="pill">12月31日</span>', '确定旅行婚礼仪式流程、服装、誓词', '简化流程，30-60分钟', '两人共同'],
    ],
  },
  {
    id: 'phase5',
    header: '✈️ 第五阶段：旅行婚礼执行准备（2027.01 - 04）',
    tableHeaders: ['最晚完成时间', 'Todo', '要求/产出', '负责人'],
    rows: [
      ['<span class="pill">2月15日</span>', '购买/租赁轻婚纱、礼服到位', '轻便易携带，适合旅行；新郎西装简化', '女为主'],
      ['<span class="pill">3月1日</span>', '准备旅行物品、戒指、誓词卡、小道具', '清单核对，避免遗漏', '两人分头'],
      ['<span class="pill">3月31日</span>', '确认所有预订，办理签证（如需）', '日本需签证，三亚免签', '两人分头'],
      ['<span class="pill">4月15日</span>', '抵达旅行目的地，提前适应', '预留1-2天休息再仪式', '两人（+父母/朋友）'],
    ],
  },
  {
    id: 'phase6',
    header: '💍 第六阶段：旅行婚礼（2027.04 - 05）',
    tableHeaders: ['日期', '环节', '要求/产出', '负责人'],
    rows: [
      ['出发前1-2天', '抵达目的地，休息适应', '调整时差，确认天气', '两人'],
      ['仪式当天', '自然醒，早餐，化妆', '不赶时间，享受过程', '女为主'],
      ['', 'First Look（新郎第一次见新娘穿婚纱）', '私密时刻，摄影师记录', '摄影师'],
      ['核心', '仪式：入场、誓词、交换戒指、拥吻', '💎 核心产出：婚礼仪式完成', '策划师统筹'],
      ['', '旅拍：目的地风景+新人互动', '出片率高，像电影', '摄影师'],
      ['', '日落庆祝：香槟、晚餐、父母/朋友致辞', '轻松庆祝，无应酬', '两人'],
      ['仪式后', '继续旅行/蜜月', '无需二次安排蜜月', '两人'],
      ['全程', '拍摄素材用于答谢宴播放', '5-10分钟精华视频 + 精选照片', '摄影师'],
    ],
    note: '<strong>目的地选择建议：</strong><br><br><table style="min-width:auto;font-size:0.84rem;"><tr><th style="background:#fdf7f1;padding:8px 14px;">目的地</th><th style="background:#fdf7f1;padding:8px 14px;">适合谁</th><th style="background:#fdf7f1;padding:8px 14px;">预算</th><th style="background:#fdf7f1;padding:8px 14px;">父母同行难度</th></tr><tr><td style="padding:8px 14px;border-bottom:1px solid var(--border-light);"><strong>三亚</strong></td><td>父母想同行、预算有限、怕麻烦</td><td>2-4万</td><td>低（国内，飞行短）</td></tr><tr><td style="padding:8px 14px;border-bottom:1px solid var(--border-light);"><strong>日本（京都/北海道）</strong></td><td>追求仪式感、四季风景、出片率高</td><td>3-6万</td><td>中（需签证，飞行3小时）</td></tr><tr><td style="padding:8px 14px;"><strong>大理/丽江</strong></td><td>预算有限、喜欢国内风景、父母易同行</td><td>1-3万</td><td>低（国内，飞行短）</td></tr></table>',
  },
  {
    id: 'phase7',
    header: '🎉 第七阶段：答谢宴（2027.05 - 06）',
    tableHeaders: ['最晚完成时间', 'Todo', '要求/产出', '负责人'],
    rows: [
      ['<span class="pill">回国后1周内</span>', '确定答谢宴日期、餐厅、菜单', '2027年6月', '两人与父母'],
      ['<span class="pill">回国后2周内</span>', '制作旅行婚礼精华视频（5-10分钟）', '用于答谢宴播放', '摄影师/新人'],
      ['<span class="pill">回国后3周内</span>', '发送邀请（微信/电话，不发请柬）', '"我们旅行结婚了，6月X日请大家吃饭分享幸福"', '各自分发'],
      ['<span class="pill">答谢宴前1周</span>', '确认人数、准备致辞、确认播放设备', '简单准备，不复杂', '两人'],
      ['答谢宴当天', '播放旅行婚礼视频', '5-10分钟精华版', '两人'],
      ['', '新人简单致辞', '"我们去XX旅行结婚了，今天请大家吃饭分享幸福"', '两人'],
      ['', '父母致辞（如需）', '感谢来宾', '父母'],
      ['', '吃饭、敬酒、收祝福', '不收礼金或仅收长辈祝福', '两人'],
    ],
    note: '<strong>答谢宴形式建议：</strong><br><br><table style="min-width:auto;font-size:0.84rem;"><tr><th style="background:#fdf7f1;padding:8px 14px;">形式</th><th style="background:#fdf7f1;padding:8px 14px;">规模</th><th style="background:#fdf7f1;padding:8px 14px;">成本</th><th style="background:#fdf7f1;padding:8px 14px;">适合谁</th></tr><tr><td style="padding:8px 14px;border-bottom:1px solid var(--border-light);"><strong>餐厅包间</strong></td><td>亲戚+朋友（5-8桌）</td><td>1-2万</td><td>正常社交需求</td></tr><tr><td style="padding:8px 14px;border-bottom:1px solid var(--border-light);"><strong>酒店小型宴会厅</strong></td><td>亲戚+朋友+同事（10-15桌）</td><td>2-4万</td><td>父母需要面子</td></tr><tr><td style="padding:8px 14px;"><strong>分批次请客</strong></td><td>父母请亲戚，新人请朋友</td><td>灵活</td><td>两边需求不同</td></tr></table>',
  },
]

const calendarMonths = [
  {
    name: '2026年5月',
    items: [
      { date: '02 六', text: '父母见面', tag: '💎 父母见面', tagClass: 'key' },
      { date: '03 日', text: '整理见面结论' },
      { date: '10 日', text: '💡 三金/钻戒购买截止 / 北京购房策略对齐截止' },
      { date: '17 日', text: '线上选房截止 / 💡 证件照拍摄截止' },
      { date: '31 日', text: '北京第一轮看房截止' },
    ],
  },
  {
    name: '2026年6月',
    items: [
      { date: '14 日', text: '北京第二轮看房截止' },
      { date: '30 日', text: '💡 婚纱照拍摄截止 / 💡 婚前体检截止', tag: '💡', tagClass: 'tip' },
    ],
  },
  {
    name: '2026年7月',
    items: [
      { date: '31 日', text: '继续看房或等待 / 💡 婚礼策划咨询截止', tag: '💡', tagClass: 'tip' },
    ],
  },
  {
    name: '2026年8月',
    items: [
      { date: '15 日', text: '代县购房需求明确截止' },
      { date: '31 日', text: '代县看房截止 / 北京谈判启动' },
    ],
  },
  {
    name: '2026年9月',
    items: [
      { date: '15 日', text: '北京交定金截止 / 代县签约截止 / 💡 婚纱礼服试穿截止', tag: '💡', tagClass: 'tip' },
      { date: '20 日', text: '订婚日期确定' },
      { date: '25 日', text: '订婚场所流程确认' },
      { date: '26-27', text: '💎 订婚仪式（或10.10-11）', tag: '💎 订婚', tagClass: 'key' },
    ],
  },
  {
    name: '2026年10月',
    items: [
      { date: '10-11', text: '💎 订婚仪式（备选日期）', tag: '💎 订婚', tagClass: 'key' },
      { date: '31 日', text: '旅行婚礼方案确定 / 答谢宴方案确定 / 💡 答谢宴餐厅踩点截止', tag: '💡', tagClass: 'tip' },
    ],
  },
  {
    name: '2026年11月',
    items: [
      { date: '15 日', text: '💎 领证截止 / 机票酒店预订截止', tag: '💎 领证', tagClass: 'key' },
      { date: '30 日', text: '婚礼策划摄影确定' },
    ],
  },
  {
    name: '2026年12月',
    items: [
      { date: '31 日', text: '旅行婚礼流程服装誓词确定' },
    ],
  },
]

const checkpoints = [
  { date: '04.27', content: '两人内部是否对齐：彩礼、订婚时间、旅行婚礼目的地倾向？', required: '✓' },
  { date: '05.02', content: '父母见面是否敲定：<strong>彩礼数额、订婚时间</strong>？<strong>旅行婚礼态度是否明确？</strong>', required: '✓' },
  { date: '05.10', content: '💡 三金/钻戒是否已购买？领证证件照是否已拍？', required: '<span class="pill gold">建议完成</span>' },
  { date: '06.30', content: '💡 婚纱照是否已拍摄？婚前体检是否已完成？', required: '<span class="pill gold">建议完成</span>' },
  { date: '07.31', content: '💡 婚礼策划咨询是否已完成？北京看房进度？', required: '<span class="pill gold">建议完成</span>' },
  { date: '08.31', content: '北京是否已确定目标房源？代县是否已启动？', required: '<span class="pill muted">不必须</span>' },
  { date: '09.15', content: '💡 婚纱礼服是否已试穿/定制？', required: '<span class="pill gold">建议完成</span>' },
  { date: '09.20', content: '订婚具体日期是否确定？', required: '✓' },
  { date: '10.31', content: '旅行婚礼方案是否确定？答谢宴方案是否确定？', required: '✓' },
  { date: '11.15', content: '是否已领证？机票酒店是否已预订？', required: '✓' },
  { date: '12.31', content: '旅行婚礼策划/流程/服装是否确定？', required: '✓' },
  { date: '2027.02.15', content: '轻婚纱/礼服是否到位？', required: '✓' },
  { date: '2027.03.31', content: '签证/旅行物品是否准备完毕？', required: '✓' },
  { date: '2027.05.31', content: '答谢宴餐厅/菜单是否确定？视频是否制作完成？', required: '✓' },
]

const divisionRows = [
  { period: '04.25-05.02', male: '准备见面礼、主导见面', female: '餐厅协调、家庭整理', together: '内部对齐（聚焦彩礼、订婚时间，试探旅行婚礼）' },
  { period: '05.03-09.30', male: '北京贷款办理、代县远程决策、三金/钻戒陪同购买', female: '北京房源筛选、设计审美、婚纱照主导', together: '北京周末看房/谈判/签约、婚纱照拍摄、婚前体检' },
  { period: '09.01-10.11', male: '礼金准备、场地预订、高铁票预订', female: '仪式流程、物品清单', together: '订婚执行（不聊买房）' },
  { period: '10.12-12.31', male: '领证配合、旅行婚礼机票预订、答谢宴场地跟进', female: '旅行婚礼策划对接、摄影沟通、答谢宴菜单', together: '领证、确定目的地+日期、答谢宴方案、餐厅踩点' },
  { period: '2027.01-04', male: '旅行物品准备、签证办理（如需）', female: '轻婚纱/礼服准备、化妆沟通', together: '行程确认、誓词准备' },
  { period: '2027.04-05', male: '旅行婚礼参与者', female: '旅行婚礼主角+化妆', together: '💎 旅行婚礼执行' },
  { period: '2027.05-06', male: '答谢宴场地跟进、男方宾客邀请', female: '答谢宴视频制作、女方宾客邀请', together: '💎 答谢宴执行' },
]
</script>

<style scoped>
.wedding-page {
  min-height: 100vh;
  background: #faf8f5;
  color: #3d322a;
  line-height: 1.7;
  padding-bottom: var(--nav-height);
}

/* Nav */
.wedding-nav {
  position: sticky; top: 0; z-index: 100;
  background: rgba(254, 250, 246, 0.88);
  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--border-light);
  height: 56px;
  display: flex; align-items: center;
  padding: 0 20px; gap: 6px;
  overflow-x: auto; scrollbar-width: none;
}
.wedding-nav::-webkit-scrollbar { display: none; }
.wedding-nav a {
  flex-shrink: 0; text-decoration: none;
  font-size: 0.8rem; font-weight: 500;
  color: var(--text-secondary);
  padding: 5px 12px; border-radius: 20px;
  transition: var(--transition-fast); white-space: nowrap;
  cursor: pointer;
}
.wedding-nav a:hover, .wedding-nav a.active {
  background: rgba(201, 168, 169, 0.12);
  color: var(--color-primary);
}
.wedding-nav .back-link {
  font-weight: 700;
  color: var(--color-primary);
}

/* Main */
.wedding-main {
  max-width: 960px;
  margin: 0 auto;
  padding: 28px 20px 60px;
}

/* Hero */
.wedding-hero {
  text-align: center;
  padding: 40px 20px 36px;
}
.hero-tag {
  display: inline-block;
  background: rgba(201, 168, 169, 0.12);
  color: var(--color-primary);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  padding: 5px 16px;
  border-radius: 20px;
  margin-bottom: 16px;
}
.wedding-hero h1 {
  font-size: 2.1rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.04em;
  line-height: 1.35;
  margin-bottom: 8px;
}
.hero-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  letter-spacing: 0.03em;
}
.hero-divider {
  width: 48px;
  height: 2px;
  background: var(--border-base);
  margin: 18px auto 0;
  border-radius: 1px;
}

/* Section Title */
.section-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.04em;
  margin: 44px 0 6px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.section-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-light);
  min-width: 20px;
}

/* Timeline */
.timeline {
  position: relative;
  padding-left: 28px;
  margin: 8px 0 20px;
}
.timeline::before {
  content: '';
  position: absolute;
  left: 9px;
  top: 4px;
  bottom: 4px;
  width: 2px;
  background: var(--border-base);
  border-radius: 1px;
}
.tl-item {
  position: relative;
  margin-bottom: 14px;
  padding-left: 22px;
}
.tl-item::before {
  content: '';
  position: absolute;
  left: -23px;
  top: 5px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  border: 2.5px solid var(--color-primary);
  z-index: 1;
}
.tl-item.milestone::before {
  background: var(--color-primary);
  border-color: #b8979a;
  width: 14px;
  height: 14px;
  left: -24px;
  box-shadow: 0 0 0 4px rgba(201, 168, 169, 0.15);
}
.tl-date {
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--color-primary);
  letter-spacing: 0.03em;
}
.tl-title {
  font-weight: 600;
  font-size: 0.92rem;
  color: var(--text-primary);
}
.tl-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

/* Phase Card */
.phase-card {
  background: var(--bg-container);
  border-radius: var(--radius-lg);
  padding: 24px 26px;
  margin-bottom: 16px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  transition: var(--transition-base);
}
.phase-card:hover {
  box-shadow: var(--shadow-md);
}
.phase-header {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 4px;
}
.phase-date {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin-bottom: 14px;
}

/* Table */
.table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin: 6px 0 16px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.86rem;
  min-width: 600px;
  background: #fff;
}
table th {
  background: #fdf7f1;
  color: var(--color-primary);
  font-weight: 600;
  font-size: 0.76rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 10px 14px;
  text-align: left;
  white-space: nowrap;
  border-bottom: 2px solid var(--border-base);
  position: sticky;
  top: 0;
}
table td {
  padding: 9px 14px;
  border-bottom: 1px solid var(--border-light);
  vertical-align: top;
}
table tbody tr:hover {
  background: #fefcf9;
}

/* Pill */
:deep(.pill) {
  display: inline-block;
  background: rgba(201, 168, 169, 0.12);
  color: var(--color-primary);
  font-size: 0.74rem;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 12px;
  white-space: nowrap;
}
:deep(.pill.gold) {
  background: #f2e2c6;
  color: #8a6d3b;
}
:deep(.pill.green) {
  background: #e8efe4;
  color: #5a7050;
}
:deep(.pill.muted) {
  background: #f0ece8;
  color: var(--text-secondary);
}

/* Calendar */
.cal-section {
  margin: 8px 0 16px;
}
.cal-block {
  background: #fff;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  padding: 16px 20px;
  margin-bottom: 10px;
  box-shadow: var(--shadow-sm);
}
.cal-month-title {
  font-size: 0.95rem;
  color: var(--color-primary);
  margin-bottom: 8px;
  letter-spacing: 0.04em;
}
.cal-item {
  font-size: 0.84rem;
  color: var(--text-primary);
  padding: 3px 0;
  line-height: 1.6;
}
.cal-date {
  display: inline-block;
  min-width: 90px;
  font-weight: 700;
  color: var(--color-primary);
  font-size: 0.82rem;
}
.cal-tag {
  display: inline-block;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 1px 8px;
  border-radius: 10px;
  margin-left: 6px;
  vertical-align: middle;
}
.cal-tag.key {
  background: var(--color-primary);
  color: #fff;
}
.cal-tag.tip {
  background: #f2e2c6;
  color: #8a6d3b;
}

/* Note Box */
.note-box {
  background: #fffdf9;
  border: 1px solid #f2e2c6;
  border-radius: var(--radius-md);
  padding: 16px 20px;
  margin: 14px 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.8;
}

/* Footer */
.wedding-footer {
  text-align: center;
  padding: 30px 20px;
  color: var(--text-secondary);
  font-size: 0.78rem;
  border-top: 1px solid var(--border-light);
  margin-top: 40px;
}

@media (max-width: 680px) {
  .wedding-hero h1 {
    font-size: 1.5rem;
  }
  .phase-card {
    padding: 18px 16px;
  }
  table {
    font-size: 0.78rem;
    min-width: 480px;
  }
  table th, table td {
    padding: 7px 10px;
  }
  .wedding-nav a {
    font-size: 0.74rem;
    padding: 4px 9px;
  }
  .cal-date {
    min-width: 70px;
    font-size: 0.78rem;
  }
  .section-title {
    font-size: 1.15rem;
  }
}
</style>
