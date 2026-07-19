export default class SoundManager {
  constructor(scene) {
    this.scene = scene;
    this.context = null;
  }

  getContext() {
    if (!this.context) {
      this.context = this.scene.sound.context;
    }
    return this.context;
  }

  tone(frequency, duration = 0.08, volume = 0.035, delay = 0) {
    const context = this.getContext();
    if (!context || context.state === 'suspended') return;

    const start = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration);
  }

  playJump(playerNumber) {
    this.tone(playerNumber === 1 ? 440 : 520, 0.08, 0.025);
  }

  playPlate() {
    this.tone(620, 0.1, 0.03);
  }

  playDoor() {
    this.tone(440, 0.12, 0.04);
    this.tone(660, 0.16, 0.04, 0.1);
    this.tone(880, 0.2, 0.035, 0.22);
  }

  playSuccess() {
    [523, 659, 784, 1047].forEach((note, index) => {
      this.tone(note, 0.22, 0.045, index * 0.1);
    });
  }
}
