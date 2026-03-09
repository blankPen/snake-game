import { CONFIG, DEFAULT_DIFFICULTY, STORAGE_KEYS } from './config.js';

/**
 * 分数和难度管理器
 * 处理分数统计、最高分记录和难度切换
 */
export class ScoreManager {
  constructor() {
    this.currentScore = 0;
    this.highScore = this._loadHighScore();
    this.currentDifficulty = DEFAULT_DIFFICULTY;
    this.foodValue = 10; // 每个食物的分数
  }

  /**
   * 从本地存储加载最高分
   * @returns {number} 最高分
   */
  _loadHighScore() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HIGH_SCORE);
      return saved ? parseInt(saved, 10) : 0;
    } catch (e) {
      console.error('Failed to load high score:', e);
      return 0;
    }
  }

  /**
   * 保存最高分到本地存储
   */
  _saveHighScore() {
    try {
      localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, this.highScore.toString());
    } catch (e) {
      console.error('Failed to save high score:', e);
    }
  }

  /**
   * 增加分数（吃食物）
   */
  addScore() {
    this.currentScore += this.foodValue;

    // 检查是否刷新最高分
    if (this.currentScore > this.highScore) {
      this.highScore = this.currentScore;
      this._saveHighScore();
    }
  }

  /**
   * 获取当前分数
   * @returns {number} 当前分数
   */
  getScore() {
    return this.currentScore;
  }

  /**
   * 获取最高分
   * @returns {number} 最高分
   */
  getHighScore() {
    return this.highScore;
  }

  /**
   * 重置分数
   */
  resetScore() {
    this.currentScore = 0;
  }

  /**
   * 设置难度
   * @param {string} difficulty - 难度名称 ('easy' | 'normal' | 'hard')
   * @returns {boolean} 是否设置成功
   */
  setDifficulty(difficulty) {
    if (CONFIG.DIFFICULTY.hasOwnProperty(difficulty)) {
      this.currentDifficulty = difficulty;
      return true;
    }
    return false;
  }

  /**
   * 获取当前难度配置
   * @returns {Object} 难度配置对象
   */
  getDifficultyConfig() {
    return CONFIG.DIFFICULTY[this.currentDifficulty];
  }

  /**
   * 获取当前难度名称
   * @returns {string} 难度名称
   */
  getDifficulty() {
    return this.currentDifficulty;
  }

  /**
   * 获取所有可用难度
   * @returns {Array} 难度数组
   */
  getAvailableDifficulties() {
    return Object.keys(CONFIG.DIFFICULTY);
  }

  /**
   * 设置食物分数值
   * @param {number} value - 食物分数值
   */
  setFoodValue(value) {
    this.foodValue = value;
  }

  /**
   * 获取食物分数值
   * @returns {number} 食物分数值
   */
  getFoodValue() {
    return this.foodValue;
  }
}
