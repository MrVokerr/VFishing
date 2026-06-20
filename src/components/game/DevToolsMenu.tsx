'use client';

interface DevToolsMenuProps {
  autoPlay: boolean;
  forceLegendary: boolean;
  canJumpFinalBurst: boolean;
  onToggleAutoPlay: () => void;
  onToggleForceLegendary: () => void;
  onJumpToFinalBurst: () => void;
}

export default function DevToolsMenu({
  autoPlay,
  forceLegendary,
  canJumpFinalBurst,
  onToggleAutoPlay,
  onToggleForceLegendary,
  onJumpToFinalBurst,
}: DevToolsMenuProps) {
  return (
    <div className="absolute top-12 right-0 bg-slate-800 border border-slate-600 p-4 rounded-xl shadow-xl z-50 w-60">
      <h4 className="text-sm font-bold text-slate-300 mb-3">Dev Tools</h4>
      <div className="flex flex-col gap-3">
        <ToggleRow label="Auto Play" on={autoPlay} onToggle={onToggleAutoPlay} onClass="bg-green-500" />
        <ToggleRow label="Force Legendary" on={forceLegendary} onToggle={onToggleForceLegendary} onClass="bg-amber-500" />
        <div className="border-t border-slate-700 pt-2">
          <button
            onClick={onJumpToFinalBurst}
            disabled={!canJumpFinalBurst}
            className="w-full py-1.5 px-2 bg-purple-800 hover:bg-purple-700 disabled:bg-slate-700 disabled:text-slate-500 rounded text-xs font-bold"
          >
            Jump to Final Burst QTE
          </button>
        </div>
      </div>
      <p className="text-[10px] text-slate-500 mt-3 leading-tight">
        Force Legendary hooks Shark/Kraken. Final Burst only on legendaries mid-fight.
      </p>
    </div>
  );
}

function ToggleRow({
  label,
  on,
  onToggle,
  onClass,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
  onClass: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-white">{label}</span>
      <button
        onClick={onToggle}
        className={`w-10 h-5 rounded-full relative transition-colors ${on ? onClass : 'bg-slate-600'}`}
      >
        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${on ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}
