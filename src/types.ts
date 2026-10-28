export type BlockType = 
  | 'support' 
  | 'straight' 
  | 'ramp' 
  | 'curve' 
  | 'launcher' 
  | 'goal'
  | 'booster'
  | 'loop'
  | 'splitter';

export type GameMode = 'build' | 'play';

export interface BlockData {
  id: string;
  type: BlockType;
  position: [number, number, number]; // integer grid coordinates [x, y, z]
  rotation: number; // 0: 0°, 1: 90°, 2: 180°, 3: 270°
  color?: string;
}

export interface MarbleState {
  position: { x: number; y: number; z: number };
  velocity: { x: number; y: number; z: number };
  isGoalReached: boolean;
  hasFallen: boolean;
}

export interface SplitterStats {
  left: number;
  right: number;
}

export interface GameDebugApi {
  mode: GameMode;
  marblePosition: { x: number; y: number; z: number };
  marbleVelocity: { x: number; y: number; z: number };
  isGoalReached: boolean;
  boostsTriggered: number;
  loopsCompleted: number;
  splitterAlternations: SplitterStats;
  loadTestTrack: () => void;
  loadDynamicTestTrack: () => void;
  resetMarble: () => void;
  setMode: (mode: GameMode) => void;
  clearTrack: () => void;
}

declare global {
  interface Window {
    __GAME_DEBUG__?: GameDebugApi;
  }
}
