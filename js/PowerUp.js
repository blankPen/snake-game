import { CONFIG } from './config.js';

/**
 * 道具类型枚举
 */
export const POWERUP_TYPES = {
  SPEED_UP: 'speed_up',     // 加速
  SPEED_DOWN: 'speed_down', // 减速
  INVINCIBLE: 'invincible', // 无敌/穿墙
  DOUBLE_SCORE: 'double_score', // 双倍分数
  GHOST: 'ghost'            // 幽灵模式（穿墙）
};

/**
 * 道具效果类
 * 管理道具效果的持续时间
 */
class PowerUpEffect {
  constructor(type, duration, onApply, onRemove) {
    this.type = type;
    this.duration = duration;
    this.remainingTime = duration;
    this.onApply = onApply;
    this.onRemove = onRemove;
    this.isActive = true;
  }

  /**
   * 更新效果时间
   * @param {number} deltaTime - 经过的时间（毫秒）
   * @returns {boolean} 效果是否仍然有效
   */
  update(deltaTime) {
    if (!this.isActive) return false;
    
    this.remainingTime -= deltaTime;
    if (this.remainingTime <= 0) {
      this.isActive = false;
      if (this.onRemove) {
        this.onRemove();
      }
      return false;
    }
    return true;
  }

  /**
   * 获取效果剩余时间百分比
   * @returns {number} 0-1 之间的比例
   */
  getRemainingRatio() {
    return Math.max(0, this.remainingTime / this.duration);
  }
}

/**
 * 道具类
 * 管理单个道具的生成和状态
 */
export class PowerUp {
  constructor() {
    this.position = null;
    this.type = null;
    this.isActive = false;
    this.spawnTimer = 0;
    this.spawnInterval = CONFIG.POWERUP?.SPAWN_INTERVAL || 10000; // 10秒生成一次
    this.lifeTime = CONFIG.POWERUP?.LIFE_TIME || 8000; // 道具存活8秒
    this.age = 0;
  }

  /**
   * 生成道具
   * @param {Array} snakeBody - 蛇身坐标
   * @param {Object} foodPosition - 食物位置
   */
  generate(snakeBody, foodPosition) {
    if (this.isActive) return;

    const gridWidth = CONFIG.CANVAS.WIDTH / CONFIG.CANVAS.GRID_SIZE;
    const gridHeight = CONFIG.CANVAS.HEIGHT / CONFIG.CANVAS.GRID_SIZE;

    // 随机选择道具类型
    const types = Object.values(POWERUP_TYPES);
    this.type = types[Math.floor(Math.random() * types.length)];

    let newPosition;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      newPosition = {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight)
      };
      attempts++;
    } while (
      this._isOccupied(newPosition, snakeBody, foodPosition) && 
      attempts < maxAttempts
    );

    this.position = newPosition;
    this.isActive = true;
    this.age = 0;
  }

  /**
   * 检查位置是否被占用
   */
  _isOccupied(position, snakeBody, foodPosition) {
    // 检查是否与蛇身重叠
    if (snakeBody.some(segment => segment.x === position.x && segment.y === position.y)) {
      return true;
    }
    // 检查是否与食物重叠
    if (foodPosition && position.x === foodPosition.x && position.y === foodPosition.y) {
      return true;
    }
    return false;
  }

  /**
   * 更新道具状态
   * @param {number} deltaTime - 经过的时间（毫秒）
   */
  update(deltaTime) {
    if (!this.isActive) return;

    this.age += deltaTime;
    if (this.age >= this.lifeTime) {
      this.isActive = false;
      this.position = null;
    }
  }

  /**
   * 获取道具位置
   */
  getPosition() {
    return this.position;
  }

  /**
   * 获取道具类型
   */
  getType() {
    return this.type;
  }

  /**
   * 检查是否被吃掉
   * @param {Object} headPosition - 蛇头位置
   */
  checkCollected(headPosition) {
    if (!this.isActive || !this.position) return false;
    
    const collected = headPosition.x === this.position.x && 
                      headPosition.y === this.position.y;
    
    if (collected) {
      this.isActive = false;
      this.position = null;
    }
    
    return collected;
  }

  /**
   * 获取道具存活剩余时间比例
   */
  getLifeRatio() {
    if (!this.isActive) return 0;
    return Math.max(0, 1 - this.age / this.lifeTime);
  }

  /**
   * 获取道具是否激活
   */
  getIsActive() {
    return this.isActive;
  }
}

/**
 * 道具管理器类
 * 管理所有道具效果
 */
export class PowerUpManager {
  constructor() {
    this.powerUp = new PowerUp();
    this.activeEffects = [];
    this.onEffectChange = null;
  }

