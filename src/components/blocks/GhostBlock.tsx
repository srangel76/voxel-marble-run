import React from 'react';
import { useGameStore } from '../../store';

interface GhostBlockProps {
  position: [number, number, number] | null;
  isValid: boolean;
}

export const GhostBlock: React.FC<GhostBlockProps> = ({ position, isValid }) => {
  const selectedBlockType = useGameStore((state) => state.selectedBlockType);
  const selectedRotation = useGameStore((state) => state.selectedRotation);

  if (!position) return null;

  const rotY = (selectedRotation * Math.PI) / 2;
  const color = isValid ? '#38bdf8' : '#f43f5e';
  const emissive = isValid ? '#0284c7' : '#e11d48';

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Ghost Wireframe / Translucent Box */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={0.4}
          transparent
          opacity={0.35}
          wireframe={false}
          depthWrite={false}
        />
      </mesh>

      {/* Wireframe edges outline */}
      <lineSegments>
        <edgesGeometry args={[new (THREE_BOX_GEOMETRY)(1, 1, 1)]} />
        <lineBasicMaterial color={isValid ? '#7dd3fc' : '#fda4af'} transparent opacity={0.8} />
      </lineSegments>

      {/* Direction indicator arrow at the top of the block */}
      <group position={[0, 0.52, 0]}>
        {/* Shaft */}
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[0.08, 0.02, 0.35]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        {/* Arrowhead */}
        <mesh position={[0, 0, 0.32]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[0.18, 0.02, 0.18]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      </group>

      {/* Preview details specific to block type */}
      {selectedBlockType === 'ramp' && (
        <group position={[0, 0.5, 0]} rotation={[Math.PI / 4, 0, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.5, 0.05, 1.4]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.6} />
          </mesh>
        </group>
      )}

      {selectedBlockType === 'straight' && (
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[0.46, 0.04, 0.98]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} />
        </mesh>
      )}

      {selectedBlockType === 'curve' && (
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[0.9, 0.04, 0.9]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} />
        </mesh>
      )}

      {selectedBlockType === 'launcher' && (
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[0.46, 0.04, 0.98]} />
          <meshBasicMaterial color="#34d399" transparent opacity={0.6} />
        </mesh>
      )}

      {selectedBlockType === 'goal' && (
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[0.46, 0.04, 0.98]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.6} />
        </mesh>
      )}

      {selectedBlockType === 'booster' && (
        <group position={[0, 0.25, 0]}>
          <mesh position={[0, -0.22, 0]}>
            <boxGeometry args={[0.46, 0.04, 0.98]} />
            <meshBasicMaterial color="#00f0ff" transparent opacity={0.6} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.6, 0.5, 0.1]} />
            <meshBasicMaterial color="#00f0ff" transparent opacity={0.4} />
          </mesh>
        </group>
      )}

      {selectedBlockType === 'loop' && (
        <group position={[0, 0.95, 0]}>
          <mesh position={[0, 0, 0]}>
            <torusGeometry args={[0.95, 0.1, 16, 32]} />
            <meshBasicMaterial color="#818cf8" transparent opacity={0.5} />
          </mesh>
        </group>
      )}

      {selectedBlockType === 'splitter' && (
        <group position={[0, 0.02, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.96, 0.04, 0.96]} />
            <meshBasicMaterial color="#c084fc" transparent opacity={0.5} />
          </mesh>
          <mesh position={[0, 0.18, 0]}>
            <boxGeometry args={[0.1, 0.3, 0.4]} />
            <meshBasicMaterial color="#f59e0b" transparent opacity={0.6} />
          </mesh>
        </group>
      )}
    </group>
  );
};

// Helper for wireframe box geometry
import * as THREE from 'three';
const THREE_BOX_GEOMETRY = THREE.BoxGeometry;
