import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RapierRigidBody, RigidBody, BallCollider } from '@react-three/rapier';
import { Trail } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { sound } from '../audio';

interface ActiveMarble {
  id: number;
  color: string;
  glowColor: string;
  spawnTime: number;
}

const MARBLE_PALETTES = [
  { color: '#38bdf8', glow: '#0284c7' }, // Cyan Sapphire
  { color: '#fbbf24', glow: '#f59e0b' }, // Amber Topaz
  { color: '#34d399', glow: '#10b981' }, // Emerald Jade
  { color: '#f43f5e', glow: '#e11d48' }, // Ruby Crimson
  { color: '#c084fc', glow: '#9333ea' }, // Amethyst Purple
];

interface SingleMarbleProps {
  marble: ActiveMarble;
  spawnPos: [number, number, number];
  forwardVel: [number, number, number];
  onFrameReport: (id: number, pos: { x: number; y: number; z: number }, vel: { x: number; y: number; z: number }) => void;
  onGoalCheck: (pos: { x: number; y: number; z: number }) => void;
}

const SingleMarble: React.FC<SingleMarbleProps> = ({
  marble,
  spawnPos,
  forwardVel,
  onFrameReport,
  onGoalCheck,
}) => {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (rigidBodyRef.current && !hasInitialized.current) {
      hasInitialized.current = true;
      rigidBodyRef.current.setTranslation(
        { x: spawnPos[0], y: spawnPos[1], z: spawnPos[2] },
        true
      );
      rigidBodyRef.current.setLinvel(
        { x: forwardVel[0], y: forwardVel[1], z: forwardVel[2] },
        true
      );
      rigidBodyRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
    }
  }, [spawnPos, forwardVel]);

  useFrame(() => {
    if (!rigidBodyRef.current) return;

    const pos = rigidBodyRef.current.translation();
    const vel = rigidBodyRef.current.linvel();

    onFrameReport(marble.id, pos, vel);
    onGoalCheck(pos);
  });

  const handleCollision = () => {
    const vel = rigidBodyRef.current?.linvel();
    const speed = vel ? Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z) : 2;
    sound.playClackSound(speed);
  };

  return (
    <RigidBody
      ref={rigidBodyRef}
      type="dynamic"
      colliders={false}
      position={spawnPos}
      linearDamping={0.02}
      angularDamping={0.02}
      ccd={true} // CCD enabled to avoid tunneling
      onCollisionEnter={handleCollision}
    >
      <BallCollider args={[0.16]} mass={1.2} friction={0.03} restitution={0.15} />

      {/* Visual Glowing Trail */}
      <Trail width={0.22} length={7} color={marble.color} attenuation={(t) => t * t}>
        <group>
          {/* Main Glass/Metallic Sphere */}
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[0.16, 24, 24]} />
            <meshPhysicalMaterial
              color={marble.color}
              emissive={marble.glowColor}
              emissiveIntensity={0.3}
              roughness={0.15}
              metalness={0.7}
              clearcoat={1.0}
              clearcoatRoughness={0.1}
            />
          </mesh>
          {/* Core Spark */}
          <mesh>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      </Trail>
    </RigidBody>
  );
};