  /**
   * 设置效果变化回调
   */
  setEffectChangeCallback(callback) {
    this.onEffectChange = callback;
  }

  /**
   * 生成道具
   */
  spawn(snakeBody, foodPosition) {
    this.powerUp.generate(snakeBody, foodPosition);
  }

  /**
   * 更新道具状态
   * @param {number} deltaTime - 经过的时间（毫秒）
   */
  update(deltaTime) {
    // 更新道具本身（生命周期）
    this.powerUp.update(deltaTime);

    // 更新所有效果
    this.activeEffects = this.activeEffects.filter(effect => 
      effect.update(deltaTime)
    );

    // 通知效果变化
    if (this.onEffectChange) {
      this.onEffectChange(this.getActiveEffectTypes());
    }
  }

  /**
   * 检查蛇是否吃到道具
   * @param {Object} headPosition - 蛇头位置
   * @returns {string|null} 吃到的道具类型
   */
  checkCollection(headPosition) {
    if (this.powerUp.checkCollected(headPosition)) {
      const type = this.powerUp.getType();
      this._applyEffect(type);
      return type;
    }
    return null;
  }

  /**
   * 应用道具效果
   * @param {string} type - 道具类型
   */
  _applyEffect(type) {
    const duration = CONFIG.POWERUP?.EFFECT_DURATION?.[type] || 5000;
    let effect;

    switch (type) {
      case POWERUP_TYPES.SPEED_UP:
        effect = new PowerUpEffect(
          type,
          duration,
          () => this._onSpeedUp(),
          () => this._onSpeedUpEnd()
        );
        break;
      case POWERUP_TYPES.SPEED_DOWN:
        effect = new PowerUpEffect(
          type,
          duration,
          () => this._onSpeedDown(),
          () => this._onSpeedDownEnd()
        );
        break;
      case POWERUP_TYPES.INVINCIBLE:
      case POWERUP_TYPES.GHOST:
        effect = new PowerUpEffect(
          type,
          duration,
          () => this._onInvincible(),
          () => this._onInvincibleEnd()
        );
        break;
      case POWERUP_TYPES.DOUBLE_SCORE:
        effect = new PowerUpEffect(
          type,
          duration,
          () => this._onDoubleScore(),
          () => this._onDoubleScoreEnd()
        );
        break;
    }

    if (effect) {
      this.activeEffects.push(effect);
      if (effect.onApply) {
        effect.onApply();
      }
    }
  }

  // 效果回调方法
  _onSpeedUp() { /* 由外部 Game 类处理速度变化 */ }
  _onSpeedUpEnd() { /* 由外部 Game 类处理速度恢复 */ }
  _onSpeedDown() { /* 由外部 Game 类处理速度变化 */ }
  _onSpeedDownEnd() { /* 由外部 Game 类处理速度恢复 */ }
  _onInvincible() { /* 由外部 Game 类处理无敌状态 */ }
  _onInvincibleEnd() { /* 由外部 Game 类处理无敌结束 */ }
  _onDoubleScore() { /* 由外部 Game 类处理双倍分数 */ }
  _onDoubleScoreEnd() { /* 由外部 Game 类处理双倍分数结束 */ }

  /**
   * 获取当前活跃的效果类型列表
   */
  getActiveEffectTypes() {
    return this.activeEffects.map(e => e.type);
  }

  /**
   * 检查是否有无敌/穿墙效果
   */
  hasInvincibleEffect() {
    return this.activeEffects.some(e => 
      e.type === POWERUP_TYPES.INVINCIBLE || e.type === POWERUP_TYPES.GHOST
    );
  }

  /**
   * 检查是否有双倍分数效果
   */
  hasDoubleScoreEffect() {
    return this.activeEffects.some(e => e.type === POWERUP_TYPES.DOUBLE_SCORE);
  }

  /**
   * 获取当前速度倍数
   */
  getSpeedMultiplier() {
    let multiplier = 1;
    for (const effect of this.activeEffects) {
      if (effect.type === POWERUP_TYPES.SPEED_UP) {
        multiplier *= 1.5;
      } else if (effect.type === POWERUP_TYPES.SPEED_DOWN) {
        multiplier *= 0.6;
      }
    }
    return multiplier;
  }

  /**
   * 获取道具对象（用于渲染）
   */
  getPowerUp() {
    return this.powerUp;
  }

  /**
   * 重置所有状态
   */
  reset() {
    this.powerUp = new PowerUp();
    this.activeEffects = [];
  }

  /**
   * 获取效果信息（用于 UI 显示）
   */
  getEffectsInfo() {
    return this.activeEffects.map(effect => ({
      type: effect.type,
      remainingRatio: effect.getRemainingRatio()
    }));
  }
}
