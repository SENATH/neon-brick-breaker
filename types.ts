export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
  PAUSED = 'PAUSED',
}

export interface Vector2D {
  x: number;
  y: number;
}

export interface Ball {
  pos: Vector2D;
  vel: Vector2D;
  radius: number;
  active: boolean;
}

export interface Paddle {
  x: number;
  width: number;
  height: number;
}

export interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  value: number; // 0 = empty, 1-5 = strength/color
  active: boolean;
}

export interface GameConfig {
  lives: number;
  score: number;
  level: number;
}

export interface GeneratedLevelResponse {
  layout: number[][]; // 2D grid of brick values
  themeName: string;
  difficulty: string;
}
