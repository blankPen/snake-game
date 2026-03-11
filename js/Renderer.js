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
   * 格式化时长
   * @param {number} ms - 毫秒
   * @returns {string} 格式化后的时长
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
   * 绘制游戏结束画面
   * @param {number} score - 最终分数
   * @param {Object} stats - 游戏统计数据
   */
  drawGameOver(score, stats = {}) {
    // 半透明遮罩
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    let yOffset = this.canvas.height / 2 - 80;

    // 游戏结束文字
    this.ctx.fillStyle = '#ff4444';
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('游戏结束', this.canvas.width / 2, yOffset);

    // 分数
    this.ctx.fillStyle = CONFIG.COLORS.TEXT;
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`最终分数: ${score}`, this.canvas.width / 2, yOffset + 50);

    // 统计数据
    if (stats.duration !== undefined) {
      this.ctx.font = '16px Arial';
      this.ctx.fillStyle = '#cccccc';
      const statsLines = [
        `游戏时长: ${this.formatDuration(stats.duration)}`,
        `吃到食物: ${stats.foodEaten} 个`,
        `最大长度: ${stats.maxLength}`,
        `平均速度: ${stats.avgSpeed} 次/秒`,
        `操作次数: ${stats.totalMoves}`
      ];

      yOffset += 90;
      statsLines.forEach((line, index) => {
        this.ctx.fillText(line, this.canvas.width / 2, yOffset + (index * 24));
      });

      // 调整提示位置
      yOffset += statsLines.length * 24 + 20;
    } else {
      yOffset += 90;
    }

    // 提示
    this.ctx.font = '18px Arial';
    this.ctx.fillStyle = '#aaaaaa';
    this.ctx.fillText('按 R 键重新开始', this.canvas.width / 2, yOffset + 30);
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
   * @param {Object} stats - 游戏统计数据（可选）
   */
  render(snakeBody, foodPosition, score, highScore, status, stats = {}) {
    this.clear();
    this.drawGrid();
    this.drawSnake(snakeBody);
    this.drawFood(foodPosition);
    this.drawScore(score, highScore);

    // 根据状态绘制额外内容
    if (status === 'paused') {
      this.drawPause();
    } else if (status === 'gameover') {
      this.drawGameOver(score, stats);
    }
  }
}
