/**
 * QA 测试脚本
 * 测试贪吃蛇游戏的核心逻辑
 */

import { Snake } from '../js/Snake.js';
import { Food } from '../js/Food.js';
import { ScoreManager } from '../js/ScoreManager.js';
import { CONFIG } from '../js/config.js';

class QATest {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.issues = [];
  }

  assert(condition, testName, description) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      this.passed++;
    } else {
      console.log(`❌ FAIL: ${testName}`);
      console.log(`   Description: ${description}`);
      this.failed++;
      this.issues.push({ test: testName, description });
    }
  }

  runAll() {
    console.log('=== 开始 QA 测试 ===\n');
    this.testSnake();
    this.testFood();
    this.testScoreManager();
    this.testGameLogic();
    console.log('\n=== 测试完成 ===');
    console.log(`通过: ${this.passed}`);
    console.log(`失败: ${this.failed}`);
    if (this.issues.length > 0) {
      console.log('\n=== 问题列表 ===');
      this.issues.forEach((issue, i) => {
        console.log(`${i + 1}. ${issue.test}: ${issue.description}`);
      });
    }
    return this.failed === 0;
  }

  // 蛇类测试
  testSnake() {
    console.log('--- 测试 Snake 类 ---');
    const snake = new Snake();

    // 测试 1: 初始长度
    this.assert(
      snake.getBody().length === CONFIG.SNAKE.INITIAL_LENGTH,
      '蛇初始长度',
      `期望 ${CONFIG.SNAKE.INITIAL_LENGTH}，实际 ${snake.getBody().length}`
    );

    // 测试 2: 初始位置连续
    const body = snake.getBody();
    for (let i = 0; i < body.length - 1; i++) {
      this.assert(
        Math.abs(body[i].x - body[i + 1].x) + Math.abs(body[i].y - body[i + 1].y) === 1,
        `蛇身第 ${i} 段和第 ${i + 1} 段相邻`,
        `坐标不连续: (${body[i].x},${body[i].y}) -> (${body[i + 1].x},${body[i + 1].y})`
      );
    }

    // 测试 3: 蛇可以移动
    const oldHead = snake.getHead();
    snake.move(false);
    const newHead = snake.getHead();
    this.assert(
      oldHead.x + snake.direction.x === newHead.x && oldHead.y + snake.direction.y === newHead.y,
      '蛇向初始方向移动',
      `期望移动 (${oldHead.x + snake.direction.x}, ${oldHead.y + snake.direction.y})，实际 (${newHead.x}, ${newHead.y})`
    );

    // 测试 4: 吃食物后蛇身增长
    const lengthBeforeEat = snake.getBody().length;
    snake.move(true);
    const lengthAfterEat = snake.getBody().length;
    this.assert(
      lengthAfterEat === lengthBeforeEat + 1,
      '吃食物后蛇身增长',
      `期望 ${lengthBeforeEat + 1}，实际 ${lengthAfterEat}`
    );

    // 测试 5: 防止 180° 急转 - 从 UP 到 DOWN
    snake.reset();
    snake.setDirection(CONFIG.DIRECTIONS.UP);
    snake.move(false); // 应用 UP 方向
    snake.setDirection(CONFIG.DIRECTIONS.DOWN);
    snake.move(false); // 应用 DOWN 应该被拒绝，仍然保持 UP
    this.assert(
      snake.direction.x === 0 && snake.direction.y === -1,
      '防止从 UP 到 DOWN 急转',
      '向下时尝试向上应被忽略'
    );

    // 测试 6: 撞墙检测
    snake.reset();
    // 将蛇移到墙边
    snake.body = [{ x: -1, y: 10 }, { x: 0, y: 10 }, { x: 1, y: 10 }];
    this.assert(
      snake.checkCollisionWall(),
      '检测撞墙（左边界）',
      '蛇头在 -1 应检测到撞墙'
    );

    // 测试 7: 自碰撞检测
    snake.reset();
    // 构造一个自己缠绕的蛇
    snake.body = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
      { x: 11, y: 12 },
      { x: 11, y: 11 },
      { x: 11, y: 10 },
      { x: 10, y: 10 }  // 头部会撞到尾部
    ];
    snake.direction = { x: 0, y: -1 };
    snake.nextDirection = { x: 0, y: -1 };
    this.assert(
      snake.checkCollisionSelf(),
      '检测自碰撞',
      '蛇头即将撞到蛇身应检测到碰撞'
    );
  }

  // 食物类测试
  testFood() {
    console.log('\n--- 测试 Food 类 ---');
    const food = new Food();

    // 测试 8: 食物位置在画布内
    const pos = food.getPosition();
    const gridWidth = CONFIG.CANVAS.WIDTH / CONFIG.CANVAS.GRID_SIZE;
    const gridHeight = CONFIG.CANVAS.HEIGHT / CONFIG.CANVAS.GRID_SIZE;
    this.assert(
      pos.x >= 0 && pos.x < gridWidth && pos.y >= 0 && pos.y < gridHeight,
      '食物位置在画布内',
      `位置 (${pos.x}, ${pos.y}) 超出画布范围 (${gridWidth}x${gridHeight})`
    );

    // 测试 9: 食物不在蛇身上
    const snakeBody = [{ x: 10, y: 10 }, { x: 11, y: 10 }, { x: 12, y: 10 }];
    for (let i = 0; i < 10; i++) {
      food.generate(snakeBody);
      const newPos = food.getPosition();
      const onSnake = snakeBody.some(seg => seg.x === newPos.x && seg.y === newPos.y);
      this.assert(
        !onSnake,
        `食物不在蛇身上（尝试 ${i + 1}）`,
        `位置 (${newPos.x}, ${newPos.y}) 与蛇身重合`
      );
    }

    // 测试 10: 检查吃食物
    const testSnake = new Snake();
    testSnake.body = [{ x: 5, y: 5 }];
    food.position = { x: 5, y: 5 };
    this.assert(
      testSnake.checkEatFood(food.getPosition()),
      '检测吃食物',
      '蛇头与食物在同一位置应返回 true'
    );
  }

  // 分数管理器测试
  testScoreManager() {
    console.log('\n--- 测试 ScoreManager 类 ---');
    const scoreManager = new ScoreManager();

    // 测试 11: 初始分数为 0
    this.assert(
      scoreManager.getScore() === 0,
      '初始分数为 0',
      `期望 0，实际 ${scoreManager.getScore()}`
    );

    // 测试 12: 增加分数
    scoreManager.addScore();
    this.assert(
      scoreManager.getScore() === 10,
      '增加分数（每次 10 分）',
      `期望 10，实际 ${scoreManager.getScore()}`
    );

    // 测试 13: 多次增加分数
    scoreManager.addScore();
    scoreManager.addScore();
    this.assert(
      scoreManager.getScore() === 30,
      '多次增加分数',
      `期望 30，实际 ${scoreManager.getScore()}`
    );

    // 测试 14: 重置分数
    scoreManager.resetScore();
    this.assert(
      scoreManager.getScore() === 0,
      '重置分数',
      `期望 0，实际 ${scoreManager.getScore()}`
    );

    // 测试 15: 难度设置
    this.assert(
      scoreManager.setDifficulty('easy'),
      '设置难度为 easy',
      '应返回 true'
    );
    this.assert(
      scoreManager.getDifficulty() === 'easy',
      '获取当前难度',
      `期望 easy，实际 ${scoreManager.getDifficulty()}`
    );

    // 测试 16: 无效难度
    this.assert(
      !scoreManager.setDifficulty('invalid'),
      '拒绝无效难度',
      '应返回 false'
    );

    // 测试 17: 难度配置
    const config = scoreManager.getDifficultyConfig();
    this.assert(
      config && typeof config.speed === 'number',
'获取难度配置',
      `期望包含 speed 属性，实际 ${JSON.stringify(config)}`
    );
  }

  // 游戏逻辑综合测试
  testGameLogic() {
    console.log('\n--- 测试游戏综合逻辑 ---');
    const snake = new Snake();
    const food = new Food();
    const scoreManager = new ScoreManager();

    // 测试 18: 完整游戏循环（模拟）
    let score = 0;
    for (let i = 0; i < 10; i++) {
      // 移动蛇
      if (snake.checkEatFood(food.getPosition())) {
        snake.move(true);
        scoreManager.addScore();
        food.generate(snake.getBody());
      } else {
        snake.move(false);
      }
    }
    this.assert(
      snake.getBody().length >= CONFIG.SNAKE.INITIAL_LENGTH,
      '游戏循环后蛇身长度正常',
      `期望至少 ${CONFIG.SNAKE.INITIAL_LENGTH}，实际 ${snake.getBody().length}`
    );

    // 测试 19: 方向快速切换问题（经典 bug）
    // 如果在两个渲染帧之间快速按右、上、左，蛇应该：
    // 1. 下一帧向上
    // 2. 再下一帧向左
    // 但如果实现不当，蛇可能直接向左（跳过向上）或保持向右
    const testSnake = new Snake();
    // 确保初始方向是向右
    testSnake.direction = { ...CONFIG.DIRECTIONS.RIGHT };
    testSnake.nextDirection = { ...CONFIG.DIRECTIONS.RIGHT };
    
    // 模拟快速按上、左（在同一帧内）
    testSnake.setDirection(CONFIG.DIRECTIONS.UP);
    testSnake.setDirection(CONFIG.DIRECTIONS.LEFT);
    
    // 移动一次 - 应该使用 LEFT（最后一次 setDirection 的结果）
    testSnake.move(false);
    this.assert(
      testSnake.direction.x === -1 && testSnake.direction.y === 0,
      '方向快速切换使用最后输入',
      `期望向左，实际 (${testSnake.direction.x}, ${testSnake.direction.y})`
    );

    // 测试 20: 快速切换不应导致反向移动
    const testSnake2 = new Snake();
    testSnake2.direction = { ...CONFIG.DIRECTIONS.RIGHT };
    testSnake2.nextDirection = { ...CONFIG.DIRECTIONS.RIGHT };
    
    // 快速按左（反向），然后再按上
    testSnake2.setDirection(CONFIG.DIRECTIONS.LEFT);
    testSnake2.setDirection(CONFIG.DIRECTIONS.UP);
    
    // 下次移动应该是向上（LEFT 因为是反向被忽略）
    testSnake2.move(false);
    this.assert(
      testSnake2.direction.x === 0 && testSnake2.direction.y === -1,
      '反向输入被忽略，有效输入生效',
      `期望向上，实际 (${testSnake2.direction.x}, ${testSnake2.direction.y})`
    );
  }
}

// 运行测试
const tester = new QATest();
const allPassed = tester.runAll();

// 退出码
process.exit(allPassed ? 0 : 1);
