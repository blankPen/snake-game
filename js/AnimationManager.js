import { ANIMATION_CONFIG } from './config.js';

/**
 * 动画管理器
 * 负责创建、更新和渲染所有游戏动画
 */
export class AnimationManager {
  constructor() {
    this.animations = [];          // 活跃动画列表
    this.screenShake = {           // 屏幕抖动状态
      active: false,
      offsetX: 0,
      offsetY: 0,
      intensity: 0,
      duration: 0,
      elapsed: 0
    };
    this.scorePopups = [];         // 得分飘字列表
    this.foodAnimation = {         // 食物动画状态
      active: false,
      type: 'appear',              // 'appear' 或 'eaten'
      x: 0,
      y: 0,
      scale: 0,
      opacity: 1,
      duration: 0,
      elapsed: 0
    };
  }

  /**
   * 创建食物出现动画
   * @param {number} x - 食物 x 坐标（网格）
   * @param {number} y - 食物 y 坐标（网格）
   */
  createFoodAppearAnimation(x, y) {
    if (!ANIMATION_CONFIG.ENABLED || !ANIMATION_CONFIG.FOOD_ANIMATION) return;

    this.foodAnimation = {
      active: true,
      type: 'appear',
      x: x,
      y: y,
      scale: 0,
      opacity: 0,
      duration: ANIMATION_CONFIG.FOOD_APPEAR_DURATION,
      elapsed: 0
    };
  }

  /**
   * 创建食物消失动画（被吃掉）
   * @param {number} x - 食物 x 坐标（网格）
   * @param {number} y - 食物 y 坐标（网格）
   */
  createFoodEatenAnimation(x, y) {
    if (!ANIMATION_CONFIG.ENABLED || !ANIMATION_CONFIG.FOOD_ANIMATION) return;

    this.foodAnimation = {
      active: true,
      type: 'eaten',
      x: x,
      y: y,
      scale: 1,
      opacity: 1,
      duration: ANIMATION_CONFIG.FOOD_EATEN_DURATION,
      elapsed: 0
    };
  }

  /**
   * 创建得分飘字动画
   * @param {number} x - 得分显示的 x 坐标
   * @param {number} y - 得分显示的 y 坐标
   */
  createScorePopup(x, y) {
    if (!ANIMATION_CONFIG.ENABLED || !ANIMATION_CONFIG.SCORE_POPUP) return;

    this.scorePopups.push({
      x: x,
      y: y,
      opacity: 1,
      offsetY: 0,
      duration: ANIMATION_CONFIG.SCORE_POPUP_DURATION,
      elapsed: 0
    });
  }

  /**
   * 触发屏幕抖动
   */
  triggerScreenShake() {
    if (!ANIMATION_CONFIG.ENABLED || !ANIMATION_CONFIG.SCREEN_SHAKE) return;

    this.screenShake = {
      active: true,
      offsetX: 0,
      offsetY: 0,
      intensity: ANIMATION_CONFIG.SCREEN_SHAKE_INTENSITY,
      duration: ANIMATION_CONFIG.SCREEN_SHAKE_DURATION,
      elapsed: 0
    };
  }

  /**
   * 更新所有动画
   * @param {number} deltaTime - 距离上一帧的时间（毫秒）
   */
  update(deltaTime) {
    if (!ANIMATION_CONFIG.ENABLED) return;

    // 更新食物动画
    if (this.foodAnimation.active) {
      this.foodAnimation.elapsed += deltaTime;
      const progress = Math.min(this.foodAnimation.elapsed / this.foodAnimation.duration, 1);

      if (this.foodAnimation.type === 'appear') {
        // 出现动画：缩放 + 淡入 (ease-out)
        const eased = this._easeOutBack(progress);
        this.foodAnimation.scale = eased;
        this.foodAnimation.opacity = eased;
      } else {
        // 消失动画：缩放 + 闪烁 (ease-in)
        const eased = this._easeInQuad(progress);
        this.foodAnimation.scale = 1 + eased * (ANIMATION_CONFIG.FOOD_PULSE_SCALE - 1);
        this.foodAnimation.opacity = 1 - eased;
      }

      if (progress >= 1) {
        this.foodAnimation.active = false;
      }
    }

    // 更新屏幕抖动
    if (this.screenShake.active) {
      this.screenShake.elapsed += deltaTime;
      const progress = this.screenShake.elapsed / this.screenShake.duration;

      if (progress >= 1) {
        this.screenShake.active = false;
        this.screenShake.offsetX = 0;
        this.screenShake.offsetY = 0;
      } else {
        // 衰减抖动强度
        const intensity = this.screenShake.intensity * (1 - progress);
        this.screenShake.offsetX = (Math.random() - 0.5) * intensity * 2;
        this.screenShake.offsetY = (Math.random() - 0.5) * intensity * 2;
      }
    }

    // 更新得分飘字
    for (let i = this.scorePopups.length - 1; i >= 0; i--) {
      const popup = this.scorePopups[i];
      popup.elapsed += deltaTime;
      const progress = Math.min(popup.elapsed / popup.duration, 1);

      // 向上飘动并淡出
      popup.offsetY = ANIMATION_CONFIG.SCORE_POPUP_OFFSET * this._easeOutQuad(progress);
      popup.opacity = 1 - progress;

      if (progress >= 1) {
        this.scorePopups.splice(i, 1);
      }
    }
  }

  /**
   * 获取屏幕抖动偏移
   * @returns {Object} { offsetX, offsetY }
   */
  getScreenShakeOffset() {
    if (!this.screenShake.active) {
      return { offsetX: 0, offsetY: 0 };
    }
    return {
      offsetX: this.screenShake.offsetX,
      offsetY: this.screenShake.offsetY
    };
  }

  /**
   * 获取食物动画状态
   * @returns {Object} 食物动画状态
   */
  getFoodAnimation() {
    return this.foodAnimation;
  }

  /**
   * 获取得分飘字列表
   * @returns {Array} 得分飘字数组
   */
  getScorePopups() {
    return this.scorePopups;
  }

  /**
   * 检查是否有活跃的食物动画
   * @returns {boolean}
   */
  hasFoodAnimation() {
    return this.foodAnimation.active;
  }

  /**
   * 清除所有动画
   */
  clear() {
    this.animations = [];
    this.foodAnimation.active = false;
    this.screenShake.active = false;
    this.scorePopups = [];
  }

  // 缓动函数
  _easeOutQuad(t) {
    return t * (2 - t);
  }

  _easeInQuad(t) {
    return t * t;
  }

  _easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }
}
