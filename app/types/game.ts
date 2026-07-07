export interface Tile {
  id: number; // 0 to 24
  row: number; // 0 to 4
  col: number; // 0 to 4
  isMine: boolean;
  isRevealed: boolean;
  isAutoSelected: boolean;
}

export type GameState = 'idle' | 'playing' | 'cashout' | 'gameover';

export type BetMode = 'manual' | 'auto';

export interface AutoSettings {
  betCount: string; // empty string or number represented as string
  onWinIncrease: string; // percentage (empty string or number)
  onLossIncrease: string; // percentage (empty string or number)
  stopOnProfit: string; // profit limit (empty string or number)
  stopOnLoss: string; // loss limit (empty string or number)
}

export interface GameStats {
  balance: number;
  currentBet: number;
  mineCount: number;
  revealedCount: number;
  multiplier: number;
  profit: number;
  totalProfit: number;
}
