import { CONFIG } from './config.js';

/**
 * 粒子系统类
 * 负责管理粒子效果
 */
class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  /**
   * 创建爆炸粒子
   * @param {number} x - 中心 x 坐标
   * @param {number} y - 中心 y 坐标
   * @param {string} color - 粒子颜色
   */
  createExplosion(x, y, color = '#ff4444') {
    const particleCount = 12;
    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount;
      const speed = 2 + Math.random() * 3;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        decay: 0.02 + Math.random() * 0.02,
        size: 3 + Math.random() * 4,
        color
      });
    }
  }

  /**
   * 创建速度线
   * @param {number} canvasWidth - 画布宽度
   * @param {number} canvasHeight - 画布高度
   * @param {string} direction - 蛇的移动方向
   */
  createSpeedLines(canvasWidth, canvasHeight, direction) {
    const lineCount = 8;
    for (let i = 0; i < lineCount; i++) {
      const y = Math.random() * canvasHeight;
      const x = Math.random() * canvasWidth;
      let vx = 0, vy = 0;
      
      switch (direction) {
        case 'UP': vy = -8; break;
        case 'DOWN': vy = 8; break;
        case 'LEFT': vx = -8; break;
        case 'RIGHT': vx = 8; break;
      }

      this.particles.push({
        x, y,
        vx, vy,
        life: 1.0,
        decay: 0.08,
        size: 2,
        isSpeedLine: true,
        color: 'rgba(255, 255, 255, 0.6)'
      });
    }
  }

  /**
   * 更新粒子
   */
  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      
      if (p.isSpeedLine) {
        p.size += 2;
      }

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * 绘制粒子
   * @param {CanvasRenderingContext2D} ctx - Canvas 上下文
   */
  draw(ctx) {
    this.particles.forEach(p => {
      ctx.globalAlpha = p.life;
      if (p.isSpeedLine) {
        // 速度线
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2);
        ctx.stroke();
      } else {
        // 爆炸粒子
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1.0;
  }

  /**
   * 获取粒子数量
   */
  getCount() {
    return this.particles.length;
  }
}

/**
 * 屏幕震动管理器
 */
class ScreenShake {
  constructor() {
    this.intensity = 0;
    this.duration = 0;
    this.timer = 0;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  /**
   * 触发屏幕震动
   * @param {number} intensity - 震动强度
   * @param {number} duration - 持续时间(ms)
   */
  shake(intensity = 5, duration = 200) {
    this.intensity = intensity;
    this.duration = duration;
    this.timer = duration;
  }

  /**
   * 更新震动状态
   * @param {number} deltaTime - 时间增量
   */
  update(deltaTime) {
    if (this.timer > 0) {
      this.timer -= deltaTime;
      const progress = 1 - (this.timer / this.duration);
      const currentIntensity = this.intensity * (1 - progress);
      
      this.offsetX = (Math.random() - 0.5) * currentIntensity * 2;
      this.offsetY = (Math.random() - 0.5) * currentIntensity * 2;
    } else {
      this.offsetX = 0;
      this.offsetY = 0;
    }
  }

  /**
   * 获取当前偏移
   */
  getOffset() {
    return { x: this.offsetX, y: this.offsetY };
  }

  /**
   * 是否正在震动
   */
  isShaking() {
    return this.timer > 0;
  }
}

/**
 * 渐变背景管理器
 */
class GradientBackground {
  constructor() {
    this.phase = 0;
    this.gameState = 'playing'; // playing, paused, gameover
  }

  /**
   * 设置游戏状态
   * @param {string} state - 游戏状态
   */
  setGameState(state) {
    this.gameState = state;
  }

  /**
   * 更新背景动画
   * @param {number} deltaTime - 时间增量
   */
  update(deltaTime) {
    this.phase += deltaTime * 0.001;
  }

  /**
   * 获取背景渐变
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} width
   * @param {number} height
   */
  getGradient(ctx, width, height) {
    let colors;
    
    switch (this.gameState) {
      case 'paused':
        return null; // 使用半透明遮罩
      case 'gameover':
        const gameoverPhase = Math.sin(this.phase * 2) * 0.1 + 0.5;
        colors = [
          `rgba(${30 + gameoverPhase * 20}, ${10}, ${20 + gameoverPhase * 10}, 1)`,
          `rgba(${15}, ${5}, ${10 + gameoverPhase * 5}, 1)`
        ];
        break;
      case 'playing':
      default:
        const playingPhase = Math.sin(this.phase) * 0.15;
        colors = [
          `rgba(${26 + playingPhase * 30}, ${26 + playingPhase * 20}, ${46 + playingPhase * 30}, 1)`,
          `rgba(${13}, ${13}, ${26 + playingPhase * 20}, 1)`
        ];
        break;
    }

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, colors[0]);
    gradient.addColorStop(1, colors[1]);
    return gradient;
  }
}

/**
 * 闪烁效果管理器
 */
class FlashEffect {
  constructor() {
    this.intensity = 0;
    this.duration = 0;
    this.timer = 0;
    this.color = '#ffffff';
  }

  /**
   * 触发闪烁
   * @param {number} intensity - 闪烁强度 (0-1)
   * @param {number} duration - 持续时间(ms)
   * @param {string} color - 闪烁颜色
   */
  flash(intensity = 0.3, duration = 100, color = '#ffffff') {
    this.intensity = intensity;
    this.duration = duration;
    this.timer = duration;
    this.color = color;
  }

  /**
   * 更新闪烁状态
   * @param {number} deltaTime - 时间增量
   */
  update(deltaTime) {
    if (this.timer > 0) {
      this.timer -= deltaTime;
    }
  }

  /**
   * 获取当前闪烁透明度
   */
  getOpacity() {
    if (this.timer <= 0) return 0;
    const progress = this.timer / this.duration;
    return this.intensity * progress;
  }

  /**
   * 是否正在闪烁
   */
  isFlashing() {
    return this.timer > 0;
  }
}

/**
 * 渲染引擎类
 * 负责 Canvas 绘制和游戏画面渲染
 */
export class Renderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    // 设置画布尺寸
    this.canvas.width = CONFIG.CANVAS.WIDTH;
    this.canvas.height = CONFIG.CANVAS.HEIGHT;

    this.gridSize = CONFIG.CANVAS.GRID_SIZE;

    // 初始化特效系统
    this.particleSystem = new ParticleSystem();
    this.screenShake = new ScreenShake();
    this.gradientBackground = new GradientBackground();
    this.flashEffect = new FlashEffect();

    // 分数动画状态
    this.scoreAnimation = {
      scale: 1,
      targetScale: 1,
      bounceTime: 0
    };

    // 速度线计时器
    this.speedLineTimer = 0;
    this.currentDirection = 'RIGHT';
  }

  /**
   * 清除画布
   */
  clear() {
    const gradient = this.gradientBackground.getGradient(
      this.ctx,
      this.canvas.width,
      this.canvas.height
    );
    
    if (gradient) {
      this.ctx.fillStyle = gradient;
    } else {
      this.ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
    }
    
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 应用屏幕震动偏移
   */
  applyScreenShake() {
    const offset = this.screenShake.getOffset();
    this.ctx.save();
    this.ctx.translate(offset.x, offset.y);
  }

  /**
   * 取消屏幕震动偏移
   */
  cancelScreenShake() {
    this.ctx.restore();
  }

  /**
   * 绘制网格线（可选）
   */
  drawGrid() {
    this.ctx.strokeStyle = CONFIG.COLORS.GRID;
    this.ctx.lineWidth = 1;

    // 垂直线
    for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    // 水平线
    for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  /**
   * 绘制蛇
   * @param {Array} snakeBody - 蛇身坐标数组
   */
  drawSnake(snakeBody) {
    snakeBody.forEach((segment, index) => {
      const x = segment.x * this.gridSize;
      const y = segment.y * this.gridSize;

      // 区分头部、身体和尾部
      if (index === 0) {
        this.ctx.fillStyle = CONFIG.COLORS.SNAKE_HEAD;
      } else if (index === snakeBody.length - 1) {
        this.ctx.fillStyle = CONFIG.COLORS.SNAKE_TAIL;
      } else {
        this.ctx.fillStyle = CONFIG.COLORS.SNAKE_BODY;
      }

      // 绘制矩形（留 1px 间隙）
      this.ctx.fillRect(
        x + 1,
        y + 1,
        this.gridSize - 2,
        this.gridSize - 2
      );

      // 绘制圆角效果（简化）
      if (index === 0) {
        this._drawSnakeHead(x, y);
      }
    });
  }

  /**
   * 绘制蛇头（添加眼睛效果）
   * @param {number} x - x 坐标
   * @param {number} y - y 坐标
   */
  _drawSnakeHead(x, y) {
    // 简单的眼睛效果
    const eyeSize = 3;
    const eyeOffset = 5;

    this.ctx.fillStyle = '#ffffff';

    // 左眼
    this.ctx.fillRect(
      x + eyeOffset,
      y + eyeOffset,
      eyeSize,
      eyeSize
    );

    // 右眼
    this.ctx.fillRect(
      x + this.gridSize - eyeOffset - eyeSize,
      y + eyeOffset,
      eyeSize,
      eyeSize
    );
  }

  /**
   * 绘制食物
   * @param {Object} foodPosition - 食物坐标
   */
  drawFood(foodPosition) {
    const x = foodPosition.x * this.gridSize;
    const y = foodPosition.y * this.gridSize;

    this.ctx.fillStyle = CONFIG.COLORS.FOOD;

    // 绘制圆形食物
    const centerX = x + this.gridSize / 2;
    const centerY = y + this.gridSize / 2;
    const radius = (this.gridSize / 2) - 2;

    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * 绘制分数
   * @param {number} score - 当前分数
   * @param {number} highScore - 最高分
   */
  drawScore(score, highScore) {
    this.ctx.save();
    
    // 应用弹跳动画
    const scale = this.scoreAnimation.scale;
    this.ctx.translate(this.canvas.width / 2, 30);
    this.ctx.scale(scale, scale);
    this.ctx.translate(-this.canvas.width / 2, -30);

    this.ctx.fillStyle = CONFIG.COLORS.TEXT;
    this.ctx.font = '20px Arial';
    this.ctx.textAlign = 'left';

    // 当前分数
    this.ctx.fillText(`分数: ${score}`, 10, 30);

    // 最高分
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`最高分: ${highScore}`, this.canvas.width - 10, 30);
    
    this.ctx.restore();
  }

  /**
   * 触发分数弹跳动画
   */
  triggerScoreBounce() {
    this.scoreAnimation.targetScale = 1.3;
    this.scoreAnimation.bounceTime = 200;
  }

  /**
   * 更新分数动画
   * @param {number} deltaTime - 时间增量
   */
  updateScoreAnimation(deltaTime) {
    if (this.scoreAnimation.bounceTime > 0) {
      this.scoreAnimation.bounceTime -= deltaTime;
      // 使用弹簧效果
      const progress = 1 - (this.scoreAnimation.bounceTime / 200);
      this.scoreAnimation.scale = 1 + Math.sin(progress * Math.PI) * 0.3;
    } else {
      this.scoreAnimation.scale = 1;
      this.scoreAnimation.targetScale = 1;
    }
  }

  /**
   * 绘制游戏结束画面
   * @param {number} score - 最终分数
   */
  drawGameOver(score) {
    // 半透明遮罩
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 游戏结束文字
    this.ctx.fillStyle = '#ff4444';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('游戏结束', this.canvas.width / 2, this.canvas.height / 2 - 40);

    // 分数
    this.ctx.fillStyle = CONFIG.COLORS.TEXT;
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`最终分数: ${score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);

    // 提示
    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#aaaaaa';
    this.ctx.fillText('按 R 键重新开始', this.canvas.width / 2, this.canvas.height / 2 + 60);
  }

  /**
   * 绘制暂停画面
   */
  drawPause() {
    // 半透明遮罩
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 暂停文字
    this.ctx.fillStyle = CONFIG.COLORS.TEXT;
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('暂停', this.canvas.width / 2, this.canvas.height / 2);

    // 提示
    this.ctx.font = '20px Arial';
    this.ctx.fillStyle = '#aaaaaa';
    this.ctx.fillText('按空格键继续', this.canvas.width / 2, this.canvas.height / 2 + 50);
  }

  /**
   * 绘制闪烁效果
   */
  drawFlash() {
    if (this.flashEffect.isFlashing()) {
      const opacity = this.flashEffect.getOpacity();
      this.ctx.fillStyle = this.flashEffect.color;
      this.ctx.globalAlpha = opacity;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.globalAlpha = 1.0;
    }
  }

  /**
   * 触发吃食物特效
   * @param {Object} foodPosition - 食物位置
   */
  triggerEatFoodEffect(foodPosition) {
    // 粒子爆炸
    const centerX = foodPosition.x * this.gridSize + this.gridSize / 2;
    const centerY = foodPosition.y * this.gridSize + this.gridSize / 2;
    this.particleSystem.createExplosion(centerX, centerY, CONFIG.COLORS.FOOD);
    
    // 屏幕闪烁
    this.flashEffect.flash(0.3, 100, CONFIG.COLORS.FOOD);
    
    // 分数弹跳
    this.triggerScoreBounce();
  }

  /**
   * 触发速度线效果
   * @param {string} direction - 移动方向
   */
  triggerSpeedLines(direction) {
    this.currentDirection = direction;
    this.speedLineTimer = 300;
    this.particleSystem.createSpeedLines(
      this.canvas.width,
      this.canvas.height,
      direction
    );
  }

  /**
   * 触发游戏结束震动
   */
  triggerGameOverShake() {
    this.screenShake.shake(10, 500);
  }

  /**
   * 触发暂停效果
   */
  setPaused(paused) {
    this.gradientBackground.setGameState(paused ? 'paused' : 'playing');
  }

  /**
   * 触发游戏结束效果
   */
  setGameOver() {
    this.gradientBackground.setGameState('gameover');
  }

  /**
   * 重置为游戏状态
   */
  setPlaying() {
    this.gradientBackground.setGameState('playing');
  }

  /**
   * 更新所有特效
   * @param {number} deltaTime - 时间增量
   */
  updateEffects(deltaTime) {
    this.particleSystem.update();
    this.screenShake.update(deltaTime);
    this.gradientBackground.update(deltaTime);
    this.flashEffect.update(deltaTime);
    this.updateScoreAnimation(deltaTime);
    
    // 速度线持续生成
    if (this.speedLineTimer > 0) {
      this.speedLineTimer -= deltaTime;
      if (Math.random() < 0.3) {
        this.particleSystem.createSpeedLines(
          this.canvas.width,
          this.canvas.height,
          this.currentDirection
        );
      }
    }
  }

  /**
   * 渲染完整游戏画面
   * @param {Array} snakeBody - 蛇身
   * @param {Object} foodPosition - 食物位置
   * @param {number} score - 当前分数
   * @param {number} highScore - 最高分
   * @param {string} status - 游戏状态
   * @param {number} deltaTime - 时间增量
   */
  render(snakeBody, foodPosition, score, highScore, status, deltaTime = 16) {
    // 更新特效
    this.updateEffects(deltaTime);

    // 应用屏幕震动
    this.applyScreenShake();
    
    // 清除画布（带渐变背景）
    this.clear();
    this.drawGrid();
    this.drawSnake(snakeBody);
    this.drawFood(foodPosition);
    this.drawScore(score, highScore);
    
    // 绘制粒子效果
    this.particleSystem.draw(this.ctx);
    
    // 绘制闪烁效果
    this.drawFlash();
    
    // 取消屏幕震动偏移
    this.cancelScreenShake();

    // 根据状态绘制额外内容
    if (status === 'paused') {
      this.drawPause();
    } else if (status === 'gameover') {
      this.drawGameOver(score);
    }
  }
}
