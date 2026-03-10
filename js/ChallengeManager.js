/**
 * 挑战管理器
 * 管理挑战进度、历史记录和持久化
 */

import { DailyChallenge, CHALLENGE_TYPES } from './DailyChallenge.js';
import { STORAGE_KEYS } from './config.js';

/**
 * 挑战管理器类
 * 负责管理每日挑战的进度和历史记录
 */
export class ChallengeManager {
  constructor() {
    this.todayChallenge = null;
    this.currentProgress = {
      score: 0,
      timeElapsed: 0,
      livesUsed: 1,
      isActive: false,
      startTime: null
    };
    this.history = this._loadHistory();
    this.rewardManager = null;
  }

  /**
   * 初始化挑战管理器
   */
  init() {
    this._loadTodayChallenge();
  }

  /**
   * 加载今日挑战
   */
  _loadTodayChallenge() {
    const today = new Date();
    this.todayChallenge = new DailyChallenge(today);
  }

  /**
   * 获取今日挑战
   * @returns {DailyChallenge} 今日挑战对象
   */
  getTodayChallenge() {
    if (!this.todayChallenge || this.todayChallenge.isExpired()) {
      this._loadTodayChallenge();
    }
    return this.todayChallenge;
  }

  /**
   * 开始挑战
   * @param {Object} game - 游戏实例
   */
  startChallenge(game) {
    this.currentProgress = {
      score: 0,
      timeElapsed: 0,
      livesUsed: 1,
      isActive: true,
      startTime: Date.now()
    };
    
    // 应用特殊规则
    const challenge = this.getTodayChallenge();
    if (challenge.challenge.rules && challenge.challenge.rules.length > 0) {
      this._applyRules(challenge.challenge.rules, game);
    }
  }

  /**
   * 应用特殊规则到游戏
   * @param {Array} rules - 规则数组
   * @param {Object} game - 游戏实例
   */
  _applyRules(rules, game) {
    rules.forEach(rule => {
      switch (rule) {
        case 'reverse_controls':
          if (game.inputHandler) {
            game.inputHandler.setReverseControls(true);
          }
          break;
        case 'no_pause':
          // 在 Game 类中处理
          game.setAllowPause(false);
          break;
        case 'fast_mode':
          if (game.scoreManager) {
            game.setDifficulty('hard');
          }
          break;
        case 'small_grid':
          // 可以修改画布大小或格子大小
          break;
        case 'double_points':
          if (game.scoreManager) {
            game.scoreManager.setFoodValue(20);
          }
          break;
      }
    });
  }

  /**
   * 更新挑战进度
   * @param {number} score - 当前分数
   * @param {number} timeElapsed - 耗时（秒）
   * @param {number} livesUsed - 使用的生命数
   */
  updateProgress(score, timeElapsed = 0, livesUsed = 1) {
    if (!this.currentProgress.isActive) return;
    
    this.currentProgress.score = score;
    this.currentProgress.timeElapsed = timeElapsed;
    this.currentProgress.livesUsed = livesUsed;
  }

  /**
   * 结束挑战
   * @returns {Object} 挑战结果
   */
  endChallenge() {
    if (!this.currentProgress.isActive) return null;
    
    const challenge = this.getTodayChallenge();
    const result = challenge.validate(
      this.currentProgress.score,
      this.currentProgress.timeElapsed,
      this.currentProgress.livesUsed
    );
    
    // 保存到历史记录
    this._saveResult(result);
    
    // 重置进度
    this.currentProgress.isActive = false;
    
    return result;
  }

  /**
   * 获取当前进度
   * @returns {Object} 当前进度
   */
  getProgress() {
    return { ...this.currentProgress };
  }

  /**
   * 获取挑战进度百分比
   * @returns {number} 进度百分比 (0-100)
   */
  getProgressPercent() {
    if (!this.currentProgress.isActive) return 0;
    
    const challenge = this.getTodayChallenge();
    const targetScore = challenge.challenge.targetScore;
    const currentScore = this.currentProgress.score;
    
    return Math.min(100, Math.round((currentScore / targetScore) * 100));
  }

  /**
   * 检查挑战是否进行中
   * @returns {boolean} 是否进行中
   */
  isActive() {
    return this.currentProgress.isActive;
  }

  /**
   * 保存挑战结果到历史记录
   * @param {Object} result - 挑战结果
   */
  _saveResult(result) {
    const today = new Date().toISOString().split('T')[0];
    
    const historyEntry = {
      date: today,
      type: result.type,
      score: result.score,
      targetScore: result.targetScore,
      stars: result.stars,
      completed: result.completed,
      timeElapsed: result.timeElapsed
    };
    
    // 更新或添加今日记录
    const existingIndex = this.history.findIndex(h => h.date === today);
    if (existingIndex >= 0) {
      // 只保留更好的成绩
      if (result.stars > this.history[existingIndex].stars) {
        this.history[existingIndex] = historyEntry;
      }
    } else {
      this.history.push(historyEntry);
    }
    
    // 限制历史记录数量（保留最近 30 天）
    if (this.history.length > 30) {
      this.history = this.history.slice(-30);
    }
    
    // 保存到本地存储
    this._saveHistory();
  }

  /**
   * 从本地存储加载历史记录
   * @returns {Array} 历史记录数组
   */
  _loadHistory() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHALLENGE_HISTORY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load challenge history:', e);
      return [];
    }
  }

  /**
   * 保存历史记录到本地存储
   */
  _saveHistory() {
    try {
      localStorage.setItem(
        STORAGE_KEYS.CHALLENGE_HISTORY, 
        JSON.stringify(this.history)
      );
    } catch (e) {
      console.error('Failed to save challenge history:', e);
    }
  }

  /**
   * 获取挑战历史记录
   * @param {number} limit - 返回记录数限制
   * @returns {Array} 历史记录数组
   */
  getHistory(limit = 30) {
    return this.history.slice(-limit);
  }

  /**
   * 获取连续完成挑战的天数
   * @returns {number} 连续天数
   */
  getStreak() {
    if (this.history.length === 0) return 0;
    
    let streak = 0;
    const sortedHistory = [...this.history].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
    
    for (const entry of sortedHistory) {
      if (entry.completed) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  /**
   * 获取总获得星星数
   * @returns {number} 总星星数
   */
  getTotalStars() {
    return this.history.reduce((total, entry) => total + entry.stars, 0);
  }

  /**
   * 获取今日挑战状态
   * @returns {Object} 今日挑战状态
   */
  getTodayStatus() {
    const today = new Date().toISOString().split('T')[0];
    const todayRecord = this.history.find(h => h.date === today);
    
    return {
      date: today,
      hasPlayed: !!todayRecord,
      completed: todayRecord ? todayRecord.completed : false,
      stars: todayRecord ? todayRecord.stars : 0,
      score: todayRecord ? todayRecord.score : 0
    };
  }

  /**
   * 设置奖励管理器
   * @param {RewardSystem} rewardManager - 奖励管理器实例
   */
  setRewardManager(rewardManager) {
    this.rewardManager = rewardManager;
  }

  /**
   * 发放挑战奖励
   * @param {Object} result - 挑战结果
   */
  grantRewards(result) {
    if (this.rewardManager && result.completed) {
      const streak = this.getStreak();
      this.rewardManager.grantChallengeReward(result.stars, streak);
    }
  }
}

// 默认导出
export default ChallengeManager;

// 在 config.js 中添加存储键名
// STORAGE_KEYS.CHALLENGE_HISTORY = 'snake_game_challenge_history';
