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
  },

  // 道具配置
  POWERUP: {
    SPAWN_INTERVAL: 10000,  // 道具生成间隔（毫秒）
    LIFE_TIME: 8000,         // 道具存活时间（毫秒）
    EFFECT_DURATION: {
      speed_up: 5000,        // 加速持续时间
      speed_down: 5000,      // 减速持续时间
      invincible: 5000,      // 无敌持续时间
      double_score: 8000,   // 双倍分数持续时间
      ghost: 6000            // 幽灵模式持续时间
    },
    COLORS: {
      speed_up: '#ffaa00',    // 加速道具颜色（橙色）
      speed_down: '#00aaff',  // 减速道具颜色（蓝色）
      invincible: '#ff00ff', // 无敌道具颜色（紫色）
      double_score: '#ffdd00', // 双倍分数颜色（金色）
      ghost: '#aa00ff'       // 幽灵模式颜色（深紫色）
    },
    SYMBOLS: {
      speed_up: '⚡',
      speed_down: '🐢',
      invincible: '🛡️',
      double_score: '✖️2',
      ghost: '👻'
    }
  }
};

// 默认难度
export const DEFAULT_DIFFICULTY = 'normal';

// 本地存储键名
export const STORAGE_KEYS = {
  HIGH_SCORE: 'snake_game_high_score'
};
