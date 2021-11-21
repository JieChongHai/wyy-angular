// 返回一个限制范围内的数字
export function limitNumberInRange(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max)
}

export function getPercent(min: number, max: number, val: number): number {
  return ((val - min) / (max - min)) * 100
}

/**
 *
 * @param range [min, max]
 * @returns 取[min, max]之间的一个随机数
 */
export function getRandomInt(range: [number, number]): number {
  const min = range[0] // 期望的最小值
  const max = range[1] // 期望的最大值
  return Math.floor(Math.random() * (max - min + 1) + min)
}
/**
 *
 * @param arr 任意类型数组
 * @returns 返回随机打乱的数组
 */
export function shuffle<T>(arr: T[]): T[] {
  const result = arr.slice()
  for (let i = 0; i < result.length; i++) {
    // 0和i 之间的一个随机数
    const j = getRandomInt([0, i])

    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * 判断是否为空对象
 * @param obj 
 * @returns boolean
 */
export function isEmptyObject(obj: Object): boolean {
  return JSON.stringify(obj) === '{}';
}