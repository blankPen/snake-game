# 技术方案：动画效果系统

## 1. 需求概述

为游戏添加平滑动画效果，提升视觉体验和游戏流畅度。

## 2. 项目结构

```
js/
├── Game.js           # 需修改：集成动画系统
├── Renderer.js       # 需扩展：动画渲染
├── AnimationManager.js # 新增：动画管理器
└── config.js         # 需添加：动画配置

css/
└── style.css         # 需添加：动画相关样式
```

## 3. 动画类型设计

| 动画 | 触发时机 | 效果 | 持续时间 |
|------|---------|------|---------|
| 食物出现 | 食物生成时 | 缩放 + 淡入 | 300ms |
| 食物消失 | 吃到食物时 | 缩放 + 闪烁 | 200ms |
| 蛇移动 | 每帧 | 位置平滑插值 | 每帧 |
| 得分飘字 | 得分时 | 向上飘动 + 淡出 | 1000ms |
| 屏幕抖动 | 游戏结束时 | 震动效果 | 500ms |
| 速度提升 | 升级时 | 背景闪烁 | 300ms |

## 4. 架构设计

### 4.1 AnimationManager

```javascript
// js/AnimationManager.js
export class AnimationManager {
  constructor() {
    this.animations = [];  // 活跃动画列表
  }
  
  // 创建动画
  create(type, options) { ... }
  
  // 更新所有动画
  update(deltaTime) { ... }
  
  // 渲染动画
  render(ctx) { ... }
  
  // 清除已完成动画
  cleanup() { ... }
}
```

### 4.2 动画系统结构

```javascript
// 动画定义
const ANIMATIONS = {
  'food-appear': {
    duration: 300,
    properties: ['scale', 'opacity'],
    easing: 'ease-out'
  },
  'food-eaten': {
    duration: 200,
    properties: ['scale', 'opacity'],
    keyframes: [
      { scale: 1, opacity: 1 },
      { scale: 1.5, opacity: 0.5 },
      { scale: 0, opacity: 0 }
    ]
  },
  'score-popup': {
    duration: 1000,
    properties: ['y', 'opacity'],
    easing: 'ease-out'
  },
  'screen-shake': {
    duration: 500,
    properties: ['offsetX', 'offsetY'],
    random: true
  }
};
```

### 4.3 蛇移动平滑处理

```javascript
// 使用插值实现平滑移动
// 在 Renderer.js 中
render() {
  // 计算当前显示位置（基于上次更新和当前位置插值）
  const t = this.getInterpolationFactor();
  const displayX = this.lerp(lastX, currentX, t);
  const displayY = this.lerp(lastY, currentY, t);
  
  this.drawSnake(displayX, displayY);
}

lerp(start, end, t) {
  return start + (end - start) * t;
}
```

## 5. 接口设计

### 5.1 Renderer 扩展

```javascript
// js/Renderer.js 新增方法
export class Renderer {
  // 新增：设置动画管理器
  setAnimationManager(manager) { ... }
  
  // 新增：渲染食物动画
  renderFoodAnimation(ctx, food, animation) { ... }
  
  // 新增：渲染得分飘字
  renderScorePopup(ctx, popup) { ... }
  
  // 新增：渲染屏幕抖动
  applyScreenShake(ctx, intensity) { ... }
}
```

### 5.2 Game 修改

```javascript
// js/Game.js 修改
export class Game {
  constructor() {
    // ... 现有初始化
    this.animationManager = new AnimationManager();
    this.renderer.setAnimationManager(this.animationManager);
  }
  
  // 修改 update 方法
  update() {
    // ... 现有逻辑
    this.animationManager.update(deltaTime);
  }
  
  // 触发特定动画
  triggerAnimation(type, options) {
    this.animationManager.create(type, options);
  }
}
```

## 6. 配置扩展

```javascript
// js/config.js 新增
export const CONFIG = {
  // ... 现有配置
  ANIMATION: {
    ENABLED: true,
    SMOOTH_MOVEMENT: true,  // 蛇移动平滑插值
    FOOD_ANIMATION: true,   // 食物动画
    SCORE_POPUP: true,      // 得分飘字
    SCREEN_SHAKE: true,     // 屏幕抖动
    // 时间配置
    FOOD_APPEAR_DURATION: 300,
    FOOD_EATEN_DURATION: 200,
    SCORE_POPUP_DURATION: 1000,
    SCREEN_SHAKE_DURATION: 500
  }
};
```

## 7. 子任务拆分

| 序号 | 任务 | 建议负责人 | 预估工时 | 依赖 |
|------|------|-----------|---------|------|
| 1 | 扩展 config.js 添加动画配置 | Beta | 0.5h | 无 |
| 2 | 创建 AnimationManager.js | Beta | 2.5h | 任务1 |
| 3 | 实现蛇移动平滑插值 | Beta | 1.5h | 任务2 |
| 4 | 实现食物动画（出现/消失） | Beta | 1.5h | 任务2 |
| 5 | 实现得分飘字动画 | Beta | 1h | 任务2 |
| 6 | 实现屏幕抖动效果 | Beta | 1h | 任务2 |
| 7 | 添加动画 CSS 过渡样式 | Beta | 0.5h | 无 |
| 8 | 测试动画流畅度 | QA | 1.5h | 任务3-6 |

**预估总工时：10h**

## 8. 风险评估

| 风险 | 影响 | 应对方案 |
|------|------|---------|
| 动画导致性能下降 | 中 | 使用 requestAnimationFrame，可配置开关 |
| 移动端卡顿 | 中 | 默认关闭平滑移动，使用配置控制 |
| 动画与游戏逻辑不同步 | 低 | 动画仅做视觉表现，不影响逻辑 |

## 9. 验收标准

- [ ] 蛇移动平滑，无跳跃感
- [ ] 食物出现/消失有过渡动画
- [ ] 得分时显示飘字动画
- [ ] 游戏结束时屏幕抖动
- [ ] 可通过配置开关动画效果
- [ ] 动画不影游戏性能（60fps）
