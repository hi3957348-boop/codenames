import { levels } from '../levels/index.js';

export default class StageSelectScene extends Phaser.Scene {
  constructor() {
    super('StageSelectScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#10182f');
    this.add.text(480, 72, '구조 신호 선택', {
      fontFamily: 'Arial Black, Noto Sans KR, sans-serif',
      fontSize: '43px', color: '#ffffff', stroke: '#243862', strokeThickness: 6,
    }).setOrigin(0.5);
    this.add.text(480, 125, '둘이 힘을 합쳐 10개의 구조 작전을 해결하세요', {
      fontFamily: 'Noto Sans KR, sans-serif', fontSize: '18px', color: '#aebfe4',
    }).setOrigin(0.5);

    levels.forEach((level, index) => {
      const column = index % 5;
      const row = Math.floor(index / 5);
      const x = 120 + column * 180;
      const y = 230 + row * 145;
      const color = index < 3 ? 0x4f78c7 : index < 7 ? 0x7560cf : 0x9b58bd;
      const button = this.add.rectangle(x, y, 145, 102, color, 0.92)
        .setStrokeStyle(3, 0xcbd7ff, 0.55)
        .setInteractive({ useHandCursor: true });
      this.add.text(x, y - 18, `${index + 1}`, {
        fontFamily: 'Arial Black, sans-serif', fontSize: '34px', color: '#ffffff',
      }).setOrigin(0.5);
      this.add.text(x, y + 25, level.name.replace(/번째 구조 신호/, '단계'), {
        fontFamily: 'Noto Sans KR, sans-serif', fontSize: '14px', color: '#e1e8ff',
      }).setOrigin(0.5);
      button.on('pointerover', () => button.setScale(1.05));
      button.on('pointerout', () => button.setScale(1));
      button.on('pointerdown', () => this.scene.start('GameScene', { levelIndex: index }));
    });

    const back = this.add.text(480, 500, '← 처음 화면', {
      fontFamily: 'Arial Black, Noto Sans KR, sans-serif', fontSize: '18px', color: '#9fb2dc',
      backgroundColor: '#1b2949', padding: { x: 18, y: 10 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this.scene.start('MenuScene'));
    this.input.keyboard.once('keydown-ESC', () => this.scene.start('MenuScene'));
  }
}
