import { CONFIG } from './config.js';

/**
 * 食物类
 * 管理食物的生成和位置
 */
export class Food {
  constructor() {
    this.position = { x: 0, y: 0 };
    this.generate([]);
  }

  /**
   * 生成食物的随机位置
   * @param {Array} snakeBody - 蛇身坐标数组
   */
  generate(snakeBody) {
    const gridWidth = CONFIG.CANVAS.WIDTH / CONFIG.CANVAS.GRID_SIZE;
    const gridHeight = CONFIG.CANVAS.HEIGHT / CONFIG.CANVAS.GRID_SIZE;

    let newFood;
    let attempts = 0;
    const maxAttempts = 100;

    do {
      newFood = {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight)
      };
      attempts++;
    } while (this._isOccupied(newFood, snakeBody) && attempts < maxAttempts);

    this.position = newFood;
  }

  /**
   * 检查位置是否被蛇身占用
   * @param {Object} position - 要检查的位置
   * @param {Array} snakeBody - 蛇身坐标数组
   * @returns {boolean} 是否占用
   */
  _isOccupied(position, snakeBody) {
    return snakeBody.some(segment =>
      segment.x === position.x && segment.y === position.y
    );
  }

  /**
   * 获取食物位置
   * @returns {Object} 食物坐标
   */
  getPosition() {
    return this.position;
  }
}
