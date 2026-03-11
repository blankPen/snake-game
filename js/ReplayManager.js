/**
 * 回放录制器
 * 记录游戏过程中的输入序列
 */
export class ReplayRecorder {
  constructor() {
    this.isRecording = false;
    this.inputSequence = [];
    this.startTime = 0;
    this.frameCount = 0;
    this.difficulty = 'normal';
    this.initialSeed = 0;
  }

  /**
   * 开始录制
   * @param {string} difficulty - 难度
   */
  start(difficulty = 'normal') {
    this.isRecording = true;
    this.inputSequence = [];
    this.startTime = Date.now();
    this.frameCount = 0;
    this.difficulty = difficulty;
    this.initialSeed = Math.random() * 10000;
  }

  /**
   * 记录输入
   * @param {string} direction - 方向
   */
  recordInput(direction) {
    if (!this.isRecording) return;
    
    // 只记录与上次不同的方向
    const lastInput = this.inputSequence[this.inputSequence.length - 1];
    if (lastInput && lastInput.direction === direction) {
      return;
    }
    
    this.inputSequence.push({
      frame: this.frameCount,
      direction: direction,
      timestamp: Date.now() - this.startTime
    });
  }

  /**
   * 增加帧计数
   */
  incrementFrame() {
    if (this.isRecording) {
      this.frameCount++;
    }
  }

  /**
   * 停止录制并返回回放数据
   * @param {number} finalScore - 最终分数
   * @returns {Object} 回放数据
   */
  stop(finalScore = 0) {
    this.isRecording = false;
    
    return {
      version: '1.0',
      timestamp: this.startTime,
      difficulty: this.difficulty,
      initialSeed: this.initialSeed,
      inputSequence: this.inputSequence,
      finalScore: finalScore,
      duration: Date.now() - this.startTime,
      frameCount: this.frameCount
    };
  }

  /**
   * 检查是否正在录制
   * @returns {boolean}
   */
  isActive() {
    return this.isRecording;
  }
}

/**
 * 回放播放器
 * 重现游戏过程
 */
export class ReplayPlayer {
  constructor(replayData) {
    this.replayData = replayData;
    this.currentFrame = 0;
    this.isPlaying = false;
    this.playbackSpeed = 1;
    this.onDirectionChange = null;
    this.inputIndex = 0;
  }

  /**
   * 重置播放器
   */
  reset() {
    this.currentFrame = 0;
    this.inputIndex = 0;
    this.isPlaying = false;
  }

  /**
   * 设置播放速度
   * @param {number} speed - 速度倍数
   */
  setSpeed(speed) {
    this.playbackSpeed = speed;
  }

  /**
   * 播放一帧
   * @returns {string|null} 当前方向，如果没有则返回 null
   */
  playFrame() {
    if (!this.isPlaying || this.inputIndex >= this.replayData.inputSequence.length) {
      return null;
    }

    const currentInput = this.replayData.inputSequence[this.inputIndex];
    
    if (this.currentFrame >= currentInput.frame) {
      const direction = currentInput.direction;
      this.inputIndex++;
      return direction;
    }
    
    return null;
  }

  /**
   * 播放
   */
  play() {
    this.isPlaying = true;
  }

  /**
   * 暂停
   */
  pause() {
    this.isPlaying = false;
  }

  /**
   * 停止
   */
  stop() {
    this.isPlaying = false;
    this.reset();
  }

  /**
   * 跳转到指定帧
   * @param {number} frame - 目标帧
   */
  seekTo(frame) {
    this.currentFrame = frame;
    // 找到对应帧的输入索引
    this.inputIndex = 0;
    for (let i = 0; i < this.replayData.inputSequence.length; i++) {
      if (this.replayData.inputSequence[i].frame <= frame) {
        this.inputIndex = i + 1;
      } else {
        break;
      }
    }
  }

  /**
   * 获取进度百分比
   * @returns {number} 0-100
   */
  getProgress() {
    return (this.currentFrame / this.replayData.frameCount) * 100;
  }
}

/**
 * 回放管理器
 * 管理回放的存储和加载
 */
export class ReplayManager {
  constructor() {
    this.replays = [];
    this.maxReplays = 10;
    this.autoSaveThreshold = 50; // 超过此分数自动保存
    this.load();
  }

  /**
   * 保存回放到 localStorage
   * @param {Object} replayData - 回放数据
   */
  save(replayData) {
    // 添加名称
    replayData.name = `回放 ${new Date(replayData.timestamp).toLocaleString()}`;
    
    // 添加到列表开头
    this.replays.unshift(replayData);
    
    // 限制数量
    if (this.replays.length > this.maxReplays) {
      this.replays = this.replays.slice(0, this.maxReplays);
    }
    
    this.persist();
  }

  /**
   * 加载回放列表
   */
  load() {
    try {
      const saved = localStorage.getItem('snake_replays');
      if (saved) {
        this.replays = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load replays:', e);
      this.replays = [];
    }
  }

  /**
   * 持久化到 localStorage
   */
  persist() {
    try {
      localStorage.setItem('snake_replays', JSON.stringify(this.replays));
    } catch (e) {
      console.error('Failed to save replays:', e);
    }
  }

  /**
   * 获取所有回放
   * @returns {Array}
   */
  getAll() {
    return this.replays;
  }

  /**
   * 获取回放数据
   * @param {number} index - 索引
   * @returns {Object|null}
   */
  get(index) {
    return this.replays[index] || null;
  }

  /**
   * 删除回放
   * @param {number} index - 索引
   */
  delete(index) {
    if (index >= 0 && index < this.replays.length) {
      this.replays.splice(index, 1);
      this.persist();
    }
  }

  /**
   * 导出回放为 JSON
   * @param {number} index - 索引
   * @returns {string}
   */
  exportJSON(index) {
    const replay = this.replays[index];
    if (!replay) return '';
    return JSON.stringify(replay, null, 2);
  }

  /**
   * 从 JSON 导入回放
   * @param {string} jsonString - JSON 字符串
   * @returns {boolean}
   */
  importJSON(jsonString) {
    try {
      const replay = JSON.parse(jsonString);
      if (replay.version && replay.inputSequence) {
        this.save(replay);
        return true;
      }
    } catch (e) {
      console.error('Failed to import replay:', e);
    }
    return false;
  }

  /**
   * 生成回放代码（短字符串）
   * @param {number} index - 索引
   * @returns {string}
   */
  generateCode(index) {
    const replay = this.replays[index];
    if (!replay) return '';
    
    // 简单编码：时间戳 + 分数 + 输入序列长度
    const data = `${replay.timestamp}-${replay.finalScore}-${replay.inputSequence.length}`;
    return btoa(data);
  }

  /**
   * 检查是否应该自动保存
   * @param {number} score - 当前分数
   * @returns {boolean}
   */
  shouldAutoSave(score) {
    return score >= this.autoSaveThreshold;
  }
}
