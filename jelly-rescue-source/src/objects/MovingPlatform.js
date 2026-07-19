export default class MovingPlatform {
  constructor(scene, config) {
    this.config = config;
    this.isActive = !config.requiresPlate;
    this.platform = scene.add.rectangle(
      config.x,
      config.y,
      config.width,
      config.height,
      0x4f6fa8,
    ).setStrokeStyle(3, 0x91b8f5);

    scene.physics.add.existing(this.platform);
    this.platform.body.setAllowGravity(false);
    this.platform.body.setImmovable(true);
    this.platform.body.pushable = false;

    this.tween = scene.tweens.add({
      targets: this.platform,
      x: config.toX ?? config.x,
      y: config.toY ?? config.y,
      duration: config.duration ?? 2200,
      yoyo: true,
      repeat: -1,
      paused: !this.isActive,
      ease: 'Sine.easeInOut',
      onUpdate: () => this.platform.body.updateFromGameObject(),
    });
  }

  setActive(active) {
    if (!this.config.requiresPlate || active === this.isActive) return;
    this.isActive = active;
    if (active) this.tween.resume();
    else this.tween.pause();
    this.platform.setFillStyle(active ? 0x4f9f83 : 0x4f6fa8);
  }
}
