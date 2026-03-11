# 技术方案：事件驱动架构重构

**Issue:** #50, #60, #61  
**版本:** v1.0  
**日期:** 2026-03-10  
**作者:** Arch

---

## 1. 背景

当前 Game.js 存在以下问题：
1. **紧耦合** - Game.js 直接调用各模块方法，缺乏解耦
2. **渲染逻辑分散** - `_render()` 和 `_renderStartScreen()` 方法混在 Game.js 中
3. **分数更新被动** - 分数变化后需要 Game.js 手动传递数据给 Renderer

通过事件驱动架构，实现模块间松耦合通信。

---

## 2. 架构设计

### 2.1 事件总线 (EventBus)

新建 `js/EventBus.js`：

```javascript
class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
  }

  emit(event, data) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }
}

export const eventBus = new EventBus();
```

### 2.2 事件列表

| 事件名 | 发送方 | 接收方 | 数据 |
|--------|--------|--------|------|
| `game:start` | Game | Renderer, ScoreManager | - |
| `game:pause` | Game | Renderer | - |
| `game:resume` | Game | Renderer | - |
| `game:over` | Game | Renderer, ScoreManager | { score, highScore } |
| `game:restart` | Game | 所有模块 | - |
| `score:update` | ScoreManager | Renderer | { score, highScore } |
| `snake:move` | Snake | Renderer | { body } |
| `food:eaten` | Game | ScoreManager | - |
| `difficulty:change` | ScoreManager | Game | { difficulty } |

### 2.3 模块职责

**EventBus (新增)**
- 事件注册和分发
- 全局单例

**Game.js (重构)**
- 移除直接调用 renderer.render()
- 改为 emit 事件
- 简化为主循环控制器

**Renderer.js (重构)**
- 订阅游戏事件
- 根据事件自行触发渲染
- 不再需要外部传入数据

**ScoreManager.js (重构)**
- 分数变化时 emit 事件
- 不再需要 Game.js 中转

---

## 3. 文件变更

### 3.1 新增文件
- `js/EventBus.js` - 事件总线类

### 3.2 修改文件
- `js/Game.js` - 改为事件驱动
- `js/Renderer.js` - 订阅事件自动渲染
- `js/ScoreManager.js` - 分数变化时 emit 事件

### 3.3 删除
- Game.js 中的 `_render()` 方法
- Game.js 中的 `_renderStartScreen()` 方法

---

## 4. 子任务拆分

| 序号 | 任务 | 负责人 | 预估工时 | 依赖 |
|------|------|--------|---------|------|
| 1 | 创建 EventBus.js | Alpha | 0.5h | 无 |
| 2 | 重构 ScoreManager 事件驱动 | Alpha | 1h | 任务1 |
| 3 | 重构 Renderer 订阅事件 | Beta | 1.5h | 任务1 |
| 4 | 重构 Game 事件驱动 | Beta | 1.5h | 任务2,3 |
| 5 | 集成测试 | Alpha | 1h | 任务4 |

**总工时：约 5.5 小时**

---

## 5. 风险评估

| 风险 | 影响 | 应对 |
|------|------|------|
| 事件循环依赖 | 中 | 避免循环 emit |
| 调试困难 | 低 | 添加事件日志开关 |
| 兼容性 | 低 | 保持现有 API 兼容 |

---

## 6. 验收标准

- [ ] EventBus 单例正常工作
- [ ] 分数变化自动触发 Renderer 更新
- [ ] 游戏状态变化自动渲染
- [ ] 原有功能不受影响
- [ ] 集成测试通过
