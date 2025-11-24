export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const PADDLE_WIDTH = 100;
export const PADDLE_HEIGHT = 20;
export const PADDLE_SPEED = 7;
export const BALL_RADIUS = 8;
export const BALL_SPEED = 6;

export const BRICK_ROWS = 10;
export const BRICK_COLS = 12;
export const BRICK_GAP = 8;
// Brick width is calculated dynamically based on canvas width

export const COLORS = {
  background: '#0f172a', // Slate 900
  paddle: '#38bdf8',     // Sky 400
  ball: '#ffffff',
  text: '#f8fafc',
  bricks: [
    'transparent', // 0
    '#ef4444',     // 1 - Red (Weakest)
    '#f97316',     // 2 - Orange
    '#eab308',     // 3 - Yellow
    '#22c55e',     // 4 - Green
    '#3b82f6',     // 5 - Blue
    '#a855f7',     // 6 - Purple (Strongest)
  ]
};

export const DEFAULT_LEVEL_PROMPT = "A classic pyramid structure with strong bricks at the top.";