# 技术方案：音效系统增强

## 1. 需求概述

完善现有音效系统，让游戏音效与 Game.js 更深度集成，实现事件驱动播放音效。

## 2. 项目结构

```
js/
├── SoundManager.js      # 已存在，需增强
├── Game.js             # 需集成音效调用
└── config.js           # 需添加音效配置
```

## 3. 架构设计

### 3.1 事件驱动音效播放

```javascript
// Game.js 中调用音效
game.on('eat', () => soundManager.play('eat'));
game.on('gameover', () => soundManager.play('gameover'));
```

### 3.2 音效类型扩展

| 事件 | 音效类型 | 说明 |
|------|----------|------|
| eat | 吃到食物 | 高频叮咚声 |
| wall-collision | 撞墙 | 低沉碰撞声 |
| self-collision | 自撞 | 挫败音效 |
| game-start | 游戏开始 | 上升音阶 |
| game-over | 游戏结束 | 下降音阶 |
| pause | 暂停 | 切换音效 |
| resume | 恢复 | 恢复音效 |
| level-up | 升级/加速 | 激励音效 |

## 4. 接口设计

### 4.1 SoundManager 增强

```javascript
// js/SoundManager.js 扩展
export class SoundManager {
  // 现有方法...
  
  // 新增：批量预加载音效
  async preload() { ... }
  
  // 新增：注册事件回调
  registerEvents(game) { ... }
  
  // 新增：获取/设置音量
  setVolume(value: number): void
  getVolume(): number
  
  // 新增：音效开关持久化
  savePreference(): void
  loadPreference(): void
}
```

### 4.2 配置文件扩展

```javascript
// js/config.js 新增
export const CONFIG = {
  // ... 现有配置
  SOUND: {
    DEFAULT_VOLUME: 0.5,
    ENABLED_DEFAULT: true,
    // 音效开关持久化键名
    STORAGE_KEY: 'snake_game_sound_enabled'
  }
};
```

## 5. 数据模型

无需新增数据模型，使用 localStorage 存储用户音效偏好。

## 6. 技术选型

- **Web Audio API**: 已有，实现更灵活
- **事件系统**: 使用 CustomEvent 或简单回调
- **持久化**: localStorage

## 7. 子任务拆分

| 序号 | 任务 | 建议负责人 | 预估工时 | 依赖 |
|------|------|-----------|---------|------|
| 1 | 扩展 SoundManager 事件注册功能 | Beta | 1h | 无 |
| 2 | 在 Game.js 中集成音效调用 | Beta | 1h | 任务1 |
| 3 | 添加音效配置到 config.js | Beta | 0.5h | 无 |
| 4 | 添加音效开关持久化 | Beta | 0.5h | 任务1 |
| 5 | 测试各场景音效播放 | QA | 1h | 任务2 |

**预估总工时：4h**

## 8. 风险评估

| 风险 | 影响 | 应对方案 |
|------|------|---------|
| 移动端自动播放限制 | 低 | 使用用户首次交互触发初始化 |
| 音效延迟 | 低 | 预加载音频资源 |

## 9. 验收标准

- [ ] 吃到食物播放音效
- [ ] 游戏结束播放音效
- [ ] 暂停/恢复有音效反馈
- [ ] 音效开关状态持久化
- [ ] 音量调节功能
