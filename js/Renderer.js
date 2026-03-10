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
    
    // 动画相关
    this.lastSnakeBody = [];
    this.interpolationFactor = 1;
    this.animationManager = null;
    
    // 分数跳动动画状态
    this.scoreBounce = {
      active: false,
      startTime: 0,
      duration: 300,
      scale: 1
    };
  }

  /**
   * 设置动画管理器
   * @param {AnimationManager} manager - 动画管理器实例
   */
  setAnimationManager(manager) {
    this.animationManager = manager;
  }

  /**
   * 触发分数跳动效果
   */
  triggerScoreBounce() {
    this.scoreBounce.active = true;
    this.scoreBounce.startTime = performance.now();
  }

  /**
   * 更新分数跳动状态
   * @returns {boolean} 是否还在动画中
   */
  updateScoreBounce() {
    if (!this.scoreBounce.active) return false;
    
    const elapsed = performance.now() - this.scoreBounce.startTime;
    const progress = elapsed / this.scoreBounce.duration;
    
    if (progress >= 1) {
      this.scoreBounce.active = false;
      this.scoreBounce.scale = 1;
      return false;
    }
    
    // 使用弹性缓动函数
    this.scoreBounce.scale = 1 + 0.3 * Math.sin(progress * Math.PI);
    return true;
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
   * @param {Object} shakeOffset - 屏幕抖动偏移
   */
  drawSnake(snakeBody, shakeOffset = { x: 0, y: 0 }) {
    const enableSmooth = this.animationManager?.config?.SMOOTH_MOVEMENT ?? false;
    
    snakeBody.forEach((segment, index) => {
      let drawX = segment.x * this.gridSize;
      let drawY = segment.y * this.gridSize;
      
      // 应用屏幕抖动
      drawX += shakeOffset.x;
      drawY += shakeOffset.y;

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
        drawX + 1,
        drawY + 1,
        this.gridSize - 2,
        this.gridSize - 2
      );

      // 绘制圆角效果（简化）
      if (index === 0) {
        this._drawSnakeHead(drawX, drawY);
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
   * @param {Object} shakeOffset - 屏幕抖动偏移
   */
  drawFood(foodPosition, shakeOffset = { x: 0, y: 0 }) {
    // 获取食物动画
    const foodAnim = this.animationManager?.getFoodAnimation(foodPosition);
    
    let x = foodPosition.x * this.gridSize;
    let y = foodPosition.y * this.gridSize;
    let scale = 1;
    let opacity = 1;

    // 应用动画效果
    if (foodAnim) {
      x += (this.gridSize * (1 - foodAnim.scale)) / 2;
      y += (this.gridSize * (1 - foodAnim.scale)) / 2;
      scale = foodAnim.scale;
      opacity = foodAnim.opacity;
    }

    // 应用屏幕抖动
    x += shakeOffset.x;
    y += shakeOffset.y;

    // 保存上下文状态
    this.ctx.save();
    this.ctx.globalAlpha = opacity;

    this.ctx.fillStyle = CONFIG.COLORS.FOOD;

    // 绘制圆形食物（带缩放）
    const centerX = x + this.gridSize / 2;
    const centerY = y + this.gridSize / 2;
    const radius = ((this.gridSize / 2) - 2) * scale;

    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, Math.max(0, radius), 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  /**
   * 绘制分数
   * @param {number} score - 当前分数
   * @param {number} highScore - 最高分
   */
  drawScore(score, highScore) {
    this.ctx.fillStyle = CONFIG.COLORS.TEXT;
    this.ctx.textAlign = 'left';
    
    // 应用分数跳动效果
    if (this.scoreBounce.active) {
      this.ctx.save();
      const centerX = 50;
      const centerY = 30;
      this.ctx.translate(centerX, centerY);
      this.ctx.scale(this.scoreBounce.scale, this.scoreBounce.scale);
      this.ctx.translate(-centerX, -centerY);
    }
    
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`分数: ${score}`, 10, 30);

    // 最高分
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`最高分: ${highScore}`, this.canvas.width - 10, 30);
    
    if (this.scoreBounce.active) {
      this.ctx.restore();
    }
  }

  /**
   * 绘制速度等级进度条
   * @param {number} level - 当前速度等级
   * @param {number} maxLevel - 最大速度等级
   */
  drawSpeedBar(level, maxLevel) {
    const barWidth = 120;
    const barHeight = 8;
    const barX = this.canvas.width - barWidth - 10;
    const barY = 38;

    // 背景条
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(barX, barY, barWidth, barHeight);

    // 进度条（根据等级计算宽度）
    const progressWidth = (level / maxLevel) * barWidth;
    
    // 渐变色：从绿色到黄色到红色
    const gradient = this.ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
    gradient.addColorStop(0, '#00ff00');
    gradient.addColorStop(0.5, '#ffff00');
    gradient.addColorStop(1, '#ff4444');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(barX, barY, progressWidth, barHeight);

    // 边框
    this.ctx.strokeStyle = '#666666';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(barX, barY, barWidth, barHeight);

    // 等级文字
    this.ctx.fillStyle = CONFIG.COLORS.TEXT;
    this.ctx.font = '11px Arial';
    this.ctx.textAlign = 'right';
    this.ctx.fillText(`Lv.${level}`, barX + barWidth, barY - 3);
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
   * 绘制开始画面
   * @param {number} highScore - 最高分
   */
  drawStartScreen(highScore) {
    // 清空画布
    this.ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 标题
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = 'bold 60px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🐍 贪吃蛇', this.canvas.width / 2, this.canvas.height / 2 - 80);

    // 最高分
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`最高分: ${highScore}`, this.canvas.width / 2, this.canvas.height / 2);

    // 难度选择提示
    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#aaaaaa';
    this.ctx.fillText('选择难度:', this.canvas.width / 2, this.canvas.height / 2 + 60);

    // 难度按钮
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillText('[1] 简单  [2] 普通  [3] 困难', this.canvas.width / 2, this.canvas.height / 2 + 100);

    // 开始提示
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = '20px Arial';
    this.ctx.fillText('按空格键开始游戏', this.canvas.width / 2, this.canvas.height / 2 + 160);
  }

  /**
   * 渲染完整游戏画面
   * @param {Array} snakeBody - 蛇身
   * @param {Object} foodPosition - 食物位置
   * @param {number} score - 当前分数
   * @param {number} highScore - 最高分
   * @param {string} status - 游戏状态
   * @param {number} speedLevel - 速度等级（可选）
   * @param {number} maxLevel - 最大速度等级（可选）
   */
  render(snakeBody, foodPosition, score, highScore, status, speedLevel = 1, maxLevel = 10) {
    // 获取屏幕抖动偏移
    const shakeOffset = this.animationManager?.getScreenShake() || { x: 0, y: 0 };
    
    this.clear();
    this.drawGrid();
    this.drawSnake(snakeBody, shakeOffset);
    this.drawFood(foodPosition, shakeOffset);
    this.drawScore(score, highScore);
    this.drawSpeedBar(speedLevel, maxLevel);
    
    // 渲染得分飘字
    if (this.animationManager) {
      this.renderScorePopups(shakeOffset);
    }

    // 根据状态绘制额外内容
    if (status === 'start') {
      this.drawStartScreen(highScore);
    } else if (status === 'paused') {
      this.drawPause();
    } else if (status === 'gameover') {
      this.drawGameOver(score);
    }
  }
  
  /**
   * 渲染得分飘字
   * @param {Object} shakeOffset - 屏幕抖动偏移
   */
  renderScorePopups(shakeOffset) {
    const popups = this.animationManager.getScorePopups();
    
    popups.forEach(popup => {
      const x = popup.position.x * this.gridSize + this.gridSize / 2 + shakeOffset.x;
      const y = popup.position.y * this.gridSize + shakeOffset.y + popup.y;
      
      this.ctx.save();
      this.ctx.globalAlpha = popup.opacity;
      this.ctx.fillStyle = '#ffff00';
      this.ctx.font = 'bold 16px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`+${popup.score}`, x, y);
      this.ctx.restore();
    });
  }
}
