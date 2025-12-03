import React, { useState, useCallback, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import UIOverlay from './components/UIOverlay';
import { GameState } from './types';
import { generateLevelWithGemini } from './services/geminiService';
import { BRICK_ROWS, BRICK_COLS } from './constants';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [levelLayout, setLevelLayout] = useState<number[][]>([]);
  const [levelTheme, setLevelTheme] = useState("Standard Classic");
  const [gameId, setGameId] = useState(0);

  // Default level generator
  const generateDefaultLevel = useCallback(() => {
    const layout: number[][] = [];
    for (let r = 0; r < BRICK_ROWS; r++) {
      const row: number[] = [];
      for (let c = 0; c < BRICK_COLS; c++) {
        // Simple pattern: Rows 0-4 have bricks, staggered colors
        if (r < 6) {
           // Skip some for pattern
           if ((r + c) % 2 === 0) {
             row.push(Math.min(6, r + 1));
           } else {
             row.push(Math.max(1, 5 - r));
           }
        } else {
          row.push(0);
        }
      }
      layout.push(row);
    }
    return layout;
  }, []);

  // Initialize default level on mount
  useEffect(() => {
    setLevelLayout(generateDefaultLevel());
  }, [generateDefaultLevel]);

  const handleStartGame = () => {
    setScore(0);
    setLives(3);
    setGameId(prev => prev + 1);
    setGameState(GameState.PLAYING);
  };

  const handleExitGame = () => {
    // Reset to default level (background) when going home
    setLevelLayout(generateDefaultLevel());
    setLevelTheme("Standard Classic");
    setGameId(prev => prev + 1); // Force canvas reset to show default level
    setGameState(GameState.MENU);
  };

  const handleGenerateLevel = async (prompt: string) => {
    if (!prompt.trim()) return;
    
    setGameState(GameState.GENERATING_LEVEL);
    try {
      const response = await generateLevelWithGemini(prompt);
      setLevelLayout(response.layout);
      setLevelTheme(response.themeName);
      setScore(0);
      setLives(3);
      setGameId(prev => prev + 1); // Ensure fresh start with new level
      setGameState(GameState.PLAYING);
    } catch (error) {
      console.error("Failed to generate", error);
      // Revert to menu on failure, maybe show toast in real app
      setGameState(GameState.MENU);
      alert("AI failed to generate level. Please try again.");
    }
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 flex items-center justify-center overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black opacity-50 pointer-events-none" />
      
      {/* Game Container */}
      <div className="relative shadow-2xl rounded-lg overflow-hidden border border-slate-800 bg-black">
        <GameCanvas 
          gameState={gameState} 
          setGameState={setGameState}
          setScore={setScore}
          setLives={setLives}
          levelLayout={levelLayout}
          gameId={gameId}
        />
        <UIOverlay 
          gameState={gameState}
          score={score}
          lives={lives}
          onStartGame={handleStartGame}
          onExitGame={handleExitGame}
          onGenerateLevel={handleGenerateLevel}
          currentTheme={levelTheme}
        />
      </div>

      <div className="absolute bottom-4 text-slate-500 text-xs font-mono opacity-50">
        Powered by React, Tailwind & Gemini 2.5 Flash
      </div>
    </div>
  );
};

export default App;
