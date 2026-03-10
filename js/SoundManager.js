/**
 * 音效管理系统
 * 
 * Issue #23: 游戏音效系统
 * 使用 Web Audio API 实现音效
 */
export class SoundManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.volume = 0.5;
    this.initialized = false;
  }

  /**
   * 初始化音频上下文（需要用户交互后调用）
   */
  init() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  /**
   * 播放音效
   * @param {string} type - 音效类型
   */
  play(type) {
    if (!this.enabled || !this.initialized) return;
    
    // 确保音频上下文处于运行状态
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    switch (type) {
      case 'eat':
        this._playEatSound();
        break;
      case 'wall':
        this._playWallCollisionSound();
        break;
      case 'self':
        this._playSelfCollisionSound();
        break;
      case 'start':
        this._playStartSound();
        break;
      case 'gameover':
        this._playGameOverSound();
        break;
      case 'pause':
        this._playPauseSound();
        break;
    }
  }

  /**
   * 吃到食物音效 - 短促的"叮"声
   */
  _playEatSound() {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.frequency.setValueAtTime(880, this.audioContext.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1760, this.audioContext.currentTime + 0.1);
    
    gain.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
    
    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.1);
  }

  /**
   * 撞墙音效 - 低沉的碰撞声
   */
  _playWallCollisionSound() {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.3);
    
    gain.gain.setValueAtTime(this.volume * 0.5, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.3);
  }

  /**
   * 自碰撞音效 - 不同的碰撞音效
   */
  _playSelfCollisionSound() {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + 0.4);
    
    gain.gain.setValueAtTime(this.volume * 0.5, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);
    
    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.4);
  }

  /**
   * 开始游戏音效
   */
  _playStartSound() {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.frequency.setValueAtTime(440, this.audioContext.currentTime);
    osc.frequency.setValueAtTime(554, this.audioContext.currentTime + 0.1); // C#
    osc.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.2); // E
    
    gain.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.3);
  }

  /**
   * 游戏结束音效
   */
  _playGameOverSound() {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
    
    gain.gain.setValueAtTime(this.volume * 0.5, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
    
    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.5);
  }

  /**
   * 暂停音效
   */
  _playPauseSound() {
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.frequency.setValueAtTime(600, this.audioContext.currentTime);
    osc.frequency.setValueAtTime(400, this.audioContext.currentTime + 0.1);
    
    gain.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
    
    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.2);
  }

  /**
   * 切换音效开关
   */
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  /**
   * 设置音量
   * @param {number} value - 音量 (0-1)
   */
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value));
  }

  /**
   * 获取音效开关状态
   */
  isEnabled() {
    return this.enabled;
  }
}
