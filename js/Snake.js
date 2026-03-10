import { CONFIG } from './config.js';

/**
 * 蛇类
 * 管理蛇的移动、生长和碰撞检测
 */
export class Snake {
  constructor() {
    this.body = this._createInitialBody();
    this.direction = { ...CONFIG.SNAKE.INITIAL_DIRECTION };
    this.nextDirection = { ...CONFIG.SNAKE.INITIAL_DIRECTION };
  }

  /**
   * 创建初始蛇身
   * @returns {Array} 初始蛇身坐标数组
   */
  _createInitialBody() {
    const body = [];
    const startX = 5;
    const startY = 10;

    for (let i = 0; i < CONFIG.SNAKE.INITIAL_LENGTH; i++) {
      body.push({
        x: startX - i,
        y: startY
      });
    }

    return body;
  }

  /**
   * 设置新的移动方向
   * @param {Object} newDirection - 新方向 {x, y}
   */
  setDirection(newDirection) {
    // 防止 180° 急转
    const currentDirection = this.direction;
    if (currentDirection.x + newDirection.x === 0 &&
        currentDirection.y + newDirection.y === 0) {
      return; // 忽略反向指令
    }

    this.nextDirection = newDirection;
  }

  /**
   * 移动蛇
   * @param {boolean} grow - 是否生长（吃食物）
   */
  move(grow = false) {
    // 应用下一个方向
    this.direction = { ...this.nextDirection };

    // 计算新的头部位置
    const head = this.body[0];
    const newHead = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y
    };

    // 将新头部加入数组开头
    this.body.unshift(newHead);

    // 如果不吃食物，移除尾部
    if (!grow) {
      this.body.pop();
    }
  }

  /**
   * 让蛇生长（吃食物后调用）
   */
  grow() {
    // 已经在 move(grow=true) 中处理
  }

  /**
   * 检查是否撞墙
   * @returns {boolean} 是否撞墙
   */
  checkCollisionWall() {
    const head = this.body[0];
    const gridWidth = CONFIG.CANVAS.WIDTH / CONFIG.CANVAS.GRID_SIZE;
    const gridHeight = CONFIG.CANVAS.HEIGHT / CONFIG.CANVAS.GRID_SIZE;

    return head.x < 0 || head.x >= gridWidth ||
           head.y < 0 || head.y >= gridHeight;
  }

  /**
   * 检查是否撞到自己
   * @returns {boolean} 是否自碰撞
   */
  checkCollisionSelf() {
    const head = this.body[0];

    // 从第 3 段开始检查（不可能撞到前 2 段）
    for (let i = 3; i < this.body.length; i++) {
      if (this.body[i].x === head.x && this.body[i].y === head.y) {
        return true;
      }
    }

    return false;
  }

  /**
   * 检查是否吃到食物
   * @param {Object} foodPosition - 食物位置
   * @returns {boolean} 是否吃到食物
   */
  checkEatFood(foodPosition) {
    const head = this.body[0];
    return head.x === foodPosition.x && head.y === foodPosition.y;
  }

  /**
   * 获取蛇身
   * @returns {Array} 蛇身坐标数组
   */
  getBody() {
    return this.body;
  }

  /**
   * 获取头部位置
   * @returns {Object} 头部坐标
   */
  getHead() {
    return this.body[0];
  }

  /**
   * 获取当前方向名称
   * @returns {string} 方向名称 (UP, DOWN, LEFT, RIGHT)
   */
  getDirectionName() {
    if (this.direction.x === 0 && this.direction.y === -1) return 'UP';
    if (this.direction.x === 0 && this.direction.y === 1) return 'DOWN';
    if (this.direction.x === -1 && this.direction.y === 0) return 'LEFT';
    if (this.direction.x === 1 && this.direction.y === 0) return 'RIGHT';
    return 'RIGHT';
  }

  /**
   * 重置蛇
   */
  reset() {
    this.body = this._createInitialBody();
    this.direction = { ...CONFIG.SNAKE.INITIAL_DIRECTION };
    this.nextDirection = { ...CONFIG.SNAKE.INITIAL_DIRECTION };
  }
}
