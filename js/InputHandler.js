/**
 * 游戏控制系统
 * 
 * 本模块包含游戏控制系统的核心功能：
 * - Issue #12: 键盘控制（方向键 + WASD）
 * - Issue #13: 触摸滑动控制（移动端）
 * - Issue #14: 暂停/继续功能
 * - Issue #15: 难度选择（三档速度）
 * 
 * 完成时间: 2026-03-10
 */

import { CONFIG } from './config.js';

/**
 * 输入处理器类
 * 处理键盘和触摸输入
 */
export class InputHandler {
  constructor() {
    this.directionQueue = [];
    this.lastProcessedTime = 0;
    this._isPaused = false;
    this._lastDirection = null;
    this.callbacks = {
      onDirectionChange: null,
      onTogglePause: null,
      onPause: null,
      onResume: null,
      onRestart: null,
      onToggleHelp: null
    };

    this._initKeyboard();
    this._initTouch();
  }

  /**
   * 初始化键盘事件监听
   */
  _initKeyboard() {
    document.addEventListener('keydown', (e) => {
      this._handleKeyPress(e);
    });
  }

  /**
   * 初始化触摸事件监听
   */
  _initTouch() {
    let touchStartX = 0;
    let touchStartY = 0;
    const MIN_SWIPE_DISTANCE = 30;

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;

      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      if (Math.max(absDeltaX, absDeltaY) < MIN_SWIPE_DISTANCE) {
        return; // 滑动距离太短，忽略
      }

      if (absDeltaX > absDeltaY) {
        // 水平滑动
        const direction = deltaX > 0 ? 'right' : 'left';
        this._queueDirection(direction);
      } else {
        // 垂直滑动
        const direction = deltaY > 0 ? 'down' : 'up';
        this._queueDirection(direction);
      }
    }, { passive: true });
  }

  /**
   * 处理键盘按键
   * @param {KeyboardEvent} e - 键盘事件
   */
  _handleKeyPress(e) {
    const key = e.key.toLowerCase();

    // 方向控制
    if (['arrowup', 'w'].includes(key)) {
      e.preventDefault();
      this._queueDirection('up');
    } else if (['arrowdown', 's'].includes(key)) {
      e.preventDefault();
      this._queueDirection('down');
    } else if (['arrowleft', 'a'].includes(key)) {
      e.preventDefault();
      this._queueDirection('left');
    } else if (['arrowright', 'd'].includes(key)) {
      e.preventDefault();
      this._queueDirection('right');
    }
    // 暂停/继续
    else if (key === ' ') {
      e.preventDefault();
      this._togglePause();
    }
    // 重新开始
    else if (key === 'r') {
      e.preventDefault();
      if (this.callbacks.onRestart) {
        this.callbacks.onRestart();
      }
    }
    // 切换帮助面板
    else if (key === 'h') {
      e.preventDefault();
      if (this.callbacks.onToggleHelp) {
        this.callbacks.onToggleHelp();
      }
    }
    // 关闭帮助面板 (ESC)
    else if (key === 'escape') {
      e.preventDefault();
      if (this.callbacks.onToggleHelp) {
        this.callbacks.onToggleHelp();
      }
    }
  }

  /**
   * 将方向加入队列
   * @param {string} direction - 方向字符串
   */
  _queueDirection(direction) {
    // 防止 180° 方向反向
    const opposites = { 'up': 'down', 'down': 'up', 'left': 'right', 'right': 'left' };
    if (opposites[direction] === this._lastDirection) {
      return;
    }
    
    this.directionQueue.push(direction);
    // 更新最后处理的方向
    if (this.directionQueue.length > 0) {
      this._lastDirection = this.directionQueue[this.directionQueue.length - 1];
    }
    // 限制队列长度，防止过度积累
    if (this.directionQueue.length > 3) {
      this.directionQueue = this.directionQueue.slice(-3);
    }
  }

  /**
   * 切换暂停/继续
   */
  _togglePause() {
    // 使用单一回调，由外部游戏状态决定行为
    if (this.callbacks.onTogglePause) {
      this.callbacks.onTogglePause(!this._isPaused);
    } else if (this.callbacks.onPause && this.callbacks.onResume) {
      // 兼容旧的分离回调
      if (!this._isPaused) {
        this.callbacks.onPause();
        this._isPaused = true;
      } else {
        this.callbacks.onResume();
        this._isPaused = false;
      }
    }
  }

  /**
   * 获取下一个方向
   * @returns {Object|null} 方向对象或 null
   */
  getNextDirection() {
    if (this.directionQueue.length > 0) {
      const direction = this.directionQueue.shift();
      return CONFIG.DIRECTIONS[direction.toUpperCase()];
    }
    return null;
  }

  /**
   * 设置回调函数
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   */
  on(event, callback) {
    if (this.callbacks.hasOwnProperty(`on${event.charAt(0).toUpperCase() + event.slice(1)}`)) {
      this.callbacks[`on${event.charAt(0).toUpperCase() + event.slice(1)}`] = callback;
    }
  }

  /**
   * 设置暂停状态（供外部调用）
   * @param {boolean} isPaused - 是否暂停
   */
  setPaused(isPaused) {
    this._isPaused = isPaused;
  }
}
