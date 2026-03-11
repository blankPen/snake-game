/**
 * 每日挑战模块
 * 生成和验证每日挑战任务
 */

// 挑战类型常量
export const CHALLENGE_TYPES = {
  SCORE: 'score',       // 分数挑战：在指定时间内达到目标分数
  SURVIVAL: 'survival', // 生存挑战：在限定生命数内尽可能得高分
  SPEED: 'speed',       // 速度挑战：在最短时间内达到目标分数
  RULE: 'rule'          // 规则挑战：启用特殊规则
};

// 特殊规则常量
export const SPECIAL_RULES = {
  REVERSE_CONTROLS: 'reverse_controls',     // 反向控制
  NO_PAUSE: 'no_pause',                     // 无暂停
  FAST_MODE: 'fast_mode',                   // 快速模式
  SMALL_GRID: 'small_grid',                 // 小网格
  DOUBLE_POINTS: 'double_points'            // 双倍分数
};

/**
 * 根据日期获取每日种子
 * 使用确定性随机算法，确保所有玩家面对相同的挑战
 * @param {Date} date - 日期对象
 * @returns {number} 种子数值
 */
export function getDailySeed(date = new Date()) {
  const dateStr = date.toISOString().split('T')[0];
  return hashString(dateStr);
}

/**
 * 字符串哈希函数
 * @param {string} str - 输入字符串
 * @returns {number} 哈希值
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为 32 位整数
  }
  return Math.abs(hash);
}

/**
 * 使用种子生成伪随机数
 * @param {number} seed - 种子
 * @returns {function} 返回随机数生成函数
 */
