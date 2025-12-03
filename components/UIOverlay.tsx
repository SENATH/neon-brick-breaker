import React from 'react';
import { GameState } from '../types';
import { Trophy, Skull, Play, LogOut } from 'lucide-react';

interface UIOverlayProps {
  gameState: GameState;
  score: number;
  lives: number;
  onStartGame: () => void;
  onExitGame: () => void;
  currentTheme: string;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ 
  gameState, 
  score, 
  lives, 
  onStartGame,
  onExitGame,
  currentTheme
}) => {
  // HUD is always visible unless in Menu
  const showHUD = gameState !== GameState.MENU;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      {/* HUD Header */}
      <div className="flex justify-between items-start w-full">
        {showHUD && (
          <>
            <div className="flex items-start gap-4 pointer-events-auto">
              <button 
                onClick={onExitGame}
                className="p-2 text-slate-400 hover:text-white transition-colors bg-slate-800/50 rounded-lg border border-slate-700 hover:bg-red-500/80 hover:border-red-500/50" 
                title="Exit to Home"
              >
                <LogOut size={20} />
              </button>
              <div className="flex flex-col">
                <span className="text-slate-400 text-xs uppercase tracking-widest font-bold">Score</span>
                <span className="text-white font-arcade text-2xl">{score.toString().padStart(6, '0')}</span>
              </div>
            </div>
            
             <div className="flex flex-col items-center">
              <span className="text-slate-500 text-xs uppercase tracking-widest">Current Level</span>
              <span className="text-blue-300 font-bold tracking-wide text-shadow">{currentTheme}</span>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-slate-400 text-xs uppercase tracking-widest font-bold">Lives</span>
              <div className="flex gap-1 mt-1">
                {Array.from({ length: Math.max(0, lives) }).map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-red-500 rounded-sm shadow-[0_0_10px_rgba(239,68,68,0.6)]" />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Center Menus (Pointer events enabled for buttons) */}
      <div className="flex-1 flex items-center justify-center pointer-events-auto">
        
        {gameState === GameState.MENU && (
          <div className="bg-slate-800/90 p-8 rounded-2xl border border-slate-600 shadow-2xl max-w-md w-full text-center backdrop-blur-md">
            <h1 className="text-4xl md:text-5xl font-arcade text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6 drop-shadow-sm">
              NEON BRICK
            </h1>
            
            <div className="space-y-6">
              <button 
                onClick={onStartGame}
                className="w-full group relative px-6 py-4 bg-blue-600 hover:bg-blue-500 transition-all rounded-lg overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 group-hover:translate-x-full transition-transform duration-500 skew-x-12 -ml-4" />
                <div className="flex items-center justify-center gap-3 font-bold text-white text-lg tracking-wider">
                  <Play className="fill-white" /> START GAME
                </div>
              </button>
            </div>
          </div>
        )}

        {gameState === GameState.GAME_OVER && (
          <div className="bg-slate-900/95 p-8 rounded-xl border-2 border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.3)] text-center">
            <Skull className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
            <h2 className="text-4xl font-arcade text-red-500 mb-2">GAME OVER</h2>
            <p className="text-slate-400 mb-6">Final Score: <span className="text-white font-bold">{score}</span></p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={onStartGame}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded uppercase tracking-wider transition-colors"
              >
                Try Again
              </button>
              <button 
                onClick={onExitGame}
                className="px-6 py-3 border border-slate-600 hover:bg-slate-800 text-slate-300 font-bold rounded uppercase tracking-wider transition-colors"
              >
                Home
              </button>
            </div>
          </div>
        )}

        {gameState === GameState.VICTORY && (
          <div className="bg-slate-900/95 p-8 rounded-xl border-2 border-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.3)] text-center">
            <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
            <h2 className="text-4xl font-arcade text-green-500 mb-2">VICTORY!</h2>
            <p className="text-slate-400 mb-6">Score: <span className="text-white font-bold">{score}</span></p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={onStartGame}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded uppercase tracking-wider transition-colors"
              >
                Play Again
              </button>
              <button 
                onClick={onExitGame}
                className="px-6 py-3 border border-slate-600 hover:bg-slate-800 text-slate-300 font-bold rounded uppercase tracking-wider transition-colors"
              >
                Home
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default UIOverlay;
