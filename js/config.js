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

  // 速度渐变系统配置
  SPEED_SYSTEM: {
    FOODS_PER_LEVEL: 3,    // 每吃 N 个食物升一级
    MIN_INTERVAL: 30,      // 最小速度上限（毫秒）
    SPEED_STEP: 5,         // 每级速度提升步长（毫秒）
    MAX_LEVEL: 10          // 最大等级
  }
};

// 默认难度
export const DEFAULT_DIFFICULTY = 'normal';

// 本地存储键名
export const STORAGE_KEYS = {
  HIGH_SCORE: 'snake_game_high_score'
};

// 动画配置
export const ANIMATION_CONFIG = {
  ENABLED: true,
  SMOOTH_MOVEMENT: true,           // 蛇移动平滑插值
  FOOD_ANIMATION: true,            // 食物动画
  SCORE_POPUP: true,               // 得分飘字
  SCREEN_SHAKE: true,              // 屏幕抖动
  // 时间配置（毫秒）
  FOOD_APPEAR_DURATION: 300,
  FOOD_EATEN_DURATION: 200,
  SCORE_POPUP_DURATION: 1000,
  SCORE_POPUP_OFFSET: 50,          // 得分飘字上升距离
  SCREEN_SHAKE_DURATION: 500,
  SCREEN_SHAKE_INTENSITY: 10,
  FOOD_PULSE_SCALE: 1.5            // 食物脉冲缩放比例
};