function seededRandom(seed) {
  return function() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

/**
 * 每日挑战类
 * 负责生成和验证每日挑战
 */
export class DailyChallenge {
  constructor(date = new Date()) {
    this.date = date;
    this.seed = getDailySeed(date);
    this.random = seededRandom(this.seed);
    this.challenge = this._generateChallenge();
  }

  /**
   * 获取今日挑战
   * @returns {Object} 挑战对象
   */
  getChallenge() {
    return this.challenge;
  }

  /**
   * 生成随机挑战
   * @returns {Object} 挑战配置
   */
  _generateChallenge() {
    const type = this._pickChallengeType();
    const config = this._generateConfigByType(type);
    
    return {
      type,
      date: this.date.toISOString().split('T')[0],
      seed: this.seed,
      ...config
    };
  }

  /**
   * 选择挑战类型
   * @returns {string} 挑战类型
   */
  _pickChallengeType() {
    const types = Object.values(CHALLENGE_TYPES);
    const index = Math.floor(this.random() * types.length);
    return types[index];
  }

  /**
   * 根据类型生成挑战配置
   * @param {string} type - 挑战类型
   * @returns {Object} 挑战配置
   */
  _generateConfigByType(type) {
    switch (type) {
      case CHALLENGE_TYPES.SCORE:
        return this._generateScoreChallenge();
      case CHALLENGE_TYPES.SURVIVAL:
        return this._generateSurvivalChallenge();
      case CHALLENGE_TYPES.SPEED:
        return this._generateSpeedChallenge();
      case CHALLENGE_TYPES.RULE:
        return this._generateRuleChallenge();
      default:
        return this._generateScoreChallenge();
    }
  }

  /**
   * 生成分数挑战配置
   * @returns {Object} 挑战配置
   */
  _generateScoreChallenge() {
    const targetScores = [100, 200, 300, 500];
    const timeLimits = [60, 90, 120, 180]; // 秒
    
    const targetScore = targetScores[Math.floor(this.random() * targetScores.length)];
    const timeLimit = timeLimits[Math.floor(this.random() * timeLimits.length)];
    
    return {
      title: '分数挑战',
      description: `在 ${timeLimit} 秒内达到 ${targetScore} 分`,
      targetScore,
      timeLimit,
      rules: []
    };
  }

  /**
   * 生成生存挑战配置
   * @returns {Object} 挑战配置
   */
  _generateSurvivalChallenge() {
    const livesOptions = [1, 2, 3];
    const targetScores = [200, 300, 500];
    
    const lives = livesOptions[Math.floor(this.random() * livesOptions.length)];
    const targetScore = targetScores[Math.floor(this.random() * targetScores.length)];
    
    return {
      title: '生存挑战',
      description: `用 ${lives} 条命达到 ${targetScore} 分`,
      targetScore,
      lives,
      rules: []
    };
  }

  /**
   * 生成速度挑战配置
   * @returns {Object} 挑战配置
   */
  _generateSpeedChallenge() {
    const targetScores = [50, 100, 150, 200];
    const targetScore = targetScores[Math.floor(this.random() * targetScores.length)];
    
    return {
      title: '速度挑战',
      description: `尽快达到 ${targetScore} 分`,
      targetScore,
      timeLimit: null, // 不限制时间，计分
      rules: ['fast_mode']
    };
  }

  /**
   * 生成规则挑战配置
   * @returns {Object} 挑战配置
   */
  _generateRuleChallenge() {
    const rules = Object.values(SPECIAL_RULES);
    const selectedRule = rules[Math.floor(this.random() * rules.length)];
    
    const ruleDescriptions = {
      [SPECIAL_RULES.REVERSE_CONTROLS]: '反向控制',
      [SPECIAL_RULES.NO_PAUSE]: '无法暂停',
      [SPECIAL_RULES.FAST_MODE]: '快速模式',
      [SPECIAL_RULES.SMALL_GRID]: '小网格',
      [SPECIAL_RULES.DOUBLE_POINTS]: '双倍分数'
    };
    
    const targetScores = [100, 150, 200, 300];
    const targetScore = targetScores[Math.floor(this.random() * targetScores.length)];
    
    return {
      title: '规则挑战',
      description: `使用 ${ruleDescriptions[selectedRule]} 达到 ${targetScore} 分`,
      targetScore,
      rules: [selectedRule],
      specialRule: selectedRule
    };
  }

  /**
   * 验证挑战是否完成
   * @param {number} score - 玩家得分
   * @param {number} timeElapsed - 耗时（秒）
   * @param {number} livesUsed - 使用的生命数
   * @returns {Object} 验证结果
   */
  validate(score, timeElapsed = 0, livesUsed = 1) {
    const { type, targetScore, timeLimit, lives, rules } = this.challenge;
    
    let completed = false;
    let stars = 0;
    
    switch (type) {
      case CHALLENGE_TYPES.SCORE:
        completed = score >= targetScore && timeElapsed <= timeLimit;
        stars = this._calculateStars(score, targetScore);
        break;
        
      case CHALLENGE_TYPES.SURVIVAL:
        completed = score >= targetScore && livesUsed <= lives;
        stars = this._calculateStars(score, targetScore);
        break;
        
      case CHALLENGE_TYPES.SPEED:
        completed = score >= targetScore;
        stars = this._calculateSpeedStars(timeElapsed, targetScore);
        break;
        
      case CHALLENGE_TYPES.RULE:
        completed = score >= targetScore;
        stars = this._calculateStars(score, targetScore);
        break;
    }
    
    return {
      completed,
      stars,
      score,
      targetScore,
      timeElapsed,
      type
    };
  }

  /**
   * 计算星级
   * @param {number} score - 玩家得分
   * @param {number} targetScore - 目标分数
   * @returns {number} 星级 (0-3)
   */
  _calculateStars(score, targetScore) {
    if (score < targetScore) return 0;
    const ratio = score / targetScore;
    if (ratio >= 2) return 3;
    if (ratio >= 1.5) return 2;
    return 1;
  }

  /**
   * 计算速度挑战星级
   * @param {number} timeElapsed - 耗时
   * @param {number} targetScore - 目标分数
   * @returns {number} 星级 (0-3)
   */
  _calculateSpeedStars(timeElapsed, targetScore) {
    // 假设平均完成时间约为 60 秒
    const baseTime = 60;
    const ratio = baseTime / Math.max(timeElapsed, 1);
    
    if (ratio >= 1.5) return 3;
    if (ratio >= 1) return 2;
    if (ratio >= 0.5) return 1;
    return 0;
  }

  /**
   * 检查挑战是否过期
   * @returns {boolean} 是否过期
   */
  isExpired() {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    return this.date.toISOString().split('T')[0] !== todayStr;
  }

  /**
   * 获取挑战的描述文本
   * @returns {string} 描述文本
   */
  getDescription() {
    return this.challenge.description;
  }

  /**
   * 获取挑战标题
   * @returns {string} 标题
   */
  getTitle() {
    return this.challenge.title;
  }
}

export default DailyChallenge;
