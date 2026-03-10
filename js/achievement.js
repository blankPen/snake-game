import { STORAGE_KEYS } from './config.js';

/**
 * 成就系统
 * 管理成就定义、检测、解锁和存储
 */
export class AchievementSystem {
  constructor() {
    this.achievements = this._defineAchievements();
    this.gameStats = this._loadGameStats();
    this.unlockedAchievements = this._loadUnlockedAchievements();
    this.foodsEatenInStreak = 0; // 当前连续吃食物数量
    this.gameStartTime = 0; // 游戏开始时间
  }

  /**
   * 定义所有成就
   */
  _defineAchievements() {
    return [
      {
        id: 'first_game',
        name: '初体验',
        description: '完成你的第一场游戏',
        icon: '🎮',
        condition: (stats) => stats.totalGames >= 1,
        unlocked: false
      },
      {
        id: 'games_10',
        name: '熟能生巧',
        description: '完成10场游戏',
        icon: '🎯',
        condition: (stats) => stats.totalGames >= 10,
        unlocked: false
      },
      {
        id: 'games_50',
        name: '蛇王养成',
        description: '完成50场游戏',
        icon: '👑',
        condition: (stats) => stats.totalGames >= 50,
        unlocked: false
      },
      {
        id: 'score_100',
        name: '小试牛刀',
        description: '单局得分超过100分',
        icon: '⭐',
        condition: (stats) => stats.highestScore >= 100,
        unlocked: false
      },
      {
        id: 'score_500',
        name: '高分达人',
        description: '单局得分超过500分',
        icon: '🌟',
        condition: (stats) => stats.highestScore >= 500,
        unlocked: false
      },
      {
        id: 'score_1000',
        name: '传奇蛇王',
        description: '单局得分超过1000分',
        icon: '🏆',
        condition: (stats) => stats.highestScore >= 1000,
        unlocked: false
      },
      {
        id: 'streak_10',
        name: '连续进食',
        description: '连续吃完10个食物',
        icon: '🍎',
        condition: (stats) => stats.maxFoodStreak >= 10,
        unlocked: false
      },
      {
        id: 'streak_20',
        name: '大胃王',
        description: '连续吃完20个食物',
        icon: '🍔',
        condition: (stats) => stats.maxFoodStreak >= 20,
        unlocked: false
      },
      {
        id: 'streak_50',
        name: '饥饿终结者',
        description: '连续吃完50个食物',
        icon: '🍱',
        condition: (stats) => stats.maxFoodStreak >= 50,
        unlocked: false
      },
      {
        id: 'survive_60',
        name: '生存专家',
        description: '无死亡存活60秒',
        icon: '⏱️',
        condition: (stats) => stats.longestSurvivalTime >= 60,
        unlocked: false
      },
      {
        id: 'survive_120',
        name: '长寿蛇',
        description: '无死亡存活120秒',
        icon: '🕐',
        condition: (stats) => stats.longestSurvivalTime >= 120,
        unlocked: false
      }
    ];
  }

  /**
   * 加载游戏统计数据
   */
  _loadGameStats() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GAME_STATS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load game stats:', e);
    }
    return this._getDefaultStats();
  }

  /**
   * 获取默认统计数据
   */
  _getDefaultStats() {
    return {
      totalGames: 0,
      highestScore: 0,
      maxFoodStreak: 0,
      longestSurvivalTime: 0
    };
  }

  /**
   * 保存游戏统计数据
   */
  _saveGameStats() {
    try {
      localStorage.setItem(STORAGE_KEYS.GAME_STATS, JSON.stringify(this.gameStats));
    } catch (e) {
      console.error('Failed to save game stats:', e);
    }
  }

  /**
   * 加载已解锁成就
   */
  _loadUnlockedAchievements() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load achievements:', e);
    }
    return [];
  }

  /**
   * 保存已解锁成就
   */
  _saveUnlockedAchievements() {
    try {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(this.unlockedAchievements));
    } catch (e) {
      console.error('Failed to save achievements:', e);
    }
  }

  /**
   * 游戏开始时调用
   */
  onGameStart() {
    this.gameStartTime = Date.now();
    this.foodsEatenInStreak = 0;
  }

  /**
   * 吃到食物时调用
   */
  onFoodEaten() {
    this.foodsEatenInStreak++;
  }

  /**
   * 游戏结束时调用
   * @param {number} score - 最终得分
   * @returns {Array} 新解锁的成就列表
   */
  onGameOver(score) {
    // 更新统计数据
    this.gameStats.totalGames++;
    
    if (score > this.gameStats.highestScore) {
      this.gameStats.highestScore = score;
    }
    
    if (this.foodsEatenInStreak > this.gameStats.maxFoodStreak) {
      this.gameStats.maxFoodStreak = this.foodsEatenInStreak;
    }
    
    // 计算存活时间（秒）
    if (this.gameStartTime > 0) {
      const survivalTime = Math.floor((Date.now() - this.gameStartTime) / 1000);
      if (survivalTime > this.gameStats.longestSurvivalTime) {
        this.gameStats.longestSurvivalTime = survivalTime;
      }
    }
    
    this._saveGameStats();
    
    // 检查成就解锁
    return this._checkAchievements();
  }

  /**
   * 检查并解锁成就
   * @returns {Array} 新解锁的成就列表
   */
  _checkAchievements() {
    const newlyUnlocked = [];
    
    for (const achievement of this.achievements) {
      // 跳过已解锁的
      if (this.unlockedAchievements.includes(achievement.id)) {
        continue;
      }
      
      // 检查条件
      if (achievement.condition(this.gameStats)) {
        achievement.unlocked = true;
        this.unlockedAchievements.push(achievement.id);
        this._saveUnlockedAchievements();
        newlyUnlocked.push(achievement);
      }
    }
    
    return newlyUnlocked;
  }

  /**
   * 获取所有成就列表
   * @returns {Array} 成就列表（包含解锁状态）
   */
  getAllAchievements() {
    return this.achievements.map(achievement => ({
      ...achievement,
      unlocked: this.unlockedAchievements.includes(achievement.id)
    }));
  }

  /**
   * 获取已解锁成就数量
   * @returns {number} 已解锁数量
   */
  getUnlockedCount() {
    return this.unlockedAchievements.length;
  }

  /**
   * 获取成就总数
   * @returns {number} 成就总数
   */
  getTotalCount() {
    return this.achievements.length;
  }

  /**
   * 获取游戏统计数据
   * @returns {Object} 游戏统计数据
   */
  getGameStats() {
    return { ...this.gameStats };
  }
}

// 导出为全局变量
window.AchievementSystem = AchievementSystem;
