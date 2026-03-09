# 技术方案：贪吃蛇游戏（Snake Game）

## 1. 需求概述
开发一款纯 Web 实现的贪吃蛇游戏，支持桌面和移动端，包含流畅的动画效果、分数统计、暂停/继续、难度选择等功能。

## 2. 技术栈

**核心技术：**
- **HTML5 Canvas** - 用于高性能游戏渲染
- **CSS3** - 界面样式和响应式布局
- **JavaScript (ES6+)** - 游戏逻辑和交互控制

**无外部依赖** - 纯原生实现，确保加载速度快、兼容性好

## 3. 项目文件结构

```
snake-game/
├── index.html              # 入口文件
├── css/
│   └── style.css          # 全局样式
├── js/
│   ├── Game.js            # 游戏主类
│   ├── Snake.js           # 蛇逻辑
│   ├── Food.js            # 食物逻辑
│   ├── Renderer.js        # 渲染引擎
│   ├── InputHandler.js     # 输入控制
│   └── config.js          # 配置常量
├── assets/                 # 资源文件（可选）
│   └── icons/             # 图标资源
├── README.md               # 项目说明
├── SPECIFICATION.md        # 本文档
└── .gitignore              # Git 忽略规则
```

## 4. 架构设计

### 4.1 模块划分

1. **Game.js - 游戏控制器**
   - 游戏状态管理（运行/暂停/结束）
   - 游戏循环（requestAnimationFrame）
   - 难度控制（速度调整）
   - 分数管理（当前分/最高分）
   - 生命周期管理（开始/暂停/结束/重置）

2. **Snake.js - 蛇实体**
   - 蛇身管理（数组存储）
   - 移动逻辑（头部增长/尾部移除）
   - 转向控制（防止 180° 急转）
   - 碰撞检测（自碰撞）

3. **Food.js - 食物系统**
   - 随机位置生成
   - 避免与蛇身重叠
   - 特殊食物扩展（加分道具预留）

4. **Renderer.js - 渲染引擎**
   - Canvas 上下文管理
   - 蛇身渲染（头部/身体/尾部区分）
   - 食物渲染（颜色区分）
   - 网格线绘制（可选）
   - 动画效果（平滑过渡）

5. **InputHandler.js - 输入处理**
   - 键盘事件监听（方向键 + WASD）
   - 触摸滑动检测（移动端）
   - 暂停/继续快捷键（Space）
   - 输入防抖（避免快速转向导致死亡）

6. **config.js - 配置中心**
   - 游戏参数常量化（网格大小、初始速度）
   - 难度配置（速度映射表）
   - 颜色配置（蛇身/食物/背景）

### 4.2 数据流

```
用户输入 → InputHandler → 更新 Snake 方向
                                ↓
        Game Loop (requestAnimationFrame)
                                ↓
                    Game.update()
                        ├→ Snake.move()
                        ├→ 碰撞检测（边界/食物/自身）
                        └→ 分数更新
                                ↓
                    Game.render() → Renderer.draw(蛇, 食物, 分数)
```

## 5. 接口设计（内部 API）

**Game 类核心接口：**
```javascript
class Game {
  constructor(canvasId, config)
  start()              // 开始游戏
  pause()              // 暂停游戏
  resume()             // 继续游戏
  restart()            // 重新开始
  setDifficulty(level)  // 设置难度 (easy/normal/hard)
  getState()           // 获取当前状态
}
```

**Snake 类核心接口：**
```javascript
class Snake {
  constructor(config)
  move(direction)      // 移动一步
  grow()               // 生长（吃食物）
  setDirection(dir)    // 设置方向
  checkCollisionSelf() // 自碰撞检测
  getHead()            // 获取头部坐标
  getBody()            // 获取蛇身数组
}
```

## 6. 数据模型

**游戏状态：**
```javascript
{
  status: 'running' | 'paused' | 'gameover',
  score: number,
  highScore: number,
  difficulty: 'easy' | 'normal' | 'hard',
  speed: number        // 毫秒/帧
}
```

**蛇身结构：**
```javascript
[{x: number, y: number}, {x: number, y: number}, ...]
```

**坐标系统：**
- 原点 (0,0) 在画布左上角
- 网格坐标（非像素坐标）
- 方向：{x: -1|0|1, y: -1|0|1}

## 7. 技术选型理由

| 技术选型 | 理由 |
|---------|------|
| HTML5 Canvas | 性能优异，适合游戏渲染 |
| requestAnimationFrame | 浏览器优化动画，60fps 流畅体验 |
| ES6 Class | 面向对象，代码结构清晰 |
| 无框架 | 减少依赖，零学习成本，易于维护 |
| localStorage | 最高分持久化存储 |

## 8. 子任务拆分

| 序号 | 任务 | 建议负责人 | 预估工时 | 依赖 |
|------|------|-----------|---------|------|
| 1 | 创建项目文件结构（html/css/js目录） | Alpha | 0.5h | 无 |
| 2 | 实现配置中心 | Alpha | 0.5h | 任务1 |
| 3 | 实现蛇实体（Snake.js） | Alpha | 2h | 任务2 |
| 4 | 实现食物系统（Food.js） | Beta | 1h | 任务2 |
| 5 | 实现渲染引擎（Renderer.js） | Alpha | 2h | 任务3,4 |
| 6 | 实现输入处理器（InputHandler.js） | Beta | 1.5h | 无 |
| 7 | 实现游戏控制器（Game.js）- 核心循环 | Alpha | 2h | 任务3,4,5,6 |
| 8 | 实现游戏状态管理和生命周期 | Alpha | 1.5h | 任务7 |
| 9 | 实现键盘控制（方向键 + WASD） | Beta | 1h | 任务6,7 |
| 10 | 实现触摸滑动控制（移动端） | Beta | 1.5h | 任务6,7 |
| 11 | 实现暂停/继续功能 | Alpha | 0.5h | 任务7 |
| 12 | 实现难度选择（三档速度） | Alpha | 1h | 任务7 |
| 13 | 实现分数统计和最高分 | Beta | 1h | 任务7 |
| 14 | 实现游戏结束和重新开始 | Alpha | 1h | 任务7 |
| 15 | CSS 界面美化（响应式布局） | Beta | 2h | 任务1 |
| 16 | 集成测试和 Bug 修复 | Alpha | 1.5h | 所有开发任务 |

**总工时：约 19.5 小时**

## 9. 风险评估

| 风险 | 影响 | 应对方案 |
|------|------|---------|
| 移动端触摸滑动误触 | 中 | 添加滑动阈值，避免误判 |
| 快速转向导致死亡 | 中 | 输入缓冲队列，每帧只处理一次方向 |
| 性能问题（低配设备） | 低 | requestAnimationFrame 自动降帧 |
| 高分丢失（localStorage 清除） | 低 | 说明文档提示 |
| 浏览器兼容性 | 低 | ES6 语法现代浏览器支持良好 |

## 10. 开发顺序建议

**阶段一：核心逻辑**（Alpha + Beta 并行）
- 配置中心 → 蛇实体 → 食物系统

**阶段二：渲染与控制**（Alpha + Beta 并行）
- 渲染引擎 → 输入处理器 → 游戏控制器

**阶段三：功能完善**（Alpha + Beta 并行）
- 键盘控制 → 触摸控制 → 暂停/继续 → 难度选择 → 分数统计 → 重开

**阶段四：界面美化**（Beta 负责）
- CSS 样式 → 响应式布局

**阶段五：集成测试**（Alpha 负责）
- 全流程测试 → Bug 修复

---

**文档版本：** v1.0
**创建时间：** 2026-03-09
**技术架构师：** Arch
