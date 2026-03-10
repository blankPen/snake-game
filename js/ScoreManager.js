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
    this.stats = {
      gameDuration: 0,      // 游戏时长（毫秒）
      foodEaten: 0,         // 吃到食物数量
      maxLength: 0,         // 蛇的最大长度
      totalMoves: 0,        // 总移动次数
      startTime: 0          // 游戏开始时间
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
   * 开始游戏统计
   */
  startStats() {
    this.stats = {
      gameDuration: 0,
      foodEaten: 0,
      maxLength: 1,
      totalMoves: 0,
      startTime: Date.now()
    };
  }

  /**
   * 增加食物计数
   */
  incrementFoodEaten() {
    this.stats.foodEaten++;
  }

  /**
   * 更新最大长度
   * @param {number} length - 当前长度
   */
  updateMaxLength(length) {
    if (length > this.stats.maxLength) {
      this.stats.maxLength = length;
    }
  }

  /**
   * 增加移动次数
   */
  incrementMoves() {
    this.stats.totalMoves++;
  }

  /**
   * 结束游戏统计
   * @returns {Object} 统计数据对象
   */
  endStats() {
    this.stats.gameDuration = Date.now() - this.stats.startTime;
    return this.getStats();
  }

  /**
   * 获取统计数据
   * @returns {Object} 统计数据副本
   */
  getStats() {
    return { ...this.stats };
  }

  /**
   * 格式化游戏时长
   * @param {number} ms - 毫秒
   * @returns {string} 格式化的时间字符串
   */
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}分${remainingSeconds}秒`;
    }
    return `${seconds}秒`;
  }

  /**
   * 计算平均速度（每秒移动次数）
   * @returns {number} 每秒移动次数
   */
  getAverageSpeed() {
    if (this.stats.gameDuration === 0) return 0;
    return (this.stats.totalMoves / (this.stats.gameDuration / 1000)).toFixed(1);
  }
}
