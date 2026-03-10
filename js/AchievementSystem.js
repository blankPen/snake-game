/**
 * 成就系统
 * 管理游戏成就、解锁和展示
 */

import { STORAGE_KEYS } from './config.js';

/**
 * 成就定义
 */
export const ACHIEVEMENTS = {
  // 首次开始游戏
  beginner: {
    id: 'beginner',
    name: '初学者',
    description: '首次开始游戏',
    scoreReward: 10,
    icon: '🎮'
  },
  // 获得 100 分
  novice: {
    id: 'novice',
    name: '小试牛刀',
    description: '获得 100 分',
    scoreReward: 50,
    icon: '⭐'
  },
  // 获得 500 分
  glutton: {
    id: 'glutton',
    name: '贪吃蛇',
    description: '获得 500 分',
    scoreReward: 100,
    icon: '🐍'
  },
  // 获得 1000 分
  master: {
    id: 'master',
    name: '高手',
    description: '获得 1000 分',
    scoreReward: 200,
    icon: '🏆'
  },
  // 连续游戏 5 分钟
  endurance: {
    id: 'endurance',
    name: '无尽模式',
    description: '连续游戏 5 分钟',
    scoreReward: 150,
    icon: '⏱️'
  },
  // 一局游戏吃 20 个食物
  survivor: {
    id: 'survivor',
    name: '不死蛇',
    description: '一局游戏吃 20 个食物',
    scoreReward: 100,
    icon: '🛡️'
  },
  // 获得 5000 分
  legend: {
    id: 'legend',
    name: '传奇',
    description: '获得 5000 分',
    scoreReward: 500,
    icon: '👑'
  }
};

/**
 * 成就管理器
 */
export class AchievementSystem {
  constructor() {
    this.achievements = ACHIEVEMENTS;
    this.unlockedAchievements = this._loadAchievements();
    this.achievementCallbacks = [];
    this.gameStats = {
      totalPlayTime: 0,
      totalScore: 0,
      maxFoodInOneGame: 0,
      currentFoodInGame: 0,
      gameStartTime: 0
    };
  }

  /**
   * 从 localStorage 加载成就数据
   * @returns {Object} 已解锁的成就
   */
  _loadAchievements() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load achievements:', e);
      return [];
    }
  }

  /**
   * 保存成就数据到 localStorage
   */
  _saveAchievements() {
    try {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(this.unlockedAchievements));
    } catch (e) {
      console.error('Failed to save achievements:', e);
    }
  }

  /**
   * 开始新游戏时重置统计
   */
  startNewGame() {
    this.gameStats.currentFoodInGame = 0;
    this.gameStats.gameStartTime = Date.now();
    this.gameStats.maxFoodInOneGame = 0;
  }

  /**
   * 增加分数时检查成就
   * @param {number} score - 当前分数
   */
  checkScoreAchievements(score) {
    this.gameStats.totalScore = Math.max(this.gameStats.totalScore, score);

    const scoreAchievements = ['beginner', 'novice', 'glutton', 'master', 'legend'];
    
    if (score >= 10 && !this.hasAchievement('beginner')) {
      this._unlockAchievement('beginner');
    }
    if (score >= 100 && !this.hasAchievement('novice')) {
      this._unlockAchievement('novice');
    }
    if (score >= 500 && !this.hasAchievement('glutton')) {
      this._unlockAchievement('glutton');
    }
    if (score >= 1000 && !this.hasAchievement('master')) {
      this._unlockAchievement('master');
    }
    if (score >= 5000 && !this.hasAchievement('legend')) {
      this._unlockAchievement('legend');
    }
  }

  /**
   * 吃食物时检查成就
   */
  checkFoodAchievements() {
    this.gameStats.currentFoodInGame++;
    this.gameStats.maxFoodInOneGame = Math.max(
      this.gameStats.maxFoodInOneGame,
      this.gameStats.currentFoodInGame
    );

    if (this.gameStats.currentFoodInGame >= 20 && !this.hasAchievement('survivor')) {
      this._unlockAchievement('survivor');
    }
  }

  /**
   * 检查游戏时间成就
   * @param {number} playTime - 游戏已进行时间（毫秒）
   */
  checkTimeAchievements(playTime) {
    this.gameStats.totalPlayTime += playTime;

    const minutes = playTime / 60000;
    if (minutes >= 5 && !this.hasAchievement('endurance')) {
      this._unlockAchievement('endurance');
    }
  }

  /**
   * 解锁成就
   * @param {string} achievementId - 成就 ID
   */
  _unlockAchievement(achievementId) {
    if (this.hasAchievement(achievementId)) {
      return;
    }

    const achievement = this.achievements[achievementId];
    if (!achievement) {
      return;
    }

    this.unlockedAchievements.push(achievementId);
    this._saveAchievements();

    // 触发成就解锁回调
    this.achievementCallbacks.forEach(callback => {
      callback(achievement);
    });

    console.log(`Achievement unlocked: ${achievement.name}`);
  }

  /**
   * 检查是否已解锁成就
   * @param {string} achievementId - 成就 ID
   * @returns {boolean}
   */
  hasAchievement(achievementId) {
    return this.unlockedAchievements.includes(achievementId);
  }

  /**
   * 获取所有已解锁成就
   * @returns {Array}
   */
  getUnlockedAchievements() {
    return this.unlockedAchievements.map(id => ({
      ...this.achievements[id],
      unlocked: true
    }));
  }

  /**
   * 获取所有成就（包括未解锁的）
   * @returns {Array}
   */
  getAllAchievements() {
    return Object.values(this.achievements).map(achievement => ({
      ...achievement,
      unlocked: this.hasAchievement(achievement.id)
    }));
  }

  /**
   * 获取成就解锁进度
   * @returns {Object}
   */
  getProgress() {
    const total = Object.keys(this.achievements).length;
    const unlocked = this.unlockedAchievements.length;
    return {
      total,
      unlocked,
      percentage: Math.round((unlocked / total) * 100)
    };
  }

  /**
   * 注册成就解锁回调
   * @param {Function} callback - 回调函数
   */
  onAchievementUnlock(callback) {
    this.achievementCallbacks.push(callback);
  }

  /**
   * 移除成就解锁回调
   * @param {Function} callback - 回调函数
   */
  offAchievementUnlock(callback) {
    const index = this.achievementCallbacks.indexOf(callback);
    if (index !== -1) {
      this.achievementCallbacks.splice(index, 1);
    }
  }

  /**
   * 重置所有成就
   */
  reset() {
    this.unlockedAchievements = [];
    this._saveAchievements();
    this.gameStats = {
      totalPlayTime: 0,
      totalScore: 0,
      maxFoodInOneGame: 0,
      currentFoodInGame: 0,
      gameStartTime: 0
    };
  }
}
