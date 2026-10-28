import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { BlockData, BlockType, GameMode } from './types';
import { sound } from './audio';

interface GameState {
  // Building & Grid
  blocks: BlockData[];
  selectedBlockType: BlockType;
  selectedRotation: number; // 0, 1, 2, 3 (each representing 90 deg clockwise)
  gridSize: number;
  
  // Play & Simulation
  mode: GameMode;
  marbleKey: number; // incremented to force-respawn the marble
  marblePosition: { x: number; y: number; z: number };
  marbleVelocity: { x: number; y: number; z: number };
  isGoalReached: boolean;
  hasFallen: boolean;
  
  // Audio & Settings
  isMuted: boolean;
  
  // Multi-Marble Simulation & Telemetry Counters
  maxMarbles: number;
  boostsTriggered: number;
  loopsCompleted: number;
  splitterAlternations: { left: number; right: number };
  
  // Actions
  incrementBoosts: () => void;
  incrementLoops: () => void;
  recordSplitterAlternation: (side: 'left' | 'right') => void;
  setMaxMarbles: (count: number) => void;
  addBlock: (position: [number, number, number], type?: BlockType, rotation?: number) => void;
  removeBlock: (position: [number, number, number]) => void;
  setSelectedBlockType: (type: BlockType) => void;
  rotateSelectedBlock: () => void;
  setRotation: (rotation: number) => void;
  setMode: (mode: GameMode) => void;
  toggleMode: () => void;
  updateMarbleTelemetry: (
    pos: { x: number; y: number; z: number },
    vel: { x: number; y: number; z: number },
    isGoalReached: boolean,
    hasFallen: boolean
  ) => void;
  setGoalReached: () => void;
  resetMarble: () => void;
  clearTrack: () => void;
  loadTestTrack: () => void;
  loadDynamicTestTrack: () => void;
  toggleSound: () => void;
}

// Default 5-block test track as specified: Launcher -> Ramp -> Straight -> Curve -> Goal
export const createDefaultTestTrack = (): BlockData[] => [
  // 1. Launcher: Elevation y=2, facing +Z
  {
    id: 'launcher-1',
    type: 'launcher',
    position: [0, 2, 0],
    rotation: 0,
  },
  // 2. Ramp: Transition from y=2 to y=1, sloping down in +Z direction
  {
    id: 'ramp-1',
    type: 'ramp',
    position: [0, 1, 1],
    rotation: 0,
  },
  // 3. Straight chute at y=1, guiding forward along +Z
  {
    id: 'straight-1',
    type: 'straight',
    position: [0, 1, 2],
    rotation: 0,
  },
  // 4. Curve 90°: turns movement from +Z to +X (to the right)
  {
    id: 'curve-1',
    type: 'curve',
    position: [0, 1, 3],
    rotation: 0,
  },
  // 5. Goal: receiving the marble from -X entrance at [1, 1, 3]
  {
    id: 'goal-1',
    type: 'goal',
    position: [1, 1, 3],
    rotation: 1, // rotated to align entrance with the curve exit
  },
  // Optional aesthetic base supports underneath high blocks
  {
    id: 'support-launcher-base',
    type: 'support',
    position: [0, 1, 0],
    rotation: 0,
  },
  {
    id: 'support-launcher-ground',
    type: 'support',
    position: [0, 0, 0],
    rotation: 0,
  },
  {
    id: 'support-straight-ground',
    type: 'support',
    position: [0, 0, 2],
    rotation: 0,
  },
  {
    id: 'support-curve-ground',
    type: 'support',
    position: [0, 0, 3],
    rotation: 0,
  },
  {
    id: 'support-goal-ground',
    type: 'support',
    position: [1, 0, 3],
    rotation: 0,
  }
];

