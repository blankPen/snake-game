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

    // 动画状态
    this.foodAnimation = {
      active: false,
      scale: 1,
      alpha: 1,
      frame: 0
    };

    this.scoreAnimation = {
      active: false,
      scale: 1,
      frame: 0
    };

    this.animationManager = null;
  }

  /**
   * 设置动画管理器
   * @param {AnimationManager} manager - 动画管理器实例
   */
  setAnimationManager(manager) {
    this.animationManager = manager;
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
   * @param {Object} direction - 当前移动方向 {x, y}
   */
  drawSnake(snakeBody, direction = { x: 1, y: 0 }) {
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

      // 绘制蛇头（带方向眼睛）
      if (index === 0) {
        this._drawSnakeHead(x, y, direction);
      }
    });
  }

  /**
   * 绘制蛇头（带方向指示眼睛）
   * @param {number} x - x 坐标
   * @param {number} y - y 坐标
   * @param {Object} direction - 移动方向 {x, y}
   */
  _drawSnakeHead(x, y, direction) {
    const eyeSize = 4;
    const eyeOffset = 4;
    const pupilSize = 2;
    const centerOffset = this.gridSize / 2;

    // 眼白颜色
    this.ctx.fillStyle = '#ffffff';

    // 根据方向计算眼睛位置
    let leftEyeX, leftEyeY, rightEyeX, rightEyeY;

    if (direction.x === 1) { // 向右
      leftEyeX = x + centerOffset - 1;
      leftEyeY = y + eyeOffset;
      rightEyeX = x + centerOffset - 1;
      rightEyeY = y + this.gridSize - eyeOffset - eyeSize;
    } else if (direction.x === -1) { // 向左
      leftEyeX = x + eyeOffset;
      leftEyeY = y + eyeOffset;
      rightEyeX = x + eyeOffset;
      rightEyeY = y + this.gridSize - eyeOffset - eyeSize;
    } else if (direction.y === -1) { // 向上
      leftEyeX = x + eyeOffset;
      leftEyeY = y + eyeOffset;
      rightEyeX = x + this.gridSize - eyeOffset - eyeSize;
      rightEyeY = y + eyeOffset;
    } else { // 向下
      leftEyeX = x + eyeOffset;
      leftEyeY = y + centerOffset - 1;
      rightEyeX = x + this.gridSize - eyeOffset - eyeSize;
      rightEyeY = y + centerOffset - 1;
    }

    // 绘制左眼
    this.ctx.fillRect(leftEyeX, leftEyeY, eyeSize, eyeSize);
    // 绘制右眼
    this.ctx.fillRect(rightEyeX, rightEyeY, eyeSize, eyeSize);

    // 绘制瞳孔（朝向移动方向）
    this.ctx.fillStyle = '#000000';
    const pupilOffset = 1;

    if (direction.x === 1) { // 向右
      this.ctx.fillRect(leftEyeX + eyeSize - pupilSize - pupilOffset, leftEyeY + pupilOffset, pupilSize, pupilSize);
      this.ctx.fillRect(rightEyeX + eyeSize - pupilSize - pupilOffset, rightEyeY + pupilOffset, pupilSize, pupilSize);
    } else if (direction.x === -1) { // 向左
      this.ctx.fillRect(leftEyeX + pupilOffset, leftEyeY + pupilOffset, pupilSize, pupilSize);
      this.ctx.fillRect(rightEyeX + pupilOffset, rightEyeY + pupilOffset, pupilSize, pupilSize);
    } else if (direction.y === -1) { // 向上
      this.ctx.fillRect(leftEyeX + pupilOffset, leftEyeY + pupilOffset, pupilSize, pupilSize);
      this.ctx.fillRect(rightEyeX + pupilOffset, rightEyeY + pupilOffset, pupilSize, pupilSize);
    } else { // 向下
      this.ctx.fillRect(leftEyeX + pupilOffset, leftEyeY + eyeSize - pupilSize - pupilOffset, pupilSize, pupilSize);
      this.ctx.fillRect(rightEyeX + pupilOffset, rightEyeY + eyeSize - pupilSize - pupilOffset, pupilSize, pupilSize);
    }
  }

  /**
   * 绘制食物
   * @param {Object} foodPosition - 食物坐标
   * @param {Object} animation - 食物动画状态 {active, scale, alpha, frame}
   */
  drawFood(foodPosition, animation = null) {
    // 如果有动画管理器，获取动画状态
    if (this.animationManager && this.animationManager.hasFoodAnimation()) {
      const anim = this.animationManager.getFoodAnimation();
      const x = anim.x * this.gridSize;
      const y = anim.y * this.gridSize;

      this.ctx.save();
      const centerX = x + this.gridSize / 2;
      const centerY = y + this.gridSize / 2;
      const baseRadius = (this.gridSize / 2) - 2;

      this.ctx.translate(centerX, centerY);
      this.ctx.scale(anim.scale, anim.scale);
      this.ctx.globalAlpha = anim.opacity;

      this.ctx.fillStyle = CONFIG.COLORS.FOOD;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, baseRadius, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
      return;
    }

    const x = foodPosition.x * this.gridSize;
    const y = foodPosition.y * this.gridSize;

    // 应用动画效果
    let scale = 1;
    let alpha = 1;

    if (animation && animation.active) {
      scale = animation.scale;
      alpha = animation.alpha;
    }

    // 计算缩放后的尺寸
    const centerX = x + this.gridSize / 2;
    const centerY = y + this.gridSize / 2;
    const radius = ((this.gridSize / 2) - 2) * scale;

    this.ctx.save();
    this.ctx.globalAlpha = alpha;

    // 绘制脉冲发光效果
    if (!animation || !animation.active) {
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = CONFIG.COLORS.FOOD;
    }

    this.ctx.fillStyle = CONFIG.COLORS.FOOD;

    // 绘制圆形食物
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  /**
   * 触发食物被吃动画
   */
  triggerFoodAnimation() {
    this.foodAnimation = {
      active: true,
      scale: 1.5,
      alpha: 1,
      frame: 0
    };
  }

  /**
   * 更新食物动画
   * @returns {boolean} 动画是否结束
   */
  updateFoodAnimation() {
    if (!this.foodAnimation.active) return true;

    this.foodAnimation.frame++;

    // 动画：缩放放大然后缩小，透明度降低
    if (this.foodAnimation.frame < 5) {
      this.foodAnimation.scale = 1 + this.foodAnimation.frame * 0.2;
    } else if (this.foodAnimation.frame < 15) {
      this.foodAnimation.scale = 1.8 - (this.foodAnimation.frame - 5) * 0.15;
      this.foodAnimation.alpha = 1 - (this.foodAnimation.frame - 5) * 0.1;
    } else {
      this.foodAnimation.active = false;
      this.foodAnimation.scale = 1;
      this.foodAnimation.alpha = 1;
      return true;
    }

    return false;
  }

  /**
   * 触发得分动画
   */
  triggerScoreAnimation() {
    this.scoreAnimation = {
      active: true,
      scale: 1.5,
      frame: 0
    };
  }

  /**
   * 更新得分动画
   * @returns {boolean} 动画是否结束
   */
  updateScoreAnimation() {
    if (!this.scoreAnimation.active) return true;

    this.scoreAnimation.frame++;

    // 弹跳动画：放大后恢复
    if (this.scoreAnimation.frame < 10) {
      this.scoreAnimation.scale = 1 + Math.sin(this.scoreAnimation.frame * Math.PI / 10) * 0.3;
    } else {
      this.scoreAnimation.active = false;
      this.scoreAnimation.scale = 1;
      return true;
    }

    return false;
  }

  /**
   * 绘制分数
   * @param {number} score - 当前分数
   * @param {number} highScore - 最高分
   * @param {Object} animation - 得分动画状态 {active, scale, frame}
   */
  drawScore(score, highScore, animation = null) {
    let scale = 1;
    let textColor = CONFIG.COLORS.TEXT;

    if (animation && animation.active) {
      scale = animation.scale;
      // 动画时颜色闪烁
      textColor = animation.frame % 4 < 2 ? '#00ff00' : CONFIG.COLORS.TEXT;
    }

    this.ctx.save();
    this.ctx.fillStyle = textColor;

    // 应用缩放
    const baseFontSize = 20;
    const fontSize = baseFontSize * scale;
    this.ctx.font = `${fontSize}px Arial`;
    this.ctx.textAlign = 'left';

    // 当前分数
    this.ctx.fillText(`分数: ${score}`, 10, 30);

    // 最高分
    this.ctx.textAlign = 'right';
    this.ctx.font = `${baseFontSize}px Arial`;
    this.ctx.fillStyle = CONFIG.COLORS.TEXT;
    this.ctx.fillText(`最高分: ${highScore}`, this.canvas.width - 10, 30);

    this.ctx.restore();
  }

  /**
   * 绘制速度条
   * @param {number} level - 当前速度等级
   * @param {number} maxLevel - 最大速度等级
   */
  drawSpeedBar(level, maxLevel) {
    const barWidth = 150;
    const barHeight = 12;
    const barX = 10;
    const barY = 45;

    // 速度等级文字
    this.ctx.fillStyle = CONFIG.COLORS.TEXT;
    this.ctx.font = '14px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`速度: Lv.${level}`, barX, barY - 3);

    // 背景条
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.fillRect(barX, barY, barWidth, barHeight);

    // 进度条
    const percentage = level / maxLevel;
    const gradient = this.ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
    
    // 根据速度等级设置颜色（绿色->黄色->红色）
    if (percentage < 0.5) {
      gradient.addColorStop(0, '#00ff00');
      gradient.addColorStop(1, '#88ff00');
    } else if (percentage < 0.8) {
      gradient.addColorStop(0, '#88ff00');
      gradient.addColorStop(1, '#ffff00');
    } else {
      gradient.addColorStop(0, '#ffff00');
      gradient.addColorStop(1, '#ff4444');
    }
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(barX, barY, barWidth * percentage, barHeight);

    // 边框
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(barX, barY, barWidth, barHeight);
  }

  /**
   * 渲染得分飘字动画
   */
  renderScorePopups() {
    if (!this.animationManager) return;

    const popups = this.animationManager.getScorePopups();
    popups.forEach(popup => {
      this.ctx.save();
      this.ctx.globalAlpha = popup.opacity;
      this.ctx.fillStyle = '#ffff00';
      this.ctx.font = 'bold 24px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('+10', popup.x, popup.y - popup.offsetY);
      this.ctx.restore();
    });
  }

  /**
   * 应用屏幕抖动
   */
  applyScreenShake() {
    if (!this.animationManager) return;

    const shake = this.animationManager.getScreenShakeOffset();
    if (shake.offsetX !== 0 || shake.offsetY !== 0) {
      this.ctx.save();
      this.ctx.translate(shake.offsetX, shake.offsetY);
    }
  }

  /**
   * 恢复屏幕抖动
   */
  restoreScreenShake() {
    if (!this.animationManager) return;

    const shake = this.animationManager.getScreenShakeOffset();
    if (shake.offsetX !== 0 || shake.offsetY !== 0) {
      this.ctx.restore();
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
   * 渲染完整游戏画面
   * @param {Array} snakeBody - 蛇身
   * @param {Object} foodPosition - 食物位置
   * @param {number} score - 当前分数
   * @param {number} highScore - 最高分
   * @param {string} status - 游戏状态
   * @param {Object} direction - 蛇移动方向
   */
  render(snakeBody, foodPosition, score, highScore, status, direction = { x: 1, y: 0 }) {
    this.applyScreenShake();
    
    this.clear();
    this.drawGrid();
    this.drawSnake(snakeBody, direction);
    this.drawFood(foodPosition, this.foodAnimation);
    this.drawScore(score, highScore, this.scoreAnimation);
    this.renderScorePopups();

    // 根据状态绘制额外内容
    if (status === 'paused') {
      this.drawPause();
    } else if (status === 'gameover') {
      this.drawGameOver(score);
    }
    
    this.restoreScreenShake();
  }
}
