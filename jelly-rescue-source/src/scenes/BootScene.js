import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.createJellyTexture('jelly-blue', 0x57c7ff, 0xbcecff);
    this.createJellyTexture('jelly-blue-blink', 0x57c7ff, 0xbcecff, true);
    this.createJellyTexture('jelly-pink', 0xff6fae, 0xffc4de);
    this.createJellyTexture('jelly-pink-blink', 0xff6fae, 0xffc4de, true);
    this.createBoxTexture();
    this.createHeavyBoxTexture();
    this.scene.start('OnlineLobbyScene');
  }

  createJellyTexture(key, color, highlight, blinking = false) {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(color, 1);
    graphics.fillRoundedRect(2, 4, 52, 52, 18);
    graphics.fillStyle(highlight, 0.8);
    graphics.fillEllipse(17, 17, 12, 8);
    graphics.fillStyle(0x17213e, 1);
    if (blinking) {
      graphics.lineStyle(3, 0x17213e, 1);
      graphics.lineBetween(16, 29, 24, 29);
      graphics.lineBetween(34, 29, 42, 29);
    } else {
      graphics.fillCircle(20, 29, 4);
      graphics.fillCircle(38, 29, 4);
    }
    graphics.lineStyle(2, 0x17213e, 1);
    graphics.beginPath();
    graphics.arc(29, 36, 7, 0.25, Math.PI - 0.25, false);
    graphics.strokePath();
    graphics.generateTexture(key, 56, 58);
    graphics.destroy();
  }

  createBoxTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0xb87845, 1);
    graphics.fillRoundedRect(2, 2, 60, 60, 8);
    graphics.lineStyle(5, 0xe5aa70, 1);
    graphics.strokeRoundedRect(4, 4, 56, 56, 6);
    graphics.lineBetween(9, 9, 55, 55);
    graphics.lineBetween(55, 9, 9, 55);
    graphics.generateTexture('box', 64, 64);
    graphics.destroy();
  }

  createHeavyBoxTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x7651a8, 1);
    graphics.fillRoundedRect(2, 2, 92, 68, 12);
    graphics.lineStyle(5, 0xb894e8, 1);
    graphics.strokeRoundedRect(4, 4, 88, 64, 10);
    graphics.lineBetween(12, 12, 84, 60);
    graphics.lineBetween(84, 12, 12, 60);
    graphics.fillStyle(0xf4eaff, 1);
    graphics.fillCircle(48, 35, 15);
    graphics.fillStyle(0x5b3b88, 1);
    graphics.fillCircle(42, 32, 3);
    graphics.fillCircle(54, 32, 3);
    graphics.lineStyle(2, 0x5b3b88, 1);
    graphics.lineBetween(42, 42, 54, 42);
    graphics.generateTexture('heavy-box', 96, 72);
    graphics.destroy();
  }
}
