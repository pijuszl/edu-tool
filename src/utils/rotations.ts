export function getShortestRotation(current: number, target: number): number {
  const PI2 = Math.PI * 2
  const diff = (target - current) % PI2
  return diff > Math.PI ? diff - PI2 : diff < -Math.PI ? diff + PI2 : diff
}
