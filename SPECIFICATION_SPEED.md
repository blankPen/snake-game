# 技术方案：速度渐变系统

## 1. 需求概述

实现动态难度系统，随着玩家分数提升，游戏速度逐渐加快，增加游戏挑战性。

## 2. 项目结构

```
js/
├── Game.js           # 需修改：集成速度控制
├── ScoreManager.js   # 需扩展：速度等级计算
├── config.js        # 需添加：速度配置
└── Renderer.js      # 需添加：速度条渲染

css/
└── style.css        # 需添加：速度条样式

index.html           # 需添加：速度条 DOM
```

## 3. 架构设计

### 3.1 速度等级计算

```
速度公式: interval = baseInterval - (level * step)
- baseInterval: 初始速度（根据难度）
- level: 当前等级（每 N 个食物升一级）
- step: 每级速度提升步长
```

### 3.2 速度等级参数

| 参数 | 值 | 说明 |
|------|-----|------|
| FOODS_PER_LEVEL | 3 | 每吃 N 个食物升一级 |
| MIN_INTERVAL | 30ms | 最小速度上限 |
| SPEED_STEP | 5ms | 每级速度提升步长 |
| MAX_LEVEL | 10 | 最大等级 |

## 4. 接口设计

### 4.1 ScoreManager 扩展

```javascript
// js/ScoreManager.js 扩展
export class ScoreManager {
  // 现有方法...
  
  // 新增：获取当前速度等级
  getSpeedLevel(): number
  
  // 新增：获取当前速度间隔
  getCurrentInterval(): number
  
  // 新增：吃到食物时调用，计算新等级
  onFoodEaten(): void
}
```

### 4.2 Game 修改

```javascript
// js/Game.js 修改
export class Game {
  // 修改 gameLoop 使用动态速度
  gameLoop(currentTime) {
    const interval = this.scoreManager.getCurrentInterval();
    // ...
  }
}
```

### 4.3 速度条渲染

```javascript
// js/Renderer.js 新增
export class Renderer {
  // 新增：渲染速度条
  renderSpeedBar(level, maxLevel) { ... }
}
```

## 5. 数据模型

无需新增持久化数据，速度等级仅在游戏内计算。

## 6. 配置扩展

```javascript
// js/config.js 新增
export const CONFIG = {
  // ... 现有配置
  SPEED_SYSTEM: {
    FOODS_PER_LEVEL: 3,
    MIN_INTERVAL: 30,
    SPEED_STEP: 5,
    MAX_LEVEL: 10
  }
};
```

## 7. 子任务拆分

| 序号 | 任务 | 建议负责人 | 预估工时 | 依赖 |
|------|------|-----------|---------|------|
| 1 | 扩展 config.js 添加速度配置 | Alpha | 0.5h | 无 |
| 2 | 扩展 ScoreManager 速度计算 | Alpha | 1.5h | 任务1 |
| 3 | 修改 Game.js 集成动态速度 | Alpha | 1h | 任务2 |
| 4 | 添加速度条 UI 和渲染 | Beta | 1.5h | 任务1 |
| 5 | 测试速度渐变效果 | QA | 1h | 任务3 |

**预估总工时：5.5h**

## 8. 风险评估

| 风险 | 影响 | 应对方案 |
|------|------|---------|
| 速度过快无法游玩 | 中 | 设置 MIN_INTERVAL 上限 |
| 速度跳跃感明显 | 低 | 使用平滑过渡 |

## 9. 验收标准

- [ ] 每吃 3 个食物速度提升一级
- [ ] 速度条显示当前等级
- [ ] 最高速度有上限
- [ ] 不同难度初始速度不同
- [ ] 游戏重新开始速度重置
