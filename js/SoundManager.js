/**
 * 音效管理器
 * 使用 Web Audio API 实现游戏音效
 */
export class SoundManager {
  constructor() {
    this.audioContext = null;
    this.soundEnabled = true;
    this.initialized = false;
  }

  /**
   * 初始化音频上下文（需要用户交互后才能调用）
   */
  init() {
    if (this.initialized) return;
    
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
      console.log('SoundManager initialized');
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  /**
   * 恢复音频上下文（当页面恢复时调用）
   */
  resume() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  /**
   * 设置音效开关
   * @param {boolean} enabled - 是否开启音效
   */
  setEnabled(enabled) {
    this.soundEnabled = enabled;
    localStorage.setItem('soundEnabled', enabled);
  }

  /**
   * 获取音效开关状态
   * @returns {boolean} 是否开启音效
   */
  isEnabled() {
    return this.soundEnabled;
  }

  /**
   * 从本地存储加载音效设置
   */
  loadSettings() {
    const saved = localStorage.getItem('soundEnabled');
    if (saved !== null) {
      this.soundEnabled = saved === 'true';
    }
  }

  /**
   * 播放音效
   * @private
   * @param {number} frequency - 频率
   * @param {number} duration - 持续时间（秒）
   * @param {string} type - 波形类型
   * @param {number} volume - 音量（0-1）
   */
  _playTone(frequency, duration, type = 'sine', volume = 0.3) {
    if (!this.initialized || !this.soundEnabled) return;

    try {
      // 确保音频上下文处于运行状态
      this.resume();

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

      // 音量渐变
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (e) {
      console.warn('Error playing sound:', e);
    }
  }

  /**
   * 播放吃到食物的音效
   * 愉快的上升音调
   */
  playEatFood() {
    // 上升音调 - 两次快速的频率变化
    if (!this.initialized) this.init();
    
    if (!this.soundEnabled) return;

    try {
      this.resume();
      
      const now = this.audioContext.currentTime;
      
      // 第一个音
      const osc1 = this.audioContext.createOscillator();
      const gain1 = this.audioContext.createGain();
      osc1.connect(gain1);
      gain1.connect(this.audioContext.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(600, now);
      osc1.frequency.exponentialRampToValueAtTime(800, now + 0.1);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc1.start(now);
      osc1.stop(now + 0.1);

      // 第二个音（更高）
      const osc2 = this.audioContext.createOscillator();
      const gain2 = this.audioContext.createGain();
      osc2.connect(gain2);
      gain2.connect(this.audioContext.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(800, now + 0.08);
      osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.18);
      gain2.gain.setValueAtTime(0.2, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.18);
    } catch (e) {
      console.warn('Error playing eat food sound:', e);
    }
  }

  /**
   * 播放游戏结束音效
   * 低沉的下降音调
   */
  playGameOver() {
    if (!this.initialized) this.init();
    
    if (!this.soundEnabled) return;

    try {
      this.resume();
      
      const now = this.audioContext.currentTime;
      
      // 下降的低音
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.5);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {
      console.warn('Error playing game over sound:', e);
    }
  }

  /**
   * 播放暂停音效
   * 短促的提示音
   */
  playPause() {
    if (!this.initialized) this.init();
    
    if (!this.soundEnabled) return;

    try {
      this.resume();
      
      const now = this.audioContext.currentTime;
      
      // 短促的提示音
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch (e) {
      console.warn('Error playing pause sound:', e);
    }
  }

  /**
   * 播放继续音效
   * 愉快的上升音调
   */
  playResume() {
    if (!this.initialized) this.init();
    
    if (!this.soundEnabled) return;

    try {
      this.resume();
      
      const now = this.audioContext.currentTime;
      
      // 上升音调
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523, now); // C5
      osc.frequency.setValueAtTime(659, now + 0.1); // E5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } catch (e) {
      console.warn('Error playing resume sound:', e);
    }
  }

  /**
   * 播放开始游戏音效
   */
  playStart() {
    if (!this.initialized) this.init();
    
    if (!this.soundEnabled) return;

    try {
      this.resume();
      
      const now = this.audioContext.currentTime;
      
      // 上升的三连音
      const notes = [523, 659, 784]; // C5, E5, G5
      
      notes.forEach((freq, i) => {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.1);
        gain.gain.setValueAtTime(0.2, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.15);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.15);
      });
    } catch (e) {
      console.warn('Error playing start sound:', e);
    }
  }
}

// 导出为全局变量
window.SoundManager = SoundManager;
