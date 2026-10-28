import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { CuboidCollider, RapierRigidBody, RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { useGameStore } from '../../store';
import { sound } from '../../audio';

interface BlockProps {
  position: [number, number, number];
  rotation: number;
}

export const SplitterBlock: React.FC<BlockProps> = ({ position, rotation }) => {
  const rotY = (rotation * Math.PI) / 2;
  const recordSplitterAlternation = useGameStore((state) => state.recordSplitterAlternation);

  // Direction: 'left' or 'right'
  const [direction, setDirection] = useState<'left' | 'right'>('left');
  const currentAngleRef = useRef<number>(-0.66); // -38 degrees for left deflection
  const gateRbRef = useRef<RapierRigidBody>(null);
  const gateMeshRef = useRef<THREE.Group>(null);
  const lastSwitchTime = useRef<number>(0);

  // Smooth lerp of the kinematic gate flipper (~100ms transition)
  useFrame((_, delta) => {
    // Target angle: -0.66 rad for left, +0.66 rad for right
    const targetAngle = direction === 'left' ? -0.66 : 0.66;
    const lerpSpeed = 12.0; // reaches ~95% in ~100ms
    currentAngleRef.current = THREE.MathUtils.lerp(
      currentAngleRef.current,
      targetAngle,
      Math.min(delta * lerpSpeed, 1.0)
    );

    if (gateRbRef.current) {
      // Keep kinematic gate at its world coordinates
      gateRbRef.current.setNextKinematicTranslation({
        x: gateWorldPos[0],
        y: gateWorldPos[1],
        z: gateWorldPos[2],
      });

      // Create local rotation around Y axis then compound with block's rotation
      const localEuler = new THREE.Euler(0, currentAngleRef.current, 0);
      const localQuat = new THREE.Quaternion().setFromEuler(localEuler);
      const blockQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
      const combinedQuat = blockQuat.clone().multiply(localQuat);

      gateRbRef.current.setNextKinematicRotation(combinedQuat);
    }
  });

  const handleLeftSensor = () => {
    const now = Date.now();
    if (now - lastSwitchTime.current < 250) return;
    lastSwitchTime.current = now;

    if (direction === 'left') {
      setDirection('right');
      sound.playFlipperSound();
      recordSplitterAlternation('left');
    }
  };

  const handleRightSensor = () => {
    const now = Date.now();
    if (now - lastSwitchTime.current < 250) return;
    lastSwitchTime.current = now;

    if (direction === 'right') {
      setDirection('left');
      sound.playFlipperSound();
      recordSplitterAlternation('right');
    }
  };

  const handleSplitterEntrance = (e: any) => {
    const rb: RapierRigidBody = e.other?.rigidBody;
    if (!rb) return;

    // Apply lateral deflection impulse according to current gate direction
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
    const lateralDir = direction === 'left' ? -1 : 1;
    rb.applyImpulse({ x: right.x * lateralDir * 2.5, y: 0.1, z: right.z * lateralDir * 2.5 }, true);
  };

  // World coordinates of the flipper pivot
  const pivotOffset = new THREE.Vector3(0, 0.22, 0.05).applyAxisAngle(
    new THREE.Vector3(0, 1, 0),
    rotY
  );
  const gateWorldPos: [number, number, number] = [
    position[0] + pivotOffset.x,
    position[1] + pivotOffset.y,
    position[2] + pivotOffset.z,
  ];

  return (
    <>
      {/* 1. Main Static Splitter Chute Frame */}
      <RigidBody type="fixed" position={position} rotation={[0, rotY, 0]} colliders={false}>
        <group>
          {/* Base foundation platform */}
          <mesh position={[0, -0.25, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.98, 0.5, 0.98]} />
            <meshStandardMaterial color="#0f172a" roughness={0.7} />
          </mesh>

          {/* Y-Chute Floor Runner (Purple/Violet Splitter Bed) */}
          <mesh position={[0, 0.01, 0]} receiveShadow>
            <boxGeometry args={[0.96, 0.03, 0.96]} />
            <meshStandardMaterial color="#6b21a8" roughness={0.3} metalness={0.2} />
          </mesh>

          {/* Entrance runner decal */}
          <mesh position={[0, 0.027, -0.25]}>
            <boxGeometry args={[0.42, 0.005, 0.48]} />
            <meshStandardMaterial color="#a855f7" emissive="#7e22ce" emissiveIntensity={0.4} />
          </mesh>

          {/* Backstop Wall (blocks straight-through exit at +Z) */}
          <mesh position={[0, 0.25, 0.38]} castShadow receiveShadow>
            <boxGeometry args={[0.96, 0.5, 0.22]} />
            <meshStandardMaterial color="#581c87" roughness={0.4} />
          </mesh>

          {/* Left Entrance Corner Wall */}
          <mesh position={[-0.36, 0.2, -0.32]} castShadow receiveShadow>
            <boxGeometry args={[0.24, 0.44, 0.34]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          {/* Right Entrance Corner Wall */}
          <mesh position={[0.36, 0.2, -0.32]} castShadow receiveShadow>
            <boxGeometry args={[0.24, 0.44, 0.34]} />
            <meshStandardMaterial color="#334155" />
          </mesh>

          {/* Status Indicator LED lights on backstop */}
          <mesh position={[-0.2, 0.45, 0.26]}>
            <boxGeometry args={[0.12, 0.08, 0.05]} />
            <meshStandardMaterial
              color={direction === 'left' ? '#34d399' : '#475569'}
              emissive={direction === 'left' ? '#10b981' : '#000000'}
              emissiveIntensity={direction === 'left' ? 1.0 : 0}
            />
          </mesh>
          <mesh position={[0.2, 0.45, 0.26]}>
            <boxGeometry args={[0.12, 0.08, 0.05]} />
            <meshStandardMaterial
              color={direction === 'right' ? '#34d399' : '#475569'}
              emissive={direction === 'right' ? '#10b981' : '#000000'}
              emissiveIntensity={direction === 'right' ? 1.0 : 0}
            />
          </mesh>
        </group>

        {/* Physics Colliders - Compound Frame */}
        {/* Floor */}
        <CuboidCollider
          args={[0.49, 0.25, 0.49]}
          position={[0, -0.25, 0]}
          friction={0.1}
          restitution={0.2}
        />
        {/* Backstop Wall */}
        <CuboidCollider
          args={[0.48, 0.35, 0.12]}
          position={[0, 0.2, 0.38]}
          friction={0.1}
          restitution={0.2}
        />
        {/* Left entrance guard */}
        <CuboidCollider
          args={[0.13, 0.35, 0.18]}
          position={[-0.37, 0.15, -0.32]}
          friction={0.1}
          restitution={0.2}
        />
        {/* Right entrance guard */}
        <CuboidCollider
          args={[0.13, 0.35, 0.18]}
          position={[0.37, 0.15, -0.32]}
          friction={0.1}
          restitution={0.2}
        />

        {/* SENSORS */}
        {/* Entrance deflection assist */}
        <CuboidCollider
          sensor
          args={[0.22, 0.25, 0.15]}
          position={[0, 0.15, -0.25]}
          onIntersectionEnter={handleSplitterEntrance}
        />

        {/* Exit sensors to detect marble exiting left or right */}
        <CuboidCollider
          sensor
          args={[0.18, 0.25, 0.25]}
          position={[-0.38, 0.15, 0.0]}
          onIntersectionEnter={handleLeftSensor}
        />
        <CuboidCollider
          sensor
          args={[0.18, 0.25, 0.25]}
          position={[0.38, 0.15, 0.0]}
          onIntersectionEnter={handleRightSensor}
        />
      </RigidBody>

      {/* 2. Kinematic Alternating Flipper Gate */}
      <RigidBody
        ref={gateRbRef}
        type="kinematicPosition"
        position={gateWorldPos}
        colliders={false}
      >
        <group ref={gateMeshRef}>
          {/* Flipper Gate Body: extends forward into the incoming stream */}
          <mesh position={[0, 0, -0.2]} castShadow>
            <boxGeometry args={[0.08, 0.38, 0.42]} />
            <meshStandardMaterial
              color="#fbbf24"
              emissive="#f59e0b"
              emissiveIntensity={0.3}
              roughness={0.2}
              metalness={0.6}
            />
          </mesh>
          {/* Pivot Hinge Column */}
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.42, 16]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>

        {/* Flipper Solid Collider */}
        <CuboidCollider
          args={[0.05, 0.19, 0.22]}
          position={[0, 0, -0.2]}
          friction={0.1}
          restitution={0.2}
        />
      </RigidBody>
    </>
  );
};
