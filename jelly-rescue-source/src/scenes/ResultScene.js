export default class ResultScene extends Phaser.Scene {
  constructor() {
    super('ResultScene');
  }

  create(data) {
    const levelIndex = data.levelIndex ?? 0;
    this.cameras.main.setBackgroundColor('#10182f');
    this.add.rectangle(480, 270, 960, 540, 0x10182f);

    for (let i = 0; i < 45; i += 1) {
      const colors = [0x57c7ff, 0xff6fae, 0xffd76a, 0x65f3a3, 0x9a88ff];
      const confetti = this.add.rectangle(
        Phaser.Math.Between(80, 880),
        Phaser.Math.Between(-50, 200),
        Phaser.Math.Between(4, 10),
        Phaser.Math.Between(10, 22),
        Phaser.Utils.Array.GetRandom(colors),
      ).setAngle(Phaser.Math.Between(0, 180));
      this.tweens.add({
        targets: confetti,
        y: Phaser.Math.Between(360, 620),
        angle: confetti.angle + Phaser.Math.Between(180, 520),
        duration: Phaser.Math.Between(1300, 2500),
        repeat: -1,
        delay: Phaser.Math.Between(0, 800),
      });
    }

    this.add.image(380, 222, 'jelly-blue').setScale(1.65).setAngle(-8);
    this.add.image(580, 222, 'jelly-pink').setScale(1.65).setAngle(8);
    this.add.text(480, 96, '구조 성공!', {
      fontFamily: 'Arial Black, Noto Sans KR, sans-serif',
      fontSize: '62px', color: '#ffffff', stroke: '#3c4d78', strokeThickness: 8,
    }).setOrigin(0.5);
    this.add.text(480, 306, `${data.levelName ?? '스테이지'} 완료 · ${data.elapsedSeconds ?? 0}초`, {
      fontFamily: 'Noto Sans KR, sans-serif', fontSize: '22px', color: '#c9d7f4',
    }).setOrigin(0.5);

    if (data.hasNext) {
      this.createButton(280, 412, '다음 스테이지', 0x6d5dfc, () => (
        this.scene.start('GameScene', { levelIndex: levelIndex + 1 })
      ));
      this.createButton(480, 412, '다시 도전', 0x3c4d78, () => (
        this.scene.start('GameScene', { levelIndex })
      ));
      this.createButton(680, 412, '처음 화면', 0x2d3d63, () => this.scene.start('MenuScene'));
      this.input.keyboard.once('keydown-SPACE', () => (
        this.scene.start('GameScene', { levelIndex: levelIndex + 1 })
      ));
    } else {
      this.add.text(480, 350, '모든 구조 신호를 해결했어요!', {
        fontFamily: 'Arial Black, Noto Sans KR, sans-serif', fontSize: '19px', color: '#83ffc0',
      }).setOrigin(0.5);
      this.createButton(380, 426, '다시 도전', 0x6d5dfc, () => (
        this.scene.start('GameScene', { levelIndex })
      ));
      this.createButton(580, 426, '처음 화면', 0x2d3d63, () => this.scene.start('MenuScene'));
      this.input.keyboard.once('keydown-SPACE', () => (
        this.scene.start('GameScene', { levelIndex })
      ));
    }
  }

  createButton(x, y, label, color, callback) {
    const button = this.add.rectangle(x, y, 176, 56, color)
      .setStrokeStyle(2, 0xffffff, 0.3)
      .setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, label, {
      fontFamily: 'Arial Black, Noto Sans KR, sans-serif', fontSize: '19px', color: '#ffffff',
    }).setOrigin(0.5);
    button.on('pointerover', () => {
      button.setScale(1.04);
      text.setScale(1.04);
    });
    button.on('pointerout', () => {
      button.setScale(1);
      text.setScale(1);
    });
    button.on('pointerdown', callback);
  }
}
