import Phaser from 'phaser';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#10182f');
    this.addBackground();
    this.add.text(480, 105, '젤리구조대', {
      fontFamily: 'Arial Black, Noto Sans KR, sans-serif', fontSize: '62px', color: '#ffffff',
      stroke: '#243862', strokeThickness: 8,
    }).setOrigin(0.5);
    this.add.text(480, 166, '둘이 힘을 합쳐 10개의 구조 신호를 해결하라!', {
      fontFamily: 'Noto Sans KR, sans-serif', fontSize: '22px', color: '#bdcbee',
    }).setOrigin(0.5);
    this.add.image(365, 255, 'jelly-blue').setScale(1.5).setAngle(-6);
    this.add.image(595, 255, 'jelly-pink').setScale(1.5).setAngle(6);
    this.controlCard(250, 344, '1번 젤리', 'A  D   이동     W   점프', 0x57c7ff);
    this.controlCard(710, 344, '2번 젤리', '←  →   이동     ↑   점프', 0xff6fae);
    this.createButton(370, 450, '처음부터', 0x4f8fe8, () => this.scene.start('GameScene', { levelIndex: 0 }));
    this.createButton(590, 450, '단계 선택', 0x8a62e8, () => this.scene.start('StageSelectScene'));
    this.add.text(480, 510, 'SPACE: 1단계 시작   ·   ESC: 처음 화면', {
      fontFamily: 'Noto Sans KR, sans-serif', fontSize: '14px', color: '#7789b3',
    }).setOrigin(0.5);
    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('GameScene', { levelIndex: 0 }));
  }

  createButton(x, y, label, color, callback) {
    const button = this.add.rectangle(x, y, 195, 60, color)
      .setStrokeStyle(3, 0xcac5ff, 0.7).setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, label, {
      fontFamily: 'Arial Black, Noto Sans KR, sans-serif', fontSize: '22px', color: '#ffffff',
    }).setOrigin(0.5);
    button.on('pointerover', () => { button.setScale(1.04); text.setScale(1.04); });
    button.on('pointerout', () => { button.setScale(1); text.setScale(1); });
    button.on('pointerdown', callback);
  }

  controlCard(x, y, title, controls, color) {
    this.add.rectangle(x, y, 360, 74, 0x17213e, 0.92).setStrokeStyle(2, color, 0.6);
    this.add.text(x, y - 17, title, {
      fontFamily: 'Arial Black, Noto Sans KR, sans-serif', fontSize: '18px',
      color: `#${color.toString(16).padStart(6, '0')}`,
    }).setOrigin(0.5);
    this.add.text(x, y + 16, controls, {
      fontFamily: 'Noto Sans KR, sans-serif', fontSize: '16px', color: '#f0f4ff',
    }).setOrigin(0.5);
  }

  addBackground() {
    for (let i = 0; i < 25; i += 1) {
      this.add.circle(Phaser.Math.Between(0, 960), Phaser.Math.Between(0, 540),
        Phaser.Math.Between(1, 3), 0xbfd7ff, Phaser.Math.FloatBetween(0.15, 0.55));
    }
  }
}
