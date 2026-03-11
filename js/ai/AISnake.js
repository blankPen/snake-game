/**
 * AI 蛇决策引擎
 * 使用 A* 寻路算法进行决策
 */

import { AStar } from './AStar.js';
import { CONFIG } from '../config.js';

/**
 * AI 难度级别
 */
export const AI_LEVEL = {
  EASY: 'easy',     // 简单贪心
  NORMAL: 'normal', // A* + 基本生存
  HARD: 'hard'      // 完整策略
};

export class AISnake {
  constructor(level = AI_LEVEL.NORMAL) {
    this.level = level;
    this.pathfinder = new AStar(
      CONFIG.CANVAS.WIDTH / CONFIG.CANVAS.GRID_SIZE,
      CONFIG.CANVAS.HEIGHT / CONFIG.CANVAS.GRID_SIZE
    );
    this.currentPath = [];
    this.lastDecisionTime = 0;
    this.decisionInterval = 200; // 决策间隔（毫秒）
  }

  /**
   * 设置 AI 难度
   * @param {string} level - 难度级别
   */
  setLevel(level) {
    this.level = level;
  }

  /**
   * 决定移动方向
   * @param {Array} snakeBody - 蛇身数组
   * @param {Object} foodPosition - 食物位置
   * @param {number} currentTime - 当前时间
   * @returns {Object} 方向 {x, y}
   */
  decideMove(snakeBody, foodPosition, currentTime = 0) {
    // 限制决策频率
    if (currentTime - this.lastDecisionTime < this.decisionInterval) {
      if (this.currentPath && this.currentPath.length > 1) {
        return this._getNextDirectionFromPath(snakeBody[0], this.currentPath);
      }
    }
    
    this.lastDecisionTime = currentTime;
    
    const head = snakeBody[0];
    const obstacles = snakeBody.slice(1); // 除了头部都是障碍
    
    let direction;
    
    switch (this.level) {
      case AI_LEVEL.EASY:
        direction = this._greedyMove(head, foodPosition, obstacles);
        break;
      case AI_LEVEL.NORMAL:
        direction = this._astarMove(head, foodPosition, obstacles);
        break;
      case AI_LEVEL.HARD:
        direction = this._smartMove(head, foodPosition, snakeBody);
        break;
      default:
        direction = this._astarMove(head, foodPosition, obstacles);
    }
    
    return direction;
  }

  /**
   * 贪心算法（简单）
   */
  _greedyMove(head, food, obstacles) {
    const dx = food.x - head.x;
    const dy = food.y - head.y;
    
    // 优先选择减少距离的方向
    const directions = [];
    
    if (dx > 0) directions.push({ x: 1, y: 0 });
    if (dx < 0) directions.push({ x: -1, y: 0 });
    if (dy > 0) directions.push({ x: 0, y: 1 });
    if (dy < 0) directions.push({ x: 0, y: -1 });
    
    // 检查方向是否安全
    for (const dir of directions) {
      if (this._isSafe({ x: head.x + dir.x, y: head.y + dir.y }, obstacles)) {
        return dir;
      }
    }
    
    // 如果都危险，返回任意安全方向
    return this._getSafeRandomDirection(head, obstacles);
  }

  /**
   * A* 寻路
   */
  _astarMove(head, food, obstacles) {
    const path = this.pathfinder.findPath(head, food, obstacles);
    
    if (path && path.length > 1) {
      this.currentPath = path;
      return this._getNextDirectionFromPath(head, path);
    }
    
    // 如果找不到路径，使用贪心
    return this._greedyMove(head, food, obstacles);
  }

  /**
   * 智能模式（考虑生存）
   */
  _smartMove(head, food, snakeBody) {
    const obstacles = snakeBody.slice(1);
    
    // 首先尝试 A* 寻路
    let path = this.pathfinder.findPath(head, food, obstacles);
    
    if (path && path.length > 1) {
      // 检查路径是否安全（前面有足够空间）
      if (this._isPathSafe(path, snakeBody)) {
        this.currentPath = path;
        return this._getNextDirectionFromPath(head, path);
      }
    }
    
    // 如果路径不安全，使用尾随策略
    const tail = snakeBody[snakeBody.length - 1];
    path = this.pathfinder.findPath(head, tail, obstacles);
    
    if (path && path.length > 1) {
      return this._getNextDirectionFromPath(head, path);
    }
    
    // 最后使用贪心
    return this._greedyMove(head, food, obstacles);
  }

  /**
   * 从路径获取下一步方向
   */
  _getNextDirectionFromPath(head, path) {
    if (path.length < 2) return null;
    
    const next = path[1];
    return {
      x: next.x - head.x,
      y: next.y - head.y
    };
  }

  /**
   * 检查位置是否安全
   */
  _isSafe(position, obstacles) {
    // 检查边界
    const gridWidth = CONFIG.CANVAS.WIDTH / CONFIG.CANVAS.GRID_SIZE;
    const gridHeight = CONFIG.CANVAS.HEIGHT / CONFIG.CANVAS.GRID_SIZE;
    
    if (position.x < 0 || position.x >= gridWidth ||
        position.y < 0 || position.y >= gridHeight) {
      return false;
    }
    
    // 检查障碍
    for (const obs of obstacles) {
      if (position.x === obs.x && position.y === obs.y) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * 检查路径是否安全
   */
  _isPathSafe(path, snakeBody) {
    // 检查路径是否通向死胡同
    if (path.length < 3) return true;
    
    // 简单检查：路径末端是否有足够空间
    const endPoint = path[path.length - 1];
    const gridWidth = CONFIG.CANVAS.WIDTH / CONFIG.CANVAS.GRID_SIZE;
    const gridHeight = CONFIG.CANVAS.HEIGHT / CONFIG.CANVAS.GRID_SIZE;
    
    // 检查周围可移动方向数量
    let availableDirections = 0;
    const directions = [
      { x: 0, y: -1 }, { x: 0, y: 1 },
      { x: -1, y: 0 }, { x: 1, y: 0 }
    ];
    
    for (const dir of directions) {
      const x = endPoint.x + dir.x;
      const y = endPoint.y + dir.y;
      
      if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
        const isObstacle = snakeBody.some(s => s.x === x && s.y === y);
        if (!isObstacle) availableDirections++;
      }
    }
    
    return availableDirections >= 2;
  }

  /**
   * 获取安全的随机方向
   */
  _getSafeRandomDirection(head, obstacles) {
    const directions = [
      { x: 0, y: -1 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 1, y: 0 }
    ];
    
    // 随机打乱顺序
    for (let i = directions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [directions[i], directions[j]] = [directions[j], directions[i]];
    }
    
    for (const dir of directions) {
      if (this._isSafe({ x: head.x + dir.x, y: head.y + dir.y }, obstacles)) {
        return dir;
      }
    }
    
    return { x: 0, y: 0 }; // 无安全方向
  }
}
