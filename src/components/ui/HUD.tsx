import React from 'react';
import { 
  Play, 
  Square, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Trash2, 
  Sparkles, 
  Box, 
  ArrowUp, 
  TrendingDown, 
  CornerDownRight, 
  Rocket, 
  Flag,
  HelpCircle,
  Zap,
  RotateCcw,
  GitBranch
} from 'lucide-react';
import { useGameStore } from '../../store';
import { BlockType } from '../../types';

interface BlockOption {
  type: BlockType;
  label: string;
  icon: React.ReactNode;
  color: string;
  border: string;
}

const BLOCK_OPTIONS: BlockOption[] = [
  {
    type: 'straight',
    label: 'Reta',
    icon: <ArrowUp className="w-5 h-5" />,
    color: 'bg-sky-500/20 text-sky-400',
    border: 'border-sky-500',
  },
  {
    type: 'ramp',
    label: 'Rampa',
    icon: <TrendingDown className="w-5 h-5" />,
    color: 'bg-amber-500/20 text-amber-400',
    border: 'border-amber-500',
  },
  {
    type: 'curve',
    label: 'Curva 90°',
    icon: <CornerDownRight className="w-5 h-5" />,
    color: 'bg-cyan-500/20 text-cyan-400',
    border: 'border-cyan-500',
  },
  {
    type: 'support',
    label: 'Suporte',
    icon: <Box className="w-5 h-5" />,
    color: 'bg-slate-500/20 text-slate-300',
    border: 'border-slate-400',
  },
  {
    type: 'launcher',
    label: 'Lançador',
    icon: <Rocket className="w-5 h-5" />,
    color: 'bg-emerald-500/20 text-emerald-400',
    border: 'border-emerald-500',
  },
  {
    type: 'goal',
    label: 'Chegada',
    icon: <Flag className="w-5 h-5" />,
    color: 'bg-yellow-500/20 text-yellow-400',
    border: 'border-yellow-500',
  },
  {
    type: 'booster',
    label: 'Propulsor',
    icon: <Zap className="w-5 h-5" />,
    color: 'bg-cyan-500/20 text-cyan-300',
    border: 'border-cyan-400',
  },
  {
    type: 'loop',
    label: 'Looping',
    icon: <RotateCcw className="w-5 h-5" />,
    color: 'bg-indigo-500/20 text-indigo-300',
    border: 'border-indigo-400',
  },
  {
    type: 'splitter',
    label: 'Divisor Y',
    icon: <GitBranch className="w-5 h-5" />,
    color: 'bg-purple-500/20 text-purple-300',
    border: 'border-purple-400',
  },
];

