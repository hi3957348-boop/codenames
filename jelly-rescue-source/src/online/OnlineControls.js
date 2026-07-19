import Phaser from 'phaser';

function virtualKey(read) {
  return { get isDown() { return read(); } };
}

export class LocalOnlineControls {
  constructor(scene) {
    this.keys = scene.input.keyboard.addKeys({ left: 'A', right: 'D', jump: 'W' });
    this.cursors = scene.input.keyboard.createCursorKeys();
    this.touch = { left: false, right: false, jump: false };
    this.left = virtualKey(() => this.keys.left.isDown || this.cursors.left.isDown || this.touch.left);
    this.right = virtualKey(() => this.keys.right.isDown || this.cursors.right.isDown || this.touch.right);
    this.jump = virtualKey(() => this.keys.jump.isDown || this.cursors.up.isDown || this.touch.jump);
    this.lastJump = false;
  }

  consumeJump() {
    const down = this.jump.isDown;
    const pressed = down && !this.lastJump;
    this.lastJump = down;
    return pressed;
  }

  snapshot() {
    return { left: this.left.isDown, right: this.right.isDown, jump: this.jump.isDown };
  }

  setTouch(action, value) {
    this.touch[action] = value;
  }
}

export class RemoteOnlineControls {
  constructor() {
    this.state = { left: false, right: false, jump: false };
    this.left = virtualKey(() => this.state.left);
    this.right = virtualKey(() => this.state.right);
    this.jump = virtualKey(() => this.state.jump);
    this.jumpQueued = false;
  }

  setState(next) {
    if (next.jump && !this.state.jump) this.jumpQueued = true;
    this.state = { left: Boolean(next.left), right: Boolean(next.right), jump: Boolean(next.jump) };
  }

  consumeJump() {
    const queued = this.jumpQueued;
    this.jumpQueued = false;
    return queued;
  }
}
