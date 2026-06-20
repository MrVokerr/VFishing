'use client';

import { AlertCircle } from 'lucide-react';

interface HookedScreenProps {
  onHookFish: () => void;
}

export default function HookedScreen({ onHookFish }: HookedScreenProps) {
  return (
    <div className="flex flex-col items-center">
      <AlertCircle size={80} className="text-red-500 mb-4 animate-bounce" />
      <button
        onClick={onHookFish}
        className="px-10 py-5 bg-red-600 text-white font-extrabold text-3xl rounded-xl border-2 border-red-400 hover:bg-red-500 shadow-[0_4px_20px_rgba(220,38,38,0.5)] animate-pulse"
      >
        HOOK IT!
      </button>
      <p className="text-sm text-slate-400 mt-4">Click or press W / A / S / D / arrows / Space when ready</p>
    </div>
  );
}

export function CastingScreen() {
  return (
    <div className="flex flex-col items-center">
      <div className="animate-pulse text-2xl font-bold text-blue-200 mb-4">Waiting for bite...</div>
      <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