export const HUD: React.FC = () => {
  const mode = useGameStore((state) => state.mode);
  const selectedBlockType = useGameStore((state) => state.selectedBlockType);
  const selectedRotation = useGameStore((state) => state.selectedRotation);
  const isMuted = useGameStore((state) => state.isMuted);
  const blocks = useGameStore((state) => state.blocks);
  const marblePos = useGameStore((state) => state.marblePosition);
  const marbleVel = useGameStore((state) => state.marbleVelocity);
  const isGoalReached = useGameStore((state) => state.isGoalReached);
  const hasFallen = useGameStore((state) => state.hasFallen);

  const setMode = useGameStore((state) => state.setMode);
  const setSelectedBlockType = useGameStore((state) => state.setSelectedBlockType);
  const rotateSelectedBlock = useGameStore((state) => state.rotateSelectedBlock);
  const resetMarble = useGameStore((state) => state.resetMarble);
  const clearTrack = useGameStore((state) => state.clearTrack);
  const loadTestTrack = useGameStore((state) => state.loadTestTrack);
  const loadDynamicTestTrack = useGameStore((state) => state.loadDynamicTestTrack);
  const toggleSound = useGameStore((state) => state.toggleSound);
  const boostsTriggered = useGameStore((state) => state.boostsTriggered);
  const loopsCompleted = useGameStore((state) => state.loopsCompleted);
  const splitterAlternations = useGameStore((state) => state.splitterAlternations);
  const maxMarbles = useGameStore((state) => state.maxMarbles);

  const [showHelp, setShowHelp] = React.useState(false);

  const speed = Math.sqrt(
    marbleVel.x * marbleVel.x + marbleVel.y * marbleVel.y + marbleVel.z * marbleVel.z
  );

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 z-10 select-none">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between gap-4">
        {/* Title & Brand */}
        <div className="pointer-events-auto flex items-center gap-3 bg-slate-900/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/60 shadow-xl">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-sky-500/20">
            <div className="w-5 h-5 rounded-full bg-white shadow-inner animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
              VOXEL MARBLE RUN
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40">
                Sandbox 3D
              </span>
            </h1>
            <div className="flex items-center gap-2">
              <p className="text-xs text-slate-400 font-medium">
                {blocks.length} blocos na pista
              </p>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                💾 Salvo
              </span>
            </div>
          </div>
        </div>

        {/* Central Mode Switcher */}
        <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700/80 shadow-2xl">
          <button
            onClick={() => setMode('build')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
              mode === 'build'
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 scale-102'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Square className="w-4 h-4" />
            CONSTRUIR
          </button>

          <button
            onClick={() => setMode('play')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 ${
              mode === 'play'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-102 animate-pulse'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            JOGAR (PLAY)
          </button>

          {mode === 'play' && (
            <button
              onClick={resetMarble}
              title="Reiniciar bolinha no lançador"
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Reiniciar Bolinha
            </button>
          )}
        </div>

        {/* Quick Actions (Demo Track, Sound, Clear) */}
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={loadTestTrack}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-slate-900/85 hover:bg-emerald-950/80 border border-emerald-500/40 shadow-lg transition-all"
            title="Carrega a pista de teste clássica de 5 blocos"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Pista Clássica
          </button>

          <button
            onClick={loadDynamicTestTrack}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-purple-300 bg-slate-900/85 hover:bg-purple-950/80 border border-purple-500/40 shadow-lg shadow-purple-500/20 transition-all scale-102"
            title="Carrega o circuito dinâmico: Lançador (3 bolinhas) -> Reta -> Propulsor -> Loop -> Splitter -> 2 Chegadas"
          >
            <Zap className="w-4 h-4 text-purple-400" />
            Demo Dinâmica
          </button>

          <button
            onClick={clearTrack}
            className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 bg-slate-900/85 hover:bg-slate-800 border border-slate-700/60 shadow-lg transition-colors"
            title="Limpar todos os blocos"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={toggleSound}
            className="p-2.5 rounded-xl text-slate-400 hover:text-sky-300 bg-slate-900/85 hover:bg-slate-800 border border-slate-700/60 shadow-lg transition-colors"
            title={isMuted ? 'Desmutar áudio' : 'Mutar áudio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
          </button>

          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2.5 rounded-xl text-slate-400 hover:text-sky-300 bg-slate-900/85 hover:bg-slate-800 border border-slate-700/60 shadow-lg transition-colors"
            title="Instruções e atalhos"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Help Modal Dropdown */}
      {showHelp && (
        <div className="pointer-events-auto absolute top-20 right-4 bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-2xl max-w-sm text-xs space-y-2">
          <h3 className="font-bold text-sky-400 text-sm flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4" /> Instruções & Atalhos
          </h3>
          <ul className="space-y-1.5 text-slate-300">
            <li><strong className="text-white">Clique Esquerdo:</strong> Posiciona o bloco selecionado (ou empilha se clicar no topo de outro).</li>
            <li><strong className="text-white">Clique Direito:</strong> Remove o bloco clicado.</li>
            <li><strong className="text-white">Tecla R:</strong> Rotaciona o bloco em 90°.</li>
            <li><strong className="text-white">Espaço:</strong> Alterna entre CONSTRUIR e JOGAR.</li>
            <li><strong className="text-white">Arrastar Câmera:</strong> Gira / inclina o tabuleiro livremente.</li>
          </ul>
        </div>
      )}

      {/* Middle Alerts (e.g. Marble Fallen) */}
      {mode === 'play' && hasFallen && !isGoalReached && (
        <div className="self-center bg-rose-500/90 text-white font-bold px-6 py-2.5 rounded-2xl shadow-xl backdrop-blur-sm animate-bounce flex items-center gap-2">
          <span>A bolinha saiu da pista!</span>
          <button
            onClick={resetMarble}
            className="pointer-events-auto ml-2 px-3 py-1 bg-white text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-50"
          >
            Tentar Novamente
          </button>
        </div>
      )}

      {/* Bottom Control Bar */}
      <footer className="flex items-end justify-between gap-4">
        {/* Left Telemetry Card */}
        <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-md p-3.5 rounded-2xl border border-slate-700/60 shadow-xl text-xs space-y-1 min-w-[210px]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1.5">
            <span className="font-bold text-slate-300">TELEMETRIA RAPID</span>
            <span
              className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                isGoalReached
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : mode === 'play'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
              }`}
            >
              {isGoalReached ? '★ CHEGADA!' : mode === 'play' ? 'ROLANDO' : 'EDICAO'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 font-mono text-[11px] text-slate-400">
            <div>Pos X: <span className="text-slate-200">{marblePos.x.toFixed(2)}</span></div>
            <div>Vel: <span className="text-sky-300">{speed.toFixed(2)} m/s</span></div>
            <div>Pos Y: <span className="text-slate-200">{marblePos.y.toFixed(2)}</span></div>
            <div>Bolinhas: <span className="text-emerald-400">Até {maxMarbles}</span></div>
            <div>Pos Z: <span className="text-slate-200">{marblePos.z.toFixed(2)}</span></div>
            <div>Boosts: <span className="text-cyan-300 font-bold">{boostsTriggered}</span></div>
            <div>Loops: <span className="text-indigo-300 font-bold">{loopsCompleted}</span></div>
            <div>Divisor: <span className="text-purple-300 font-bold">E:{splitterAlternations.left} D:{splitterAlternations.right}</span></div>
          </div>
        </div>

        {/* Center: Block Catalog & Rotation (only in Build Mode) */}
        {mode === 'build' ? (
          <div className="pointer-events-auto flex items-center gap-3 bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-700/80 shadow-2xl">
            {/* Block Type Buttons */}
            <div className="flex items-center gap-1.5">
              {BLOCK_OPTIONS.map((opt) => {
                const isSelected = selectedBlockType === opt.type;
                return (
                  <button
                    key={opt.type}
                    onClick={() => setSelectedBlockType(opt.type)}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isSelected
                        ? `${opt.color} ${opt.border} border-2 shadow-lg scale-105`
                        : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="h-9 w-[1px] bg-slate-700/80 mx-1" />

            {/* Rotation 90° Button */}
            <button
              onClick={rotateSelectedBlock}
              className="flex flex-col items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-semibold bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 shadow-md transition-all active:scale-95"
              title="Rotacionar bloco selecionado em 90° (Tecla R)"
            >
              <RotateCw className="w-5 h-5" />
              <span>Rot: {selectedRotation * 90}° <span className="opacity-60">(R)</span></span>
            </button>
          </div>
        ) : (
          <div className="pointer-events-auto bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-slate-700/60 shadow-xl text-center">
            <p className="text-xs font-semibold text-emerald-400 flex items-center justify-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              Simulação de Física Rapier Ativa com CCD
            </p>
          </div>
        )}

        {/* Right Helper Legend */}
        <div className="pointer-events-auto bg-slate-900/85 backdrop-blur-md px-3.5 py-3 rounded-2xl border border-slate-700/60 shadow-xl text-[11px] text-slate-400 space-y-1">
          <div className="text-white font-semibold flex items-center gap-1">
            <span>Controles Rápidos</span>
          </div>
          <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono">L-Click</kbd> Colocar</div>
          <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-rose-300 font-mono">R-Click</kbd> Remover</div>
          <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">R</kbd> Girar 90°</div>
          <div><kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono">Espaço</kbd> Play/Build</div>
        </div>
      </footer>
    </div>
  );
};