export const Marble: React.FC = () => {
  const blocks = useGameStore((state) => state.blocks);
  const mode = useGameStore((state) => state.mode);
  const marbleKey = useGameStore((state) => state.marbleKey);
  const maxMarbles = useGameStore((state) => state.maxMarbles);
  const setGoalReached = useGameStore((state) => state.setGoalReached);

  const [marbles, setMarbles] = useState<ActiveMarble[]>([]);
  const lastSpawnTime = useRef<number>(0);
  const spawnCounter = useRef<number>(0);

  // Compute spawn location and initial impulse based on launcher block
  const launcher = blocks.find((b) => b.type === 'launcher');
  let spawnPos: [number, number, number] = [0, 2.25, 0];
  let forwardVel: [number, number, number] = [0, 0, 1.9];

  if (launcher) {
    const [lx, ly, lz] = launcher.position;
    const rot = launcher.rotation % 4;
    const rotY = (rot * Math.PI) / 2;

    const localOffset = new THREE.Vector3(0, 0.22, -0.15);
    localOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
    spawnPos = [lx + localOffset.x, ly + localOffset.y, lz + localOffset.z];

    const impulse = new THREE.Vector3(0, 0, 1.9);
    impulse.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotY);
    forwardVel = [impulse.x, impulse.y, impulse.z];
  } else if (blocks.length > 0) {
    const first = blocks[0];
    spawnPos = [first.position[0], first.position[1] + 1.2, first.position[2]];
    forwardVel = [0, 0, 0.5];
  }

  const updateMarbleTelemetry = useGameStore((state) => state.updateMarbleTelemetry);
  const isGoalReached = useGameStore((state) => state.isGoalReached);
  const telemetryDataRef = useRef<Map<number, { pos: { x: number; y: number; z: number }; vel: { x: number; y: number; z: number } }>>(new Map());

  // Reset marbles when entering Play mode or on marbleKey change
  useEffect(() => {
    if (mode === 'play') {
      spawnCounter.current = 1;
      lastSpawnTime.current = Date.now();
      telemetryDataRef.current.clear();
      setMarbles([
        {
          id: 1,
          color: MARBLE_PALETTES[0].color,
          glowColor: MARBLE_PALETTES[0].glow,
          spawnTime: Date.now(),
        },
      ]);
    } else {
      setMarbles([]);
      telemetryDataRef.current.clear();
    }
  }, [mode, marbleKey]);

  // Interval spawning: spawn a marble every 1.5 seconds up to maxMarbles limit
  useFrame(() => {
    if (mode !== 'play') return;

    const now = Date.now();
    const spawnIntervalMs = 1500; // 1.5s interval as specified

    if (marbles.length < maxMarbles && now - lastSpawnTime.current >= spawnIntervalMs) {
      lastSpawnTime.current = now;
      spawnCounter.current += 1;
      const palette = MARBLE_PALETTES[(spawnCounter.current - 1) % MARBLE_PALETTES.length];

      sound.playLaunchSound();
      setMarbles((prev) => [
        ...prev,
        {
          id: spawnCounter.current,
          color: palette.color,
          glowColor: palette.glow,
          spawnTime: now,
        },
      ]);
    }

    // Telemetry: Identify furthest forward marble along the course
    let leadPos = { x: 0, y: 0, z: 0 };
    let leadVel = { x: 0, y: 0, z: 0 };
    let maxDistance = -Infinity;

    telemetryDataRef.current.forEach((data) => {
      // Distance metric: Z progress + lateral progress
      const dist = data.pos.z + Math.abs(data.pos.x) * 0.8;
      if (dist > maxDistance && data.pos.y > -3.0) {
        maxDistance = dist;
        leadPos = data.pos;
        leadVel = data.vel;
      }
    });

    if (maxDistance > -Infinity) {
      const speed = Math.sqrt(leadVel.x * leadVel.x + leadVel.y * leadVel.y + leadVel.z * leadVel.z);
      sound.updateRollSound(speed);
      updateMarbleTelemetry(leadPos, leadVel, isGoalReached, false);
    }
  });

  const handleFrameReport = (
    id: number,
    pos: { x: number; y: number; z: number },
    vel: { x: number; y: number; z: number }
  ) => {
    telemetryDataRef.current.set(id, { pos, vel });
  };

  const handleGoalCheck = (pos: { x: number; y: number; z: number }) => {
    const goals = blocks.filter((b) => b.type === 'goal');
    for (const goal of goals) {
      const [gx, gy, gz] = goal.position;
      const dx = pos.x - gx;
      const dy = pos.y - (gy + 0.15);
      const dz = pos.z - gz;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (dist < 0.55) {
        setGoalReached();
      }
    }
  };

  return (
    <group key={`multi-marble-${marbleKey}`}>
      {marbles.map((m) => (
        <SingleMarble
          key={`m-${marbleKey}-${m.id}`}
          marble={m}
          spawnPos={spawnPos}
          forwardVel={forwardVel}
          onFrameReport={handleFrameReport}
          onGoalCheck={handleGoalCheck}
        />
      ))}
    </group>
  );
};
