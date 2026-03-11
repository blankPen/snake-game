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
    this.foodEaten = 0;  // 吃到的食物数量（用于计算速度等级）
    this.speedLevel = 0; // 当前速度等级
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

  /**
   * 吃到食物时调用，计算新等级
   */
  onFoodEaten() {
    this.foodEaten++;
    
    // 计算速度等级：每 FOODS_PER_LEVEL 个食物升一级
    const maxLevel = CONFIG.SPEED_SYSTEM.MAX_LEVEL;
    const foodsPerLevel = CONFIG.SPEED_SYSTEM.FOODS_PER_LEVEL;
    
    this.speedLevel = Math.min(
      Math.floor(this.foodEaten / foodsPerLevel),
      maxLevel
    );
  }

  /**
   * 获取当前速度等级
   * @returns {number} 速度等级
   */
  getSpeedLevel() {
    return this.speedLevel;
  }

  /**
   * 获取最大速度等级
   * @returns {number} 最大等级
   */
  getMaxSpeedLevel() {
    return CONFIG.SPEED_SYSTEM.MAX_LEVEL;
  }

  /**
   * 获取当前速度间隔（毫秒）
   * @returns {number} 速度间隔
   */
  getCurrentInterval() {
    const baseInterval = this.getDifficultyConfig().speed;
    const step = CONFIG.SPEED_SYSTEM.SPEED_STEP;
    const minInterval = CONFIG.SPEED_SYSTEM.MIN_INTERVAL;
    
    // interval = baseInterval - (level * step)
    const interval = baseInterval - (this.speedLevel * step);
    
    // 确保不超过最小速度上限
    return Math.max(interval, minInterval);
  }

  /**
   * 获取当前速度百分比（用于UI显示）
   * @returns {number} 0-100 的百分比
   */
  getSpeedPercentage() {
    return Math.round((this.speedLevel / CONFIG.SPEED_SYSTEM.MAX_LEVEL) * 100);
  }

  /**
   * 重置分数和速度等级
   */
  resetScore() {
    this.currentScore = 0;
    this.foodEaten = 0;
    this.speedLevel = 0;
  }
}
