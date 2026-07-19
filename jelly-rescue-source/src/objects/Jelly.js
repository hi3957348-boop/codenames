import Phaser from 'phaser';

export default class Jelly extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, controls, number) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.controls = controls;
    this.playerNumber = number;
    this.moveSpeed = 220;
    this.jumpSpeed = 480;
    this.spawnPoint = new Phaser.Math.Vector2(x, y);
    this.baseTexture = texture;
    this.blinkTexture = `${texture}-blink`;
    this.wasGrounded = false;
    this.isSquashing = false;

    this.setCollideWorldBounds(true);
    this.setBounce(0.04);
    this.setDragX(1200);
    this.setMaxVelocity(270, 700);
    this.body.setSize(42, 52).setOffset(7, 4);

    scene.time.addEvent({
      delay: Phaser.Math.Between(1800, 3600),
      loop: true,
      callback: () => this.blink(),
    });
  }

  update() {
    const leftDown = this.controls.left.isDown;
    const rightDown = this.controls.right.isDown;

    if (leftDown === rightDown) {
      this.setAccelerationX(0);
    } else if (leftDown) {
      this.setAccelerationX(-1400);
      this.setFlipX(true);
    } else {
      this.setAccelerationX(1400);
      this.setFlipX(false);
    }

    const grounded = this.body.onFloor()
      || this.body.blocked.down
      || this.body.touching.down
      || this.body.wasTouching.down;

    const jumpPressed = typeof this.controls.consumeJump === 'function'
      ? this.controls.consumeJump()
      : Phaser.Input.Keyboard.JustDown(this.controls.jump);
    if (jumpPressed && grounded) {
      this.setVelocityY(-this.jumpSpeed);
      this.scene.soundManager.playJump(this.playerNumber);
      this.isSquashing = true;
      this.scene.tweens.add({
        targets: this,
        scaleX: 0.95,
        scaleY: 1.05,
        duration: 100,
        yoyo: true,
        onComplete: () => { this.isSquashing = false; },
      });
    }

    if (grounded && !this.wasGrounded && this.body.velocity.y >= 0) {
      this.land();
    }

    if (!this.isSquashing) {
      if (!grounded) {
        this.setScale(0.98, 1.02);
      } else if (Math.abs(this.body.velocity.x) > 45) {
        const bounce = Math.sin(this.scene.time.now / 115) * 0.012;
        this.setScale(1.015 + bounce, 0.985 - bounce);
      } else {
        this.setScale(1, 1);
      }
    }

    this.setAngle(0);
    this.wasGrounded = grounded;
  }

  blink() {
    if (!this.active || !this.scene) return;
    this.setTexture(this.blinkTexture);
    this.scene.time.delayedCall(120, () => {
      if (this.active) this.setTexture(this.baseTexture);
    });
  }

  land() {
    if (this.isSquashing) return;
    this.isSquashing = true;
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.06,
      scaleY: 0.94,
      duration: 90,
      yoyo: true,
      onComplete: () => { this.isSquashing = false; },
    });
  }

  resetToSpawn() {
    this.setPosition(this.spawnPoint.x, this.spawnPoint.y);
    this.setVelocity(0, 0);
    this.setAcceleration(0, 0);
    this.setAngle(0);
  }
}
