/**
 * 星空分散布局算法
 * 生成自然、浪漫的月份节点位置，模拟真实星空分布
 */

/**
 * 种子随机数生成器（确保每次渲染位置一致）
 * @param {number} seed - 随机种子
 * @returns {number} 0-1 之间的伪随机数
 */
export function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  s = (s * 16807) % 2147483647;
  return (s - 1) / 2147483646;
}

/**
 * 计算星空分散布局的月份节点位置
 * @param {Object} monthsData - 各月份数据（情书数量）
 * @param {number} containerWidth - 容器宽度
 * @param {number} containerHeight - 容器高度
 * @returns {Array} 节点位置数组
 */
export function calculateStarPositions(monthsData, containerWidth, containerHeight) {
  const positions = [];
  const horizontalSpacing = containerWidth / 11; // 12个月份，11个间隔
  const verticalRange = containerHeight * 0.35; // 垂直浮动范围
  const horizontalJitter = horizontalSpacing * 0.25; // 水平随机扰动范围

  const centerY = containerHeight / 2;

  for (let i = 0; i < 12; i++) {
    const month = i + 1;
    const seed = month * 100; // 使用月份作为随机种子，确保一致性

    // 基础水平位置（保持时间流向：左→右）
    const baseX = i * horizontalSpacing;

    // 水平随机扰动（避免过于整齐）
    const horizontalOffset = (seededRandom(seed) * 2 - 1) * horizontalJitter;

    // 垂直位置：使用正弦波产生有节奏的起伏 + 随机扰动
    const verticalBase = Math.sin(i * 0.6) * verticalRange * 0.4;
    const verticalJitter = (seededRandom(seed + 1) * 2 - 1) * verticalRange * 0.25;
    const y = centerY + verticalBase + verticalJitter;

    // 星团效应：相邻有情书记录的月份相互"吸引"
    const hasLetter = monthsData[month] && monthsData[month].count > 0;
    const prevHasLetter = i > 0 && monthsData[month - 1] && monthsData[month - 1].count > 0;
    const nextHasLetter = i < 11 && monthsData[month + 1] && monthsData[month + 1].count > 0;

    let clusterOffsetX = 0;
    let clusterOffsetY = 0;

    if (hasLetter && prevHasLetter) {
      clusterOffsetX -= horizontalSpacing * 0.08;
      clusterOffsetY += (seededRandom(seed + 2) - 0.5) * 10;
    }
    if (hasLetter && nextHasLetter) {
      clusterOffsetX += horizontalSpacing * 0.08;
      clusterOffsetY += (seededRandom(seed + 3) - 0.5) * 10;
    }

    const finalX = baseX + horizontalOffset + clusterOffsetX;
    const finalY = y + clusterOffsetY;

    // 根据情书数量计算节点大小
    const baseSize = 20;
    const letterCount = (monthsData[month] && monthsData[month].count) || 0;
    const sizeMultiplier = 1 + Math.min(letterCount / 10, 1) * 0.8;
    const size = baseSize * sizeMultiplier;

    positions.push({
      month,
      x: finalX,
      y: finalY,
      hasLetter,
      letterCount,
      size
    });
  }

  return positions;
}

/**
 * 生成星轨路径（连接所有有情书记录的月份）
 * 使用平滑曲线连接节点
 * @param {Array} nodes - 节点数组
 * @returns {string} SVG path 字符串
 */
export function generateStarTrailPath(nodes) {
  const activeNodes = nodes.filter(n => n.hasLetter);

  if (activeNodes.length < 2) return '';

  // 使用 Catmull-Rom 样条曲线生成平滑路径
  let path = `M ${activeNodes[0].x} ${activeNodes[0].y}`;

  if (activeNodes.length === 2) {
    // 只有两个节点，直接画线
    path += ` L ${activeNodes[1].x} ${activeNodes[1].y}`;
    return path;
  }

  // 三个以上节点，使用贝塞尔曲线平滑连接
  for (let i = 1; i < activeNodes.length; i++) {
    const prev = activeNodes[i - 1];
    const curr = activeNodes[i];
    const next = i < activeNodes.length - 1 ? activeNodes[i + 1] : curr;

    // 控制点计算（简化版 Catmull-Rom）
    const tension = 0.3;
    const prev2 = i > 1 ? activeNodes[i - 2] : null;
    const cp1x = prev.x + (curr.x - (prev2 ? prev2.x : prev.x)) * tension;
    const cp1y = prev.y + (curr.y - (prev2 ? prev2.y : prev.y)) * tension;
    const nextNode = next || curr;
    const cp2x = curr.x - (nextNode.x - prev.x) * tension;
    const cp2y = curr.y - (nextNode.y - prev.y) * tension;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }

  return path;
}