// Dynamic Circuit as specified:
// Launcher (3 marbles) -> Straight -> Magnetic Booster -> Vertical Loop -> Splitter -> 2 Goal Blocks (Left & Right)
export const createDynamicTestTrack = (): BlockData[] => [
  // 1. Launcher: at [0, 1, 0], facing +Z
  { id: 'dyn-launcher', type: 'launcher', position: [0, 1, 0], rotation: 0 },
  // 2. Straight chute: at [0, 1, 1], facing +Z
  { id: 'dyn-straight-1', type: 'straight', position: [0, 1, 1], rotation: 0 },
  // 3. Magnetic Booster: at [0, 1, 2], facing +Z
  { id: 'dyn-booster', type: 'booster', position: [0, 1, 2], rotation: 0 },
  // 4. Vertical Looping: at [0, 1, 3], facing +Z
  { id: 'dyn-loop', type: 'loop', position: [0, 1, 3], rotation: 0 },
  // 5. Path Splitter (Y-alternator): at [0, 1, 4], facing +Z
  { id: 'dyn-splitter', type: 'splitter', position: [0, 1, 4], rotation: 0 },
  // 6. Left Goal: at [-1, 1, 4], entrance facing +X (rotation 3)
  { id: 'dyn-goal-left', type: 'goal', position: [-1, 1, 4], rotation: 3 },
  // 7. Right Goal: at [1, 1, 4], entrance facing -X (rotation 1)
  { id: 'dyn-goal-right', type: 'goal', position: [1, 1, 4], rotation: 1 },
  // Ground support blocks
  { id: 'dyn-supp-0', type: 'support', position: [0, 0, 0], rotation: 0 },
  { id: 'dyn-supp-1', type: 'support', position: [0, 0, 1], rotation: 0 },
  { id: 'dyn-supp-2', type: 'support', position: [0, 0, 2], rotation: 0 },
  { id: 'dyn-supp-3', type: 'support', position: [0, 0, 3], rotation: 0 },
  { id: 'dyn-supp-4', type: 'support', position: [0, 0, 4], rotation: 0 },
  { id: 'dyn-supp-5', type: 'support', position: [-1, 0, 4], rotation: 0 },
  { id: 'dyn-supp-6', type: 'support', position: [1, 0, 4], rotation: 0 },
];

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
  blocks: createDefaultTestTrack(),
  selectedBlockType: 'straight',
  selectedRotation: 0,
  gridSize: 16,
  
  mode: 'build',
  marbleKey: 0,
  marblePosition: { x: 0, y: 0, z: 0 },
  marbleVelocity: { x: 0, y: 0, z: 0 },
  isGoalReached: false,
  hasFallen: false,
  
  isMuted: false,

  // Multi-Marble Simulation & Telemetry Counters
  maxMarbles: 5,
  boostsTriggered: 0,
  loopsCompleted: 0,
  splitterAlternations: { left: 0, right: 0 },

  incrementBoosts: () => set((state) => ({ boostsTriggered: state.boostsTriggered + 1 })),
  incrementLoops: () => set((state) => ({ loopsCompleted: state.loopsCompleted + 1 })),
  recordSplitterAlternation: (side: 'left' | 'right') =>
    set((state) => ({
      splitterAlternations: {
        ...state.splitterAlternations,
        [side]: state.splitterAlternations[side] + 1,
      },
    })),
  setMaxMarbles: (count: number) => set({ maxMarbles: count }),

  addBlock: (position, overrideType, overrideRotation) => {
    const type = overrideType || get().selectedBlockType;
    const rotation = overrideRotation !== undefined ? overrideRotation : get().selectedRotation;
    
    // Check if block already exists at this exact grid coordinate
    const existing = get().blocks.find(
      (b) => b.position[0] === position[0] && b.position[1] === position[1] && b.position[2] === position[2]
    );

    if (existing) {
      // Replace existing block
      set((state) => ({
        blocks: state.blocks.map((b) =>
          b.position[0] === position[0] && b.position[1] === position[1] && b.position[2] === position[2]
            ? { ...b, type, rotation }
            : b
        ),
      }));
    } else {
      const newBlock: BlockData = {
        id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        type,
        position,
        rotation,
      };
      set((state) => ({ blocks: [...state.blocks, newBlock] }));
    }
    sound.playPlaceSound();
  },

  removeBlock: (position) => {
    const prevCount = get().blocks.length;
    set((state) => ({
      blocks: state.blocks.filter(
        (b) => !(b.position[0] === position[0] && b.position[1] === position[1] && b.position[2] === position[2])
      ),
    }));
    if (get().blocks.length < prevCount) {
      sound.playDeleteSound();
    }
  },

  setSelectedBlockType: (type) => set({ selectedBlockType: type }),

  rotateSelectedBlock: () => {
    set((state) => ({ selectedRotation: (state.selectedRotation + 1) % 4 }));
    sound.playPlaceSound();
  },

  setRotation: (rotation) => set({ selectedRotation: rotation % 4 }),

  setMode: (mode) => {
    if (mode === 'play') {
      sound.playLaunchSound();
      set((state) => ({
        mode: 'play',
        isGoalReached: false,
        hasFallen: false,
        marbleKey: state.marbleKey + 1,
      }));
    } else {
      sound.stopRollSound();
      set({
        mode: 'build',
        isGoalReached: false,
        hasFallen: false,
      });
    }
  },

  toggleMode: () => {
    const current = get().mode;
    get().setMode(current === 'build' ? 'play' : 'build');
  },

  updateMarbleTelemetry: (pos, vel, isGoalReached, hasFallen) => {
    set({
      marblePosition: pos,
      marbleVelocity: vel,
      isGoalReached: isGoalReached,
      hasFallen: hasFallen,
    });
  },

  setGoalReached: () => {
    if (!get().isGoalReached) {
      set({ isGoalReached: true });
      sound.playVictorySound();
    }
  },

  resetMarble: () => {
    sound.playLaunchSound();
    set((state) => ({
      marbleKey: state.marbleKey + 1,
      isGoalReached: false,
      hasFallen: false,
    }));
  },

  clearTrack: () => {
    set({ blocks: [] });
    sound.playDeleteSound();
  },

  loadTestTrack: () => {
    set({
      blocks: createDefaultTestTrack(),
      isGoalReached: false,
      hasFallen: false,
      boostsTriggered: 0,
      loopsCompleted: 0,
      splitterAlternations: { left: 0, right: 0 },
    });
    sound.playPlaceSound();
  },

  loadDynamicTestTrack: () => {
    set({
      blocks: createDynamicTestTrack(),
      isGoalReached: false,
      hasFallen: false,
      maxMarbles: 3,
      boostsTriggered: 0,
      loopsCompleted: 0,
      splitterAlternations: { left: 0, right: 0 },
      marbleKey: get().marbleKey + 1,
    });
    sound.playPlaceSound();
  },

  toggleSound: () => {
    const muted = sound.toggleMute();
    set({ isMuted: muted });
  },
    }),
    {
      name: 'voxel-marble-run-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        blocks: state.blocks,
        selectedBlockType: state.selectedBlockType,
        selectedRotation: state.selectedRotation,
        isMuted: state.isMuted,
      }),
    }
  )
);
