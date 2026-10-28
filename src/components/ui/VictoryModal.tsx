import React from 'react';
import { Trophy, RotateCw, Hammer } from 'lucide-react';
import { useGameStore } from '../../store';

export const VictoryModal: React.FC = () => {
  const isGoalReached = useGameStore((state) => state.isGoalReached);
  const resetMarble = useGameStore((state) => state.resetMarble);
  const setMode = useGameStore((state) => state.setMode);

  if (!isGoalReached) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative max-w-sm w-full bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-3xl border-2 border-amber-500/50 shadow-2xl shadow-amber-500/20 text-center space-y-4">
        {/* Glow Trophy Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/30">
          <Trophy className="w-9 h-9 text-amber-400 animate-bounce" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-white tracking-wide">
            VITÓRIA!
          </h2>
          <p className="text-sm text-amber-300 font-medium mt-1">
            A bolinha de gude alcançou a Chegada com sucesso!
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={resetMarble}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/30 transition-transform active:scale-95"
          >
            <RotateCw className="w-4 h-4" />
            Jogar Novamente
          </button>

          <button
            onClick={() => setMode('build')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 transition-colors"
          >
            <Hammer className="w-4 h-4" />
            Editar Pista
          </button>
        </div>
      </div>
    </div>
  );
};
