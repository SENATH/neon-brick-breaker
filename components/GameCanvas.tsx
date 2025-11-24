import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  COLORS, 
  PADDLE_WIDTH, 
  PADDLE_HEIGHT, 
  BALL_RADIUS, 
  BRICK_ROWS, 
  BRICK_COLS, 
  BRICK_GAP,
  PADDLE_SPEED 
} from '../constants';
import { GameState, Vector2D, Brick, Ball, Paddle } from '../types';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  setLives: React.Dispatch<React.SetStateAction<number>>;
  levelLayout: number[][]; // From parent/Gemini
  gameId: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ 
  gameState, 
  setGameState, 
  setScore, 
  setLives,
  levelLayout,
  gameId
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Input State
  const keysPressed = useRef<Set<string>>(new Set());

  // Game State Refs (Mutable for high-performance loop)
  const ballRef = useRef<Ball>({ 
    pos: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60 }, 
    vel: { x: 4, y: -4 }, // Initial velocity
    radius: BALL_RADIUS,
    active: false 
  });
  
  const paddleRef = useRef<Paddle>({ 
    x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2, 
    width: PADDLE_WIDTH, 
    height: PADDLE_HEIGHT 
  });

  const bricksRef = useRef<Brick[]>([]);
  const particlesRef = useRef<Array<{pos: Vector2D, vel: Vector2D, life: number, color: string}>>([]);
  const shakeRef = useRef<number>(0);

  // Initialize Bricks based on Layout
  const initBricks = useCallback(() => {
    const newBricks: Brick[] = [];
    const brickWidth = (CANVAS_WIDTH - (BRICK_COLS + 1) * BRICK_GAP) / BRICK_COLS;
    const brickHeight = 25;

    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        const val = levelLayout[r] ? levelLayout[r][c] : 0;
        if (val > 0) {
          newBricks.push({
            x: BRICK_GAP + c * (brickWidth + BRICK_GAP),
            y: BRICK_GAP + r * (brickHeight + BRICK_GAP) + 50, // Top margin
            w: brickWidth,
            h: brickHeight,
            value: val,
            active: true
          });
        }
      }
    }
    bricksRef.current = newBricks;
  }, [levelLayout]);

  // Reset Ball
  const resetBall = () => {
    ballRef.current = {
      pos: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60 },
      vel: { x: (Math.random() > 0.5 ? 4 : -4), y: -4 },
      radius: BALL_RADIUS,
      active: true
    };
    paddleRef.current.x = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
    // Clear effects on reset
    particlesRef.current = [];
    shakeRef.current = 0;
  };

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        keysPressed.current.add(e.code);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
        keysPressed.current.delete(e.code);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Effect to handle level changes or full game restarts
  useEffect(() => {
    if (levelLayout.length > 0) {
      initBricks();
      resetBall();
    }
  }, [gameId, levelLayout, initBricks]);

  // Mouse Move Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameState !== GameState.PLAYING) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;

    // Center paddle on mouse
    let newX = mouseX - PADDLE_WIDTH / 2;
    
    // Clamp
    if (newX < 0) newX = 0;
    if (newX + PADDLE_WIDTH > CANVAS_WIDTH) newX = CANVAS_WIDTH - PADDLE_WIDTH;

    paddleRef.current.x = newX;
  };

  // Main Loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Update
    if (gameState === GameState.PLAYING) {
      updateGame();
    }

    // Draw
    drawGame(ctx);

    requestRef.current = requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  // --- Logic Helpers ---

  const spawnParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 8; i++) {
      particlesRef.current.push({
        pos: { x, y },
        vel: { x: (Math.random() - 0.5) * 5, y: (Math.random() - 0.5) * 5 },
        life: 1.0,
        color
      });
    }
  };

  const updateGame = () => {
    const ball = ballRef.current;
    const paddle = paddleRef.current;
    
    // 1. Handle Keyboard Paddle Movement
    if (keysPressed.current.has('ArrowLeft')) {
      paddle.x -= PADDLE_SPEED;
    }
    if (keysPressed.current.has('ArrowRight')) {
      paddle.x += PADDLE_SPEED;
    }
    // Clamp Paddle
    if (paddle.x < 0) paddle.x = 0;
    if (paddle.x + paddle.width > CANVAS_WIDTH) paddle.x = CANVAS_WIDTH - paddle.width;

    // 2. Move Ball
    ball.pos.x += ball.vel.x;
    ball.pos.y += ball.vel.y;

    // Wall Collisions
    if (ball.pos.x - ball.radius < 0) {
      ball.pos.x = ball.radius;
      ball.vel.x *= -1;
    }
    if (ball.pos.x + ball.radius > CANVAS_WIDTH) {
      ball.pos.x = CANVAS_WIDTH - ball.radius;
      ball.vel.x *= -1;
    }
    if (ball.pos.y - ball.radius < 0) {
      ball.pos.y = ball.radius;
      ball.vel.y *= -1;
    }

    // Floor Collision (Lose Life)
    if (ball.pos.y + ball.radius > CANVAS_HEIGHT) {
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setGameState(GameState.GAME_OVER);
          ball.active = false;
        } else {
          // Reset ball position but keep bricks
          ball.pos = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT - 60 };
          ball.vel = { x: 4, y: -4 };
          paddleRef.current.x = (CANVAS_WIDTH - PADDLE_WIDTH) / 2;
        }
        return newLives;
      });
      shakeRef.current = 20;
    }

    // Paddle Collision
    // Simple AABB
    if (
      ball.pos.y + ball.radius >= CANVAS_HEIGHT - 40 && // Paddle roughly here
      ball.pos.y - ball.radius <= CANVAS_HEIGHT - 40 + PADDLE_HEIGHT &&
      ball.pos.x >= paddle.x &&
      ball.pos.x <= paddle.x + paddle.width
    ) {
        // Calculate relative intersect to vary angle
        const centerPaddle = paddle.x + paddle.width / 2;
        const dist = ball.pos.x - centerPaddle;
        const normDist = dist / (paddle.width / 2); // -1 to 1

        ball.vel.x = normDist * 6; // Add spin/angle
        ball.vel.y = -Math.abs(ball.vel.y); // Bounce up
        
        // Speed up slightly
        ball.vel.x *= 1.05;
        ball.vel.y *= 1.05;

        // Prevent sticking
        ball.pos.y = CANVAS_HEIGHT - 40 - ball.radius - 1;
    }

    // Brick Collision
    let hitBrick = false;
    for (let i = 0; i < bricksRef.current.length; i++) {
      const b = bricksRef.current[i];
      if (!b.active) continue;

      if (
        ball.pos.x + ball.radius > b.x &&
        ball.pos.x - ball.radius < b.x + b.w &&
        ball.pos.y + ball.radius > b.y &&
        ball.pos.y - ball.radius < b.y + b.h
      ) {
        b.active = false;
        ball.vel.y *= -1; // Simple reflection
        hitBrick = true;
        setScore(prev => prev + (b.value * 10));
        spawnParticles(b.x + b.w/2, b.y + b.h/2, COLORS.bricks[b.value]);
        shakeRef.current = 5;
        break; // Only hit one brick per frame
      }
    }

    // Check Victory
    if (hitBrick) {
      if (bricksRef.current.every(b => !b.active)) {
        setGameState(GameState.VICTORY);
        ball.active = false;
      }
    }

    // Particles Update
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.pos.x += p.vel.x;
      p.pos.y += p.vel.y;
      p.life -= 0.05;
      if (p.life <= 0) {
        particlesRef.current.splice(i, 1);
      }
    }

    // Screen Shake Decay
    if (shakeRef.current > 0) shakeRef.current *= 0.9;
    if (shakeRef.current < 0.5) shakeRef.current = 0;
  };

  const drawGame = (ctx: CanvasRenderingContext2D) => {
    // Clear
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Apply Shake
    ctx.save();
    if (shakeRef.current > 0) {
      const dx = (Math.random() - 0.5) * shakeRef.current;
      const dy = (Math.random() - 0.5) * shakeRef.current;
      ctx.translate(dx, dy);
    }

    // Draw Bricks
    bricksRef.current.forEach(b => {
      if (!b.active) return;
      ctx.fillStyle = COLORS.bricks[b.value] || '#fff';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 10;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.shadowBlur = 0;
      
      // Bevel effect
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.strokeRect(b.x, b.y, b.w, b.h);
    });

    // Draw Paddle
    ctx.fillStyle = COLORS.paddle;
    ctx.shadowColor = COLORS.paddle;
    ctx.shadowBlur = 15;
    ctx.fillRect(paddleRef.current.x, CANVAS_HEIGHT - 40, paddleRef.current.width, paddleRef.current.height);
    ctx.shadowBlur = 0;

    // Draw Ball
    // Always draw if active or just to show the game state (even in menu/paused)
    ctx.beginPath();
    ctx.arc(ballRef.current.pos.x, ballRef.current.pos.y, ballRef.current.radius, 0, Math.PI * 2);
    ctx.fillStyle = COLORS.ball;
    ctx.fill();
    // Glow
    ctx.shadowColor = COLORS.ball;
    ctx.shadowBlur = 10;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.closePath();

    // Draw Particles
    particlesRef.current.forEach(p => {
      ctx.globalAlpha = p.life;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.pos.x, p.pos.y, 4, 4);
      ctx.globalAlpha = 1.0;
    });

    ctx.restore();
  };

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      onMouseMove={handleMouseMove}
      className="max-w-full rounded-lg shadow-2xl shadow-blue-900/50 cursor-none border border-slate-700 bg-slate-900"
      style={{ touchAction: 'none' }}
    />
  );
};

export default GameCanvas;