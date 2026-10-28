import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGameStore } from './store';
import { Scene } from './components/Scene';
import { HUD } from './components/ui/HUD';
import { VictoryModal } from './components/ui/VictoryModal';
import { GameDebugApi } from './types';

export const App: React.FC = () => {
  // Expose window.__GAME_DEBUG__ for telemetry and Agent-Browser Loop
  useEffect(() => {
    const debugApi: GameDebugApi = {
      get mode() {
        return useGameStore.getState().mode;
      },
      get marblePosition() {
        return useGameStore.getState().marblePosition;
      },
      get marbleVelocity() {
        return useGameStore.getState().marbleVelocity;
      },
      get isGoalReached() {
        return useGameStore.getState().isGoalReached;
      },
      get boostsTriggered() {
        return useGameStore.getState().boostsTriggered;
      },
      get loopsCompleted() {
        return useGameStore.getState().loopsCompleted;
      },
      get splitterAlternations() {
        return useGameStore.getState().splitterAlternations;
      },
      loadTestTrack: () => {
        useGameStore.getState().loadTestTrack();
      },
      loadDynamicTestTrack: () => {
        useGameStore.getState().loadDynamicTestTrack();
      },
      resetMarble: () => {
        useGameStore.getState().resetMarble();
      },
      setMode: (mode) => {
        useGameStore.getState().setMode(mode);
      },
      clearTrack: () => {
        useGameStore.getState().clearTrack();
      },
    };

    window.__GAME_DEBUG__ = debugApi;
    console.log('[Voxel Marble Run] Telemetry API mounted at window.__GAME_DEBUG__', debugApi);

    return () => {
      delete window.__GAME_DEBUG__;
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950">
      {/* 3D WebGL Canvas */}
      <Canvas
        shadows
        camera={{ position: [8, 11, 14], fov: 42 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <Scene />
      </Canvas>

      {/* 2D Overlay HUD & Modals */}
      <HUD />
      <VictoryModal />
    </div>
  );
};

export default App;
