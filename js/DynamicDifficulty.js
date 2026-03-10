/**
 * 动态难度调整系统
 * 根据游戏进度自动调整难度
 */

import { CONFIG } from './config.js';

/**
 * 难度调整策略
 */
export const DifficultyStrategy = {
  // 基于分数的固定阈值
  SCORE_BASED: 'score_based',
  // 渐进式加速
  PROGRESSIVE: 'progressive'
};

/**
 * 动态难度调整器
 */
export class DynamicDifficulty {
  constructor(options = {}) {
    // 当前难度配置
    this.baseDifficulty = options.difficulty || 'normal';
    this.baseSpeed = CONFIG.DIFFICULTY[this.baseDifficulty].speed;
    
    // 动态调整配置
    this.strategy = options.strategy || DifficultyStrategy.SCORE_BASED;
    this.speedIncreaseRate = options.speedIncreaseRate || 0.05; // 每 100 分速度增加 5%
    this.maxSpeedMultiplier = options.maxSpeedMultiplier || 2.0; // 最大速度为初始的 2 倍
    
    // 渐进式加速配置
    this.foodSpeedIncrease = options.foodSpeedIncrease || 0.01; // 每吃一个食物速度增加 1%
    
    // 当前状态
    this.currentScore = 0;
    this.foodsEaten = 0;
    this.currentSpeed = this.baseSpeed;
    
    // 缓存计算结果
    this._cachedSpeed = this.baseSpeed;
  }

  /**
   * 重置难度到初始状态
   */
  reset() {
    this.currentScore = 0;
    this.foodsEaten = 0;
    this.currentSpeed = this.baseSpeed;
    this._cachedSpeed = this.baseSpeed;
  }

  /**
   * 设置基础难度
   * @param {string} difficulty - 难度名称
   */
  setDifficulty(difficulty) {
    if (CONFIG.DIFFICULTY.hasOwnProperty(difficulty)) {
      this.baseDifficulty = difficulty;
      this.baseSpeed = CONFIG.DIFFICULTY[difficulty].speed;
      this.reset();
    }
  }

  /**
   * 获取当前难度
   * @returns {string}
   */
  getDifficulty() {
    return this.baseDifficulty;
  }

  /**
   * 更新分数并调整难度
   * @param {number} score - 当前分数
   */
  updateScore(score) {
    this.currentScore = score;
    this._updateSpeed();
  }

  /**
   * 吃食物后更新难度
   */
  onFoodEaten() {
    this.foodsEaten++;
    this._updateSpeed();
  }

  /**
   * 根据策略更新速度
   */
  _updateSpeed() {
    switch (this.strategy) {
      case DifficultyStrategy.SCORE_BASED:
        this._updateByScore();
        break;
      case DifficultyStrategy.PROGRESSIVE:
        this._updateProgressive();
        break;
      default:
        this._updateByScore();
    }
  }

  /**
   * 基于分数的速度调整
   * 每得 100 分，速度提升 speedIncreaseRate
   */
  _updateByScore() {
    const scoreMultiplier = 1 + Math.floor(this.currentScore / 100) * this.speedIncreaseRate;
    const speedMultiplier = Math.min(scoreMultiplier, this.maxSpeedMultiplier);
    this._cachedSpeed = Math.max(this.baseSpeed / speedMultiplier, this.baseSpeed / this.maxSpeedMultiplier);
    this.currentSpeed = this._cachedSpeed;
  }

  /**
   * 渐进式加速
   * 每吃一个食物，速度略微增加
   */
  _updateProgressive() {
    const speedMultiplier = 1 + this.foodsEaten * this.foodSpeedIncrease;
    const cappedMultiplier = Math.min(speedMultiplier, this.maxSpeedMultiplier);
    this._cachedSpeed = this.baseSpeed / cappedMultiplier;
    this.currentSpeed = this._cachedSpeed;
  }

  /**
   * 获取当前速度
   * @returns {number} 速度（毫秒/帧）
   */
  getSpeed() {
    return this.currentSpeed;
  }

  /**
   * 获取速度百分比（相对于初始速度）
   * @returns {number} 百分比
   */
  getSpeedPercentage() {
    return Math.round((1 - this.currentSpeed / this.baseSpeed) * 100);
  }

  /**
   * 获取难度等级描述
   * @returns {string}
   */
  getDifficultyDescription() {
    const percentage = this.getSpeedPercentage();
    if (percentage < 10) return '简单';
    if (percentage < 30) return '适中';
    if (percentage < 50) return '困难';
    return '极难';
  }

  /**
   * 获取统计信息
   * @returns {Object}
   */
  getStats() {
    return {
      baseDifficulty: this.baseDifficulty,
      baseSpeed: this.baseSpeed,
      currentSpeed: this.currentSpeed,
      speedPercentage: this.getSpeedPercentage(),
      currentScore: this.currentScore,
      foodsEaten: this.foodsEaten,
      difficultyDescription: this.getDifficultyDescription(),
      strategy: this.strategy
    };
  }

  /**
   * 设置调整策略
   * @param {string} strategy - 策略名称
   */
  setStrategy(strategy) {
    if (Object.values(DifficultyStrategy).includes(strategy)) {
      this.strategy = strategy;
      this._updateSpeed();
    }
  }

  /**
   * 设置速度增加率
   * @param {number} rate - 增加率
   */
  setSpeedIncreaseRate(rate) {
    this.speedIncreaseRate = rate;
    this._updateSpeed();
  }

  /**
   * 设置最大速度倍数
   * @param {number} multiplier - 最大倍数
   */
  setMaxSpeedMultiplier(multiplier) {
    this.maxSpeedMultiplier = multiplier;
    this._updateSpeed();
  }
}
