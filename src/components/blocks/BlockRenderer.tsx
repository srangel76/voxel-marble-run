import React from 'react';
import { BlockData } from '../../types';
import { SupportBlock } from './SupportBlock';
import { StraightBlock } from './StraightBlock';
import { RampBlock } from './RampBlock';
import { CurveBlock } from './CurveBlock';
import { LauncherBlock } from './LauncherBlock';
import { GoalBlock } from './GoalBlock';
import { MagneticBoosterBlock } from './MagneticBoosterBlock';
import { LoopBlock } from './LoopBlock';
import { SplitterBlock } from './SplitterBlock';

interface BlockRendererProps {
  block: BlockData;
  onPointerDown?: (e: any, block: BlockData) => void;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ block, onPointerDown }) => {
  const commonProps = {
    position: block.position,
    rotation: block.rotation,
  };

  const handleClick = (e: any) => {
    if (onPointerDown) {
      e.stopPropagation();
      onPointerDown(e, block);
    }
  };

  return (
    <group 
      onPointerDown={handleClick}
      onContextMenu={(e) => {
        e.stopPropagation();
        if (e.nativeEvent) {
          e.nativeEvent.preventDefault();
        }
      }}
    >
      {block.type === 'support' && <SupportBlock {...commonProps} />}
      {block.type === 'straight' && <StraightBlock {...commonProps} />}
      {block.type === 'ramp' && <RampBlock {...commonProps} />}
      {block.type === 'curve' && <CurveBlock {...commonProps} />}
      {block.type === 'launcher' && <LauncherBlock {...commonProps} />}
      {block.type === 'goal' && <GoalBlock {...commonProps} />}
      {block.type === 'booster' && <MagneticBoosterBlock {...commonProps} />}
      {block.type === 'loop' && <LoopBlock {...commonProps} />}
      {block.type === 'splitter' && <SplitterBlock {...commonProps} />}
    </group>
  );
};
