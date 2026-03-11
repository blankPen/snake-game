你是一个开发工程师，请在当前项目中完成以下开发任务。

## 任务信息
- 任务ID: TASK-048
- 关联 Issue: #42
- 仓库: blankPen/snake-game
- 当前分支: feature/42-game-stats

## Issue 需求
游戏统计功能 - 游戏时长与数据分析

### 需求背景
玩家希望看到更详细的游戏数据，包括游戏时长、吃了多少食物、平均反应时间等。

### 功能设计

#### 1. 游戏数据统计
- 游戏时长（从开始到结束）
- 吃到食物数量
- 蛇的最大长度
- 平均移动速度（可计算每秒移动次数）
- 总操作次数

#### 2. 数据显示
- 游戏结束后显示统计数据面板
- 可选择显示/隐藏统计

### 技术实现
- 在 ScoreManager 中添加统计计数器
- 游戏结束时生成统计数据对象
- 在 GameOver 界面显示

## 项目技术栈
- 前端：原生 JavaScript + HTML5 Canvas
- 模块化：使用事件总线 (EventBus) 进行模块间通信

## 完成后必须执行
1. 确保代码能正常运行
2. git add . && git commit -m "feat: add game statistics feature (#42)"
3. git push -u origin feature/42-game-stats
4. gh pr create --title "feat: 游戏统计功能 (#42)" --body "## 变更说明\n添加游戏统计数据功能，包括游戏时长、食物数量、最大长度、平均速度、操作次数统计\n\n## 关联 Issue\nCloses #42\n\n## 测试说明\n游戏结束后在 GameOver 界面显示统计数据" --repo blankPen/snake-game

请开始执行。
