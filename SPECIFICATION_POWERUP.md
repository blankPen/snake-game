# 技术方案：道具系统

## 1. 需求概述

在游戏中添加随机道具，提升游戏趣味性和策略性。

## 2. 项目结构

```
js/
├── Game.js           # 需修改：集成道具逻辑
├── Food.js           # 需重构：支持食物/道具多类型
├── config.js         # 需添加：道具配置
├── PowerUpManager.js # 新增：道具管理器
└── Renderer.js       # 需修改：道具渲染

css/
└── style.css         # 需添加：道具样式

index.html            # 可能需要调整
```

## 3. 道具类型设计

| 道具 | 效果 | 持续时间 | 颜色 | 出现概率 |
|------|------|---------|------|---------|
| ⚡ 加速 | 速度提升 50% | 10s | 黄色 | 5% |
| 🐢 减速 | 速度降低 30% | 8s | 蓝色 | 5% |
| 🛡️ 护盾 | 免死一次 | 永久 | 紫色 | 3% |
| ✨ 双倍分 | 下一个食物 2x 分数 | 一次 | 金色 | 8% |

## 4. 架构设计

### 4.1 PowerUpManager

```javascript
// js/PowerUpManager.js
export class PowerUpManager {
  constructor() {
    this.activePowerUps = new Map();  // 激活的道具
  }
  
  // 生成随机道具
  generate(snakeBody, foodPosition) { ... }
  
  // 应用道具效果
  apply(powerUp, game) { ... }
  
  // 移除道具效果
  remove(powerUpId) { ... }
  
  // 更新道具状态（倒计时）
  update(deltaTime) { ... }
  
  // 获取当前激活的道具
  getActivePowerUps() { ... }
}
```

### 4.2 Food 扩展

```javascript
// js/Food.js 修改
export class Food {
  constructor() {
    this.position = null;
    this.type = 'normal';  // normal, power-up
    this.powerUpType = null;  // speed-up, slow-down, shield, double-score
  }
  
  generate(snakeBody, powerUpManager = null) { ... }
}
```

### 4.3 Game 集成

```javascript
// js/Game.js 修改
export class Game {
  constructor() {
    // ... 现有初始化
    this.powerUpManager = new PowerUpManager();
  }
  
  // 修改 update 方法处理道具
  update() {
    // ... 现有逻辑
    this.powerUpManager.update(this.lastTime - currentTime);
  }
}
```

## 5. 接口设计

### 5.1 道具效果接口

```javascript
// 道具效果定义
const POWER_UPS = {
  'speed-up': {
    name: '⚡ 加速',
    duration: 10000,  // ms
    onApply: (game) => {
      game.setSpeedMultiplier(1.5);
    },
    onRemove: (game) => {
      game.setSpeedMultiplier(1);
    }
  },
  'shield': {
    name: '🛡️ 护盾',
    duration: Infinity,  // 永久
    onApply: (game) => {
      game.hasShield = true;
    },
    onRemove: (game) => {
      game.hasShield = false;
    }
  }
  // ...
};
```

### 5.2 道具碰撞检测

```javascript
// 在 Game.update() 中
if (this.snake.checkCollision(this.food.position)) {
  if (this.food.type === 'power-up') {
    this.powerUpManager.apply(this.food.powerUpType, this);
  } else {
    // 正常吃食物逻辑
  }
}
```

## 6. 配置扩展

```javascript
// js/config.js 新增
export const CONFIG = {
  // ... 现有配置
  POWER_UPS: {
    SPAWN_CHANCE: 0.15,      // 15% 概率生成道具
    TYPES: {
      'speed-up': { chance: 0.05, duration: 10000, color: '#ffd700' },
      'slow-down': { chance: 0.05, duration: 8000, color: '#4169e1' },
      'shield': { chance: 0.03, duration: Infinity, color: '#9370db' },
      'double-score': { chance: 0.08, duration: 1, color: '#ffdf00' }
    }
  }
};
```

## 7. 子任务拆分

| 序号 | 任务 | 建议负责人 | 预估工时 | 依赖 |
|------|------|-----------|---------|------|
| 1 | 扩展 config.js 添加道具配置 | Alpha | 0.5h | 无 |
| 2 | 创建 PowerUpManager.js | Alpha | 2h | 任务1 |
| 3 | 扩展 Food.js 支持道具类型 | Alpha | 1.5h | 任务1 |
| 4 | 修改 Game.js 集成道具逻辑 | Alpha | 1.5h | 任务2,3 |
| 5 | 修改 Renderer.js 渲染道具 | Beta | 1h | 任务3 |
| 6 | 添加道具 CSS 样式 | Beta | 0.5h | 无 |
| 7 | 测试道具功能 | QA | 2h | 任务4 |

**预估总工时：9h**

## 8. 风险评估

| 风险 | 影响 | 应对方案 |
|------|------|---------|
| 道具生成位置与蛇重叠 | 低 | 重新随机生成位置 |
| 多个道具同时生效 | 中 | 使用 Map 管理，可叠加 |
| 护盾道具逻辑复杂度 | 中 | 仅处理撞墙/自撞两种情况 |

## 9. 验收标准

- [ ] 四种道具可正常生成
- [ ] 加速/减速道具正确改变游戏速度
- [ ] 护盾可抵挡一次死亡
- [ ] 双倍分数道具正确计算得分
- [ ] 道具效果有倒计时显示
- [ ] 道具在界面上有视觉区分
