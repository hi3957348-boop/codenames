import Phaser from 'phaser';

export default class PressurePlate {
  constructor(scene, config) {
    this.scene = scene;
    this.config = config;
    this.active = false;
    this.justActivated = false;

    this.base = scene.add.rectangle(config.x, config.y + 4, config.width, 12, 0x293655)
      .setStrokeStyle(2, 0x8294bc);
    this.pad = scene.add.rectangle(config.x, config.y, config.width - 10, 10, 0xffc54d)
      .setStrokeStyle(2, 0xffe5a0);
    this.label = scene.add.text(config.x, config.y - 23, config.label, {
      fontFamily: 'Arial Black, sans-serif',
      fontSize: '18px',
      color: '#ffe59a',
    }).setOrigin(0.5);

    this.bounds = new Phaser.Geom.Rectangle(
      config.x - config.width / 2,
      config.y - 14,
      config.width,
      22,
    );
  }

  update(players, boxes = []) {
    const wasActive = this.active;
    const activators = this.config.accepts === 'boxes' ? boxes : players;

    this.active = activators.some((activator) => {
      const bounds = activator.getBounds();
      return Phaser.Geom.Intersects.RectangleToRectangle(this.bounds, bounds)
        && activator.body.bottom <= this.config.y + 15;
    });
    this.justActivated = this.active && !wasActive;

    this.pad.setFillStyle(this.active ? 0x63f29a : 0xffc54d);
    this.pad.y = this.active ? this.config.y + 4 : this.config.y;
    this.label.setColor(this.active ? '#8dffb5' : '#ffe59a');

    if (this.active && !wasActive) {
      this.scene.soundManager.playPlate();
    }
  }

  setNetworkActive(active) {
    this.active = Boolean(active);
    this.justActivated = false;
    this.pad.setFillStyle(this.active ? 0x63f29a : 0xffc54d);
    this.pad.y = this.active ? this.config.y + 4 : this.config.y;
    this.label.setColor(this.active ? '#8dffb5' : '#ffe59a');
  }
}
