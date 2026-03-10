/**
 * 游戏配置中心
 * 统一管理游戏常量和难度配置
 */

export const CONFIG = {
  // 画布配置
  CANVAS: {
    WIDTH: 600,
    HEIGHT: 600,
    GRID_SIZE: 20  // 每个格子的像素大小
  },

  // 难度配置（速度单位：毫秒/帧）
  DIFFICULTY: {
    easy: {
      speed: 150,
      label: '简单'
    },
    normal: {
      speed: 100,
      label: '普通'
    },
    hard: {
      speed: 60,
      label: '困难'
    }
  },

  // 颜色配置
  COLORS: {
    BACKGROUND: '#1a1a2e',
    SNAKE_HEAD: '#00ff00',
    SNAKE_BODY: '#00cc00',
    SNAKE_TAIL: '#009900',
    FOOD: '#ff4444',
    GRID: '#2a2a4e',
    TEXT: '#ffffff'
  },

  // 蛇的初始配置
  SNAKE: {
    INITIAL_LENGTH: 3,
    INITIAL_DIRECTION: { x: 1, y: 0 }  // 初始向右移动
  },

  // 方向定义
  DIRECTIONS: {
    UP: { x: 0, y: -1 },
    DOWN: { x: 0, y: 1 },
    LEFT: { x: -1, y: 0 },
    RIGHT: { x: 1, y: 0 }
  }
};

// 默认难度
export const DEFAULT_DIFFICULTY = 'normal';

// 本地存储键名
export const STORAGE_KEYS = {
  HIGH_SCORE: 'snake_game_high_score',
  ACHIEVEMENTS: 'snake_game_achievements'
};
