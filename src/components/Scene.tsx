import React, { useState, useEffect, useRef } from 'react';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { BlockData } from '../types';
import { BlockRenderer } from './blocks/BlockRenderer';
import { GhostBlock } from './blocks/GhostBlock';
import { GridPlane } from './GridPlane';
import { Marble } from './Marble';
import { VoxelParticles } from './VoxelParticles';

export const Scene: React.FC = () => {
  const blocks = useGameStore((state) => state.blocks);
  const mode = useGameStore((state) => state.mode);
  const addBlock = useGameStore((state) => state.addBlock);
  const removeBlock = useGameStore((state) => state.removeBlock);
  const rotateSelectedBlock = useGameStore((state) => state.rotateSelectedBlock);
  const toggleMode = useGameStore((state) => state.toggleMode);

  const [ghostPos, setGhostPos] = useState<[number, number, number] | null>(null);
  const pointerDownPos = useRef<{ x: number; y: number } | null>(null);

  // Global keyboard shortcuts (R = rotate, Space = toggle mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        rotateSelectedBlock();
      } else if (e.key === ' ') {
        e.preventDefault();
        toggleMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rotateSelectedBlock, toggleMode]);

  // Pointer tracking to distinguish clicks from camera orbit drags
  const handlePointerDown = (e: any) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY };
  };

  const isQuickClick = (e: any): boolean => {
    if (!pointerDownPos.current) return false;
    const dx = Math.abs(e.clientX - pointerDownPos.current.x);
    const dy = Math.abs(e.clientY - pointerDownPos.current.y);
    return dx < 5 && dy < 5;
  };

  // Hover over the ground plane
  const handleGroundPointerMove = (e: any) => {
    if (mode !== 'build') return;
    e.stopPropagation();
    const x = Math.round(e.point.x);
    const z = Math.round(e.point.z);
    // Boundary check within 16x16 grid [-7, 7]
    if (Math.abs(x) <= 7 && Math.abs(z) <= 7) {
      setGhostPos([x, 0, z]);
    }
  };

  // Click on the ground plane
  const handleGroundPointerDown = (e: any) => {
    if (mode !== 'build') return;
    if (e.button === 0 && ghostPos && isQuickClick(e)) {
      addBlock(ghostPos);
    }
  };

  // Hover over an existing block: determine normal to enable vertical stacking or side placement
  const handleBlockPointerMove = (e: any, block: BlockData) => {
    if (mode !== 'build') return;
    e.stopPropagation();

    if (e.face && e.object) {
      const normal = e.face.normal.clone();
      normal.applyQuaternion(e.object.getWorldQuaternion(new THREE.Quaternion()));
      normal.x = Math.round(normal.x);
      normal.y = Math.round(normal.y);
      normal.z = Math.round(normal.z);

      const nextPos: [number, number, number] = [
        block.position[0] + normal.x,
        Math.max(0, block.position[1] + normal.y),
        block.position[2] + normal.z,
      ];

      if (Math.abs(nextPos[0]) <= 7 && Math.abs(nextPos[2]) <= 7) {
        setGhostPos(nextPos);
      }
    }
  };

  // Click on an existing block: Left-click places neighbor/stack, Right-click deletes
  const handleBlockPointerDown = (e: any, block: BlockData) => {
    if (mode !== 'build') return;
    e.stopPropagation();

    if (!isQuickClick(e)) return;

    if (e.button === 2) {
      // Right click: delete block
      removeBlock(block.position);
      setGhostPos(null);
    } else if (e.button === 0 && ghostPos) {
      // Left click: place new block at snapped position
      addBlock(ghostPos);
    }
  };

  return (
    <>
      {/* Camera Controls */}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2 + 0.05}
      />

      {/* Lighting Setup */}
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[12, 20, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      <directionalLight position={[-10, 10, -10]} intensity={0.4} color="#38bdf8" />
      <pointLight position={[0, 8, 0]} intensity={0.5} color="#ffffff" distance={25} />

      {/* Background color fog for depth */}
      <color attach="background" args={['#090d16']} />
      <fog attach="fog" args={['#090d16', 20, 50]} />

      {/* Rapier Physics World: active in play mode, paused in build mode */}
      <Physics paused={mode === 'build'} gravity={[0, -9.81, 0]}>
        {/* Base Grid Board */}
        <GridPlane
          size={16}
          onPointerMove={handleGroundPointerMove}
          onPointerDown={(e) => {
            handlePointerDown(e);
            handleGroundPointerDown(e);
          }}
        />

        {/* Soft Contact Shadows on Base Board */}
        <ContactShadows
          position={[0, -0.48, 0]}
          opacity={0.65}
          scale={18}
          blur={2.4}
          far={6}
          resolution={512}
          color="#000000"
        />

        {/* User-placed & Test Track Blocks */}
        <group onPointerDown={handlePointerDown}>
          {blocks.map((block) => (
            <group
              key={block.id}
              onPointerMove={(e) => handleBlockPointerMove(e, block)}
              onPointerDown={(e) => handleBlockPointerDown(e, block)}
            >
              <BlockRenderer block={block} />
            </group>
          ))}
        </group>

        {/* Dynamic Marble in Play Mode */}
        {mode === 'play' && <Marble />}
      </Physics>

      {/* Mini-Cube 3D Voxel Celebration Particles on Goal */}
      <VoxelParticles />

      {/* Translucent Placement Preview in Build Mode */}
      {mode === 'build' && <GhostBlock position={ghostPos} isValid={true} />}
    </>
  );
};
