import { CONFIG } from './config.js';

/**
 * 动画管理器
 * 负责创建、更新和清理游戏动画
 */
export class AnimationManager {
  constructor() {
    this.animations = [];
    this.scorePopups = [];
    this.screenShake = null;
    this.foodAnimations = new Map();
    
    // 缓存配置
    this.config = CONFIG.ANIMATION;
  }

  /**
   * 创建动画
   * @param {string} type - 动画类型
   * @param {Object} options - 动画选项
   * @returns {Object} 创建的动画对象
   */
  create(type, options = {}) {
    const animation = {
      type,
      startTime: performance.now(),
      ...options
    };

    switch (type) {
      case 'food-appear':
        animation.duration = this.config.FOOD_APPEAR_DURATION;
        animation.scale = 0;
        animation.opacity = 0;
        break;
      case 'food-eaten':
        animation.duration = this.config.FOOD_EATEN_DURATION;
        animation.scale = 1;
        animation.opacity = 1;
        break;
      case 'screen-shake':
        animation.duration = this.config.SCREEN_SHAKE_DURATION;
        animation.intensity = this.config.SCREEN_SHAKE_INTENSITY;
        this.screenShake = animation;
        break;
      case 'score-popup':
        animation.duration = this.config.SCREEN_POPUP_DURATION || 1000;
        animation.y = 0;
        animation.opacity = 1;
        this.scorePopups.push(animation);
        return animation;
    }

    this.animations.push(animation);
    return animation;
  }

  /**
   * 为食物创建动画
   * @param {Object} position - 食物位置
   * @param {string} type - 动画类型
   */
  createFoodAnimation(position, type) {
    const key = `${position.x},${position.y}`;
    this.foodAnimations.set(key, {
      type,
      position: { ...position },
      startTime: performance.now(),
      duration: type === 'food-appear' ? this.config.FOOD_APPEAR_DURATION : this.config.FOOD_EATEN_DURATION,
      scale: type === 'food-appear' ? 0 : 1,
      opacity: type === 'food-appear' ? 0 : 1
    });
  }

  /**
   * 触发食物出现动画
   * @param {Object} position - 食物位置
   */
  triggerFoodAppear(position) {
    if (this.config.ENABLED && this.config.FOOD_ANIMATION) {
      this.createFoodAnimation(position, 'food-appear');
    }
  }

  /**
   * 触发食物被吃掉动画
   * @param {Object} position - 食物位置
   */
  triggerFoodEaten(position) {
    if (this.config.ENABLED && this.config.FOOD_ANIMATION) {
      this.createFoodAnimation(position, 'food-eaten');
    }
  }

  /**
   * 触发得分飘字
   * @param {Object} position - 飘字位置
   * @param {number} score - 得分
   */
  triggerScorePopup(position, score) {
    if (this.config.ENABLED && this.config.SCORE_POPUP) {
      this.create('score-popup', {
        position: { ...position },
        score: score
      });
    }
  }

  /**
   * 触发屏幕抖动
   */
  triggerScreenShake() {
    if (this.config.ENABLED && this.config.SCREEN_SHAKE) {
      this.create('screen-shake');
    }
  }

  /**
   * 更新所有动画
   * @param {number} deltaTime - 时间增量
   */
  update(deltaTime) {
    const now = performance.now();

    // 更新食物动画
    for (const [key, anim] of this.foodAnimations) {
      const elapsed = now - anim.startTime;
      const progress = Math.min(elapsed / anim.duration, 1);

      if (anim.type === 'food-appear') {
        // 缩放 + 淡入
        anim.scale = this.easeOutBack(progress);
        anim.opacity = progress;
      } else if (anim.type === 'food-eaten') {
        // 缩放 + 闪烁
        anim.scale = 1 + progress * 0.5;
        anim.opacity = 1 - progress;
      }

      // 移除完成的动画
      if (progress >= 1) {
        this.foodAnimations.delete(key);
      }
    }

    // 更新得分飘字
    this.scorePopups = this.scorePopups.filter(popup => {
      const elapsed = now - popup.startTime;
      const progress = elapsed / popup.duration;
      
      if (progress >= 1) {
        return false;
      }

      // 向上移动 + 淡出
      popup.y = -50 * this.easeOutQuad(progress);
      popup.opacity = 1 - progress;
      return true;
    });

    // 更新屏幕抖动
    if (this.screenShake) {
      const elapsed = now - this.screenShake.startTime;
      if (elapsed >= this.screenShake.duration) {
        this.screenShake = null;
      }
    }

    // 更新其他动画
    this.animations = this.animations.filter(anim => {
      const elapsed = now - anim.startTime;
      return elapsed < anim.duration;
    });
  }

  /**
   * 获取食物动画
   * @param {Object} position - 食物位置
   * @returns {Object|null} 动画对象
   */
  getFoodAnimation(position) {
    const key = `${position.x},${position.y}`;
    return this.foodAnimations.get(key) || null;
  }

  /**
   * 获取屏幕抖动偏移
   * @returns {Object} 偏移量 {x, y}
   */
  getScreenShake() {
    if (!this.screenShake || !this.config.ENABLED || !this.config.SCREEN_SHAKE) {
      return { x: 0, y: 0 };
    }

    const elapsed = performance.now() - this.screenShake.startTime;
    const progress = elapsed / this.screenShake.duration;
    const intensity = this.screenShake.intensity * (1 - progress);

    return {
      x: (Math.random() - 0.5) * intensity * 2,
      y: (Math.random() - 0.5) * intensity * 2
    };
  }

  /**
   * 获取得分飘字列表
   * @returns {Array} 飘字数组
   */
  getScorePopups() {
    return this.scorePopups;
  }

  /**
   * 缓动函数：Ease Out Back
   */
  easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  /**
   * 缓动函数：Ease Out Quad
   */
  easeOutQuad(t) {
    return 1 - (1 - t) * (1 - t);
  }

  /**
   * 清除已完成动画
   */
  cleanup() {
    this.animations = this.animations.filter(anim => {
      const elapsed = performance.now() - anim.startTime;
      return elapsed < anim.duration;
    });
  }

  /**
   * 重置所有动画
   */
  reset() {
    this.animations = [];
    this.scorePopups = [];
    this.screenShake = null;
    this.foodAnimations.clear();
  }

  /**
   * 检查动画是否启用
   * @returns {boolean} 是否启用
   */
  isEnabled() {
    return this.config.ENABLED;
  }
}
