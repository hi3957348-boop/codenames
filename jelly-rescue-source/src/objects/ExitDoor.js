export default class ExitDoor {
  constructor(scene, config) {
    this.scene = scene;
    this.isOpen = false;
    this.closedY = config.y;
    this.door = scene.add.rectangle(
      config.x,
      config.y,
      config.width,
      config.height,
      0xff6f91,
    ).setStrokeStyle(4, 0xffb0c4);

    scene.physics.add.existing(this.door, true);
    this.light = scene.add.circle(config.x, config.y - config.height / 2 + 18, 6, 0xffd2dc);
  }

  open() {
    if (this.isOpen) return;

    this.isOpen = true;
    this.door.body.enable = false;
    this.light.setFillStyle(0x65f3a3);
    this.scene.soundManager.playDoor();
    this.scene.tweens.add({
      targets: this.door,
      y: this.closedY - this.door.height + 18,
      alpha: 0.25,
      duration: 700,
      ease: 'Back.easeIn',
    });
  }

  close() {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.scene.tweens.killTweensOf(this.door);
    this.door.setAlpha(1).setY(this.closedY);
    this.door.body.enable = true;
    this.door.body.updateFromGameObject();
    this.light.setFillStyle(0xffd2dc);
  }
}
