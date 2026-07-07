export function combinations(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;
  if (k > n / 2) k = n - k;
  let res = 1;
  for (let i = 1; i <= k; i++) {
    res = (res * (n - k + i)) / i;
  }
  return res;
}

export function getMinesMultiplier(minesCount: number, gemsRevealed: number): number {
  if (gemsRevealed <= 0) return 1.0;
  const totalTiles = 25;
  if (gemsRevealed > totalTiles - minesCount) return 0;

  const totalCombinations = combinations(totalTiles, gemsRevealed);
  const safeCombinations = combinations(totalTiles - minesCount, gemsRevealed);

  if (safeCombinations === 0) return 0;

  const multiplier = (totalCombinations / safeCombinations) * 0.99;
  return Math.round(multiplier * 100) / 100;
}
