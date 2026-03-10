import { CONFIG } from './config.js';

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
  }

  /**
   * 清除画布
   */
  clear() {
    this.ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
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
   * 绘制道具
   * @param {Object} powerUp - 道具对象
   */
  drawPowerUp(powerUp) {
    if (!powerUp || !powerUp.getIsActive() || !powerUp.getPosition()) return;

    const position = powerUp.getPosition();
    const type = powerUp.getType();
    const x = position.x * this.gridSize;
    const y = position.y * this.gridSize;

    // 获取道具颜色
    const color = CONFIG.POWERUP.COLORS[type] || '#ffffff';
    this.ctx.fillStyle = color;

    // 绘制带闪烁效果的道具
    const centerX = x + this.gridSize / 2;
    const centerY = y + this.gridSize / 2;

    // 闪烁效果
    const lifeRatio = powerUp.getLifeRatio();
    const alpha = 0.5 + 0.5 * Math.sin(Date.now() / 100) * lifeRatio;
    this.ctx.globalAlpha = alpha;

    // 绘制菱形道具
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, y + 2);
    this.ctx.lineTo(x + this.gridSize - 2, centerY);
    this.ctx.lineTo(centerX, y + this.gridSize - 2);
    this.ctx.lineTo(x + 2, centerY);
    this.ctx.closePath();
    this.ctx.fill();

    // 绘制道具符号
    this.ctx.globalAlpha = 1;
    const symbol = CONFIG.POWERUP.SYMBOLS[type] || '?';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(symbol, centerX, centerY);

    // 绘制存活时间进度条
    this._drawPowerUpTimer(x, y, lifeRatio, color);
  }

  /**
   * 绘制道具存活时间进度条
   */
  _drawPowerUpTimer(x, y, ratio, color) {
    const barWidth = this.gridSize - 4;
    const barHeight = 3;
    const barX = x + 2;
    const barY = y + this.gridSize - barHeight - 2;

    // 背景
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(barX, barY, barWidth, barHeight);

    // 进度
    this.ctx.fillStyle = color;
    this.ctx.fillRect(barX, barY, barWidth * ratio, barHeight);
  }

  /**
   * 绘制分数
   * @param {number} score - 当前分数
   * @param {number} highScore - 最高分
   */
  drawScore(score, highScore) {
    this.ctx.fillStyle = CONFIG.COLORS.TEXT;
    this.ctx.font = '20px Arial';
    this.ctx.textAlign = 'left';

    // 当前分数
    this.ctx.fillText(`分数: ${score}`, 10, 30);

    // 最高分
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`最高分: ${highScore}`, this.canvas.width - 10, 30);
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
   * 绘制道具效果指示器
   * @param {Array} effectsInfo - 效果信息数组
   */
  drawPowerUpEffects(effectsInfo) {
    if (!effectsInfo || effectsInfo.length === 0) return;

    let yOffset = 60;
    const x = 10;

    effectsInfo.forEach(effect => {
      const color = CONFIG.POWERUP.COLORS[effect.type] || '#ffffff';
      const symbol = CONFIG.POWERUP.SYMBOLS[effect.type] || '?';
      const name = this._getEffectName(effect.type);

      // 绘制效果名称
      this.ctx.fillStyle = color;
      this.ctx.font = '14px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(`${symbol} ${name}`, x, yOffset);

      // 绘制效果持续时间进度条
      const barWidth = 80;
      const barHeight = 6;
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      this.ctx.fillRect(x + 60, yOffset - 8, barWidth, barHeight);
      this.ctx.fillStyle = color;
      this.ctx.fillRect(x + 60, yOffset - 8, barWidth * effect.remainingRatio, barHeight);

      yOffset += 20;
    });
  }

  /**
   * 获取效果名称
   */
  _getEffectName(type) {
    const names = {
      speed_up: '加速',
      speed_down: '减速',
      invincible: '无敌',
      double_score: '双倍分',
      ghost: '穿墙'
    };
    return names[type] || type;
  }

  /**
   * 渲染完整游戏画面
   * @param {Array} snakeBody - 蛇身
   * @param {Object} foodPosition - 食物位置
   * @param {number} score - 当前分数
   * @param {number} highScore - 最高分
   * @param {string} status - 游戏状态
   * @param {Object} powerUp - 道具对象
   * @param {Array} effectsInfo - 效果信息数组
   * @param {Object} stats - 游戏统计数据（可选）
   */
  render(snakeBody, foodPosition, score, highScore, status, powerUp = null, effectsInfo = [], stats = null) {
    this.clear();
    this.drawGrid();
    this.drawSnake(snakeBody);
    this.drawFood(foodPosition);
    this.drawPowerUp(powerUp);
    this.drawScore(score, highScore);
    this.drawPowerUpEffects(effectsInfo);

    // 根据状态绘制额外内容
    if (status === 'paused') {
      this.drawPause();
    } else if (status === 'gameover') {
      this.drawGameOver(score);
    }
  }
}
