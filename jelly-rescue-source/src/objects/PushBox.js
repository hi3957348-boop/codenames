export default class PushBox extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, config) {
    super(scene, config.x, config.y, config.heavy ? 'heavy-box' : 'box');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.isHeavy = Boolean(config.heavy);
    this.coopReady = false;
    this.setDisplaySize(config.width, config.height);
    this.body.setSize(config.width - 4, config.height - 4).setOffset(2, 2);
    this.setCollideWorldBounds(true);
    this.setDragX(this.isHeavy ? 1400 : 650);
    this.setMaxVelocity(this.isHeavy ? 95 : 150, 650);
    this.setBounce(0.02);

    if (this.isHeavy) {
      this.setPushable(false);
      this.coopLabel = scene.add.text(config.x, config.y - config.height / 2 - 24, '둘이 함께!', {
        fontFamily: 'Arial Black, Noto Sans KR, sans-serif',
        fontSize: '15px',
        color: '#d9c0ff',
        backgroundColor: '#201631cc',
        padding: { x: 8, y: 4 },
      }).setOrigin(0.5);
    }
  }

  updateCoop(players) {
    if (!this.isHeavy) return;

    const closeEnough = (player) => (
      Math.abs(player.x - this.x) < 175
      && Math.abs(player.y - this.y) < 82
    );
    const pushRight = players.every((player) => (
      closeEnough(player) && player.x < this.x && player.controls.right.isDown
    ));
    const pushLeft = players.every((player) => (
      closeEnough(player) && player.x > this.x && player.controls.left.isDown
    ));

    this.coopReady = pushRight || pushLeft;
    if (pushRight) {
      this.setVelocityX(92);
    } else if (pushLeft) {
      this.setVelocityX(-92);
    } else {
      this.setVelocityX(0);
    }

    this.coopLabel.setPosition(this.x, this.y - this.displayHeight / 2 - 24);
    this.coopLabel.setText(this.coopReady ? '협동 밀기!' : '둘이 함께!');
    this.coopLabel.setColor(this.coopReady ? '#96ffc0' : '#d9c0ff');
    this.setTint(this.coopReady ? 0xffffff : 0xd8c7ee);
  }
}
