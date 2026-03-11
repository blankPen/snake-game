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

    // 游戏统计数据
    this.gameStats = {
      duration: 0,           // 游戏时长（毫秒）
      foodEaten: 0,           // 吃到食物数量
      maxLength: 0,           // 蛇的最大长度
      avgSpeed: 0,            // 平均移动速度（次/秒）
      totalMoves: 0           // 总操作次数
    };
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

  // ==================== 游戏统计功能 ====================

  /**
   * 记录吃到食物
   */
  recordFoodEaten() {
    this.gameStats.foodEaten++;
  }

  /**
   * 更新最大长度
   * @param {number} currentLength - 当前蛇身长度
   */
  updateMaxLength(currentLength) {
    if (currentLength > this.gameStats.maxLength) {
      this.gameStats.maxLength = currentLength;
    }
  }

  /**
   * 记录一次操作
   */
  recordMove() {
    this.gameStats.totalMoves++;
  }

  /**
   * 设置游戏开始时间
   * @param {number} startTime - 开始时间戳
   */
  setStartTime(startTime) {
    this.gameStats.startTime = startTime;
  }

  /**
   * 设置游戏时长
   * @param {number} duration - 游戏时长（毫秒）
   */
  setDuration(duration) {
    this.gameStats.duration = duration;
  }

  /**
   * 计算平均速度
   * @param {number} duration - 游戏时长（毫秒）
   */
  calculateAvgSpeed(duration) {
    if (duration > 0) {
      // 速度 = 总移动次数 / 时长（秒）
      this.gameStats.avgSpeed = (this.gameStats.totalMoves / (duration / 1000)).toFixed(2);
    }
  }

  /**
   * 获取游戏统计数据
   * @returns {Object} 统计数据对象
   */
  getGameStats() {
    return {
      duration: this.gameStats.duration,
      foodEaten: this.gameStats.foodEaten,
      maxLength: this.gameStats.maxLength,
      avgSpeed: parseFloat(this.gameStats.avgSpeed) || 0,
      totalMoves: this.gameStats.totalMoves
    };
  }

  /**
   * 重置游戏统计数据
   */
  resetGameStats() {
    this.gameStats = {
      duration: 0,
      foodEaten: 0,
      maxLength: 0,
      avgSpeed: 0,
      totalMoves: 0
    };
  }
}
