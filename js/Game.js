import { Renderer } from './Renderer.js';
import { Snake } from './Snake.js';
import { Food } from './Food.js';
import { InputHandler } from './InputHandler.js';
import { ScoreManager } from './ScoreManager.js';
import { AnimationManager } from './AnimationManager.js';

/**
 * 游戏主类
 * 管理游戏循环、状态和核心逻辑
 */
export class Game {
  constructor() {
    // 游戏状态
    this.status = 'start'; // start, playing, paused, gameover
    this.lastTime = 0;
    this.accumulatedTime = 0;

    // 初始化各个子系统
    this.renderer = new Renderer('gameCanvas');
    this.snake = new Snake();
    this.food = new Food();
    this.inputHandler = new InputHandler();
    this.scoreManager = new ScoreManager();
    this.animationManager = new AnimationManager();

    // 集成动画管理器到渲染器
    this.renderer.setAnimationManager(this.animationManager);

    // 设置回调
    this._setupCallbacks();

    // 渲染初始画面
    this._render();
  }

  /**
   * 设置输入处理器回调
   */
  _setupCallbacks() {
    this.inputHandler.on('togglePause', () => this._togglePauseHandler());
    this.inputHandler.on('pause', () => this.pause());
    this.inputHandler.on('resume', () => this.resume());
    this.inputHandler.on('restart', () => this.restart());
  }

  /**
   * 处理暂停/继续切换
   */
  _togglePauseHandler() {
    if (this.status === 'playing') {
      this.pause();
    } else if (this.status === 'paused') {
      this.resume();
    }
  }

  /**
   * 开始游戏
   */
  start() {
    if (this.status === 'start') {
      this.status = 'playing';
      this.lastTime = performance.now();
      this.gameLoop();
    }
  }

  /**
   * 游戏主循环
   * @param {number} timestamp - 时间戳
   */
  gameLoop(timestamp = 0) {
    if (this.status !== 'playing') {
      return;
    }

    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    // 更新动画系统
    this.animationManager.update(deltaTime);

    // 使用动态速度（根据速度等级）
    const speed = this.scoreManager.getCurrentInterval();
    this.accumulatedTime += deltaTime;

    // 根据速度更新游戏
    while (this.accumulatedTime >= speed) {
      this.update();
      this.accumulatedTime -= speed;
    }

    // 渲染
    this._render();

    // 继续循环
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  /**
   * 更新游戏状态
   */
  update() {
    // 处理输入方向
    const newDirection = this.inputHandler.getNextDirection();
    if (newDirection) {
      this.snake.setDirection(newDirection);
    }

    // 移动蛇
    const ateFood = this.snake.checkEatFood(this.food.getPosition());
    this.snake.move(ateFood);

    // 检查碰撞
    if (this.snake.checkCollisionWall() || this.snake.checkCollisionSelf()) {
      // 触发游戏结束屏幕抖动
      this.animationManager.triggerScreenShake();
      this.gameOver();
      return;
    }

    // 处理吃食物
    if (ateFood) {
      // 触发食物消失动画
      const foodPos = this.food.getPosition();
      this.animationManager.createFoodEatenAnimation(foodPos.x, foodPos.y);

      this.scoreManager.addScore();
      this.scoreManager.onFoodEaten();  // 更新速度等级

      // 生成新食物并触发动画
      this.food.generate(this.snake.getBody());
      const newFoodPos = this.food.getPosition();
      this.animationManager.createFoodAppearAnimation(newFoodPos.x, newFoodPos.y);

      // 触发得分飘字动画
      this.animationManager.createScorePopup(
        this.renderer.canvas.width / 2,
        this.renderer.canvas.height / 2
      );
    }
  }

  /**
   * 渲染游戏画面
   */
  _render() {
    this.renderer.render(
      this.snake.getBody(),
      this.food.getPosition(),
      this.scoreManager.getScore(),
      this.scoreManager.getHighScore(),
      this.status
    );
  }

  /**
   * 暂停游戏
   */
  pause() {
    if (this.status === 'playing') {
      this.status = 'paused';
      this.inputHandler.setPaused(true);
      this._render();
    }
  }

  /**
   * 继续游戏
   */
  resume() {
    if (this.status === 'paused') {
      this.status = 'playing';
      this.inputHandler.setPaused(false);
      this.lastTime = performance.now();
      this.accumulatedTime = 0;
      this.gameLoop();
    }
  }

  /**
   * 游戏结束
   */
  gameOver() {
    this.status = 'gameover';
    this._render();
  }

  /**
   * 重新开始游戏
   */
  restart() {
    // 重置蛇
    this.snake.reset();
    // 重置分数
    this.scoreManager.resetScore();
    // 生成新食物
    this.food.generate(this.snake.getBody());
    // 重置状态
    this.status = 'playing';
    this.lastTime = performance.now();
    this.accumulatedTime = 0;
    // 开始循环
    this.gameLoop();
  }

  /**
   * 设置难度
   * @param {string} difficulty - 难度名称
   */
  setDifficulty(difficulty) {
    const success = this.scoreManager.setDifficulty(difficulty);
    if (success) {
      console.log(`Difficulty set to: ${difficulty}`);
    }
    return success;
  }

  /**
   * 获取游戏状态
   * @returns {string} 游戏状态
   */
  getStatus() {
    return this.status;
  }

  /**
   * 显示开始界面
   */
  showStartScreen() {
    this.status = 'start';
    this._renderStartScreen();
  }

  /**
   * 渲染开始界面
   */
  _renderStartScreen() {
    const ctx = this.renderer.ctx;
    const canvas = this.renderer.canvas;

    // 清空画布
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 标题
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🐍 贪吃蛇', canvas.width / 2, canvas.height / 2 - 80);

    // 最高分
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText(`最高分: ${this.scoreManager.getHighScore()}`, canvas.width / 2, canvas.height / 2);

    // 难度选择提示
    ctx.font = '18px Arial';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText('选择难度:', canvas.width / 2, canvas.height / 2 + 60);

    // 难度按钮
    ctx.fillStyle = '#ffffff';
    ctx.fillText('[1] 简单  [2] 普通  [3] 困难', canvas.width / 2, canvas.height / 2 + 100);

    // 开始提示
    ctx.fillStyle = '#00ff00';
    ctx.font = '20px Arial';
    ctx.fillText('按空格键开始游戏', canvas.width / 2, canvas.height / 2 + 160);
  }
}

// 导出为全局变量供 HTML 使用
window.SnakeGame = Game;

// 注意：Snake 类已移至独立的 Snake.js 文件，通过 import 引入
// Issue #21: 已确认无重复类定义
