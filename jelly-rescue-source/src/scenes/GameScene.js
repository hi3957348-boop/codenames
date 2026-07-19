import Phaser from 'phaser';
import Jelly from '../objects/Jelly.js';
import PressurePlate from '../objects/PressurePlate.js';
import ExitDoor from '../objects/ExitDoor.js';
import PushBox from '../objects/PushBox.js';
import SoundManager from '../audio/SoundManager.js';
import MovingPlatform from '../objects/MovingPlatform.js';
import { levels } from '../levels/index.js';
import { roomService } from '../online/FirebaseRoomService.js';
import { LocalOnlineControls, RemoteOnlineControls } from '../online/OnlineControls.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    this.levelIndex = Phaser.Math.Clamp(data.levelIndex ?? 0, 0, levels.length - 1);
    this.level = levels[this.levelIndex];
    this.online = Boolean(data.online);
    this.role = data.role ?? roomService.role;
    this.playerNumber = data.playerNumber ?? roomService.playerNumber;
    this.roomCode = data.roomCode ?? roomService.roomCode;
  }

  create() {
    this.completed = false;
    this.timeExpired = false;
    this.doorUnlocked = false;
    this.sequenceStep = 0;
    this.startedAt = this.time.now;
    this.remainingTime = this.level.timeLimit ?? null;
    this.soundManager = new SoundManager(this);

    this.createBackground();
    this.createLevel();
    this.createPlayers();
    this.createPhysics();
    this.createHud();

    if (this.online) this.setupOnlinePlay();

    this.input.keyboard.on('keydown-R', () => {
      if (!this.online) this.scene.restart({ levelIndex: this.levelIndex });
      else if (this.role === 'host') this.restartOnlineLevel();
    });
    this.input.keyboard.on('keydown-ESC', () => this.exitOnlineRoom());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanupOnline());
  }

  createBackground() {
    const accent = this.levelIndex === 0 ? 0x5d7fd8 : 0x9b62d4;
    this.cameras.main.setBackgroundColor('#111a34');
    this.add.rectangle(480, 270, 960, 540, 0x111a34);
    this.add.circle(820, 90, 72, accent, 0.14);

    for (let i = 0; i < 38; i += 1) {
      this.add.circle(
        Phaser.Math.Between(20, 940),
        Phaser.Math.Between(65, 330),
        Phaser.Math.Between(1, 3),
        0xd4e2ff,
        Phaser.Math.FloatBetween(0.15, 0.55),
      );
    }

    this.add.text(480, 270, this.level.hint, {
      fontFamily: 'Noto Sans KR, sans-serif',
      fontSize: '16px',
      color: '#7f92bd',
    }).setOrigin(0.5);
  }

  createLevel() {
    this.platforms = this.physics.add.staticGroup();

    [...this.level.platforms, ...this.level.walls].forEach((item) => {
      const platform = this.add.rectangle(item.x, item.y, item.width, item.height, 0x2d3d63)
        .setStrokeStyle(3, 0x526991);
      this.physics.add.existing(platform, true);
      this.platforms.add(platform);
    });

    const exit = this.level.exit;
    this.exitZone = this.add.rectangle(exit.x, exit.y, exit.width, exit.height, 0x65f3a3, 0.12)
      .setStrokeStyle(3, 0x65f3a3, 0.75);
    this.add.text(exit.x, exit.y - 22, '구조 구역', {
      fontFamily: 'Arial Black, Noto Sans KR, sans-serif',
      fontSize: '16px',
      color: '#83ffc0',
      align: 'center',
    }).setOrigin(0.5);
    this.add.text(exit.x, exit.y + 10, '둘 다 들어오기', {
      fontFamily: 'Noto Sans KR, sans-serif', fontSize: '13px', color: '#bbf7d4',
    }).setOrigin(0.5);

    this.boxes = this.level.boxes.map((config) => new PushBox(this, config));
    this.movingPlatforms = (this.level.movingPlatforms ?? [])
      .map((config) => new MovingPlatform(this, config));
    this.plates = this.level.plates.map((config) => new PressurePlate(this, config));
    this.exitDoor = new ExitDoor(this, this.level.door);
  }

  createPlayers() {
    if (this.online) {
      this.localControls = new LocalOnlineControls(this);
      this.remoteControls = new RemoteOnlineControls();
    }

    const key1 = this.online
      ? (this.playerNumber === 1 ? this.localControls : this.remoteControls)
      : this.input.keyboard.addKeys({ left: 'A', right: 'D', jump: 'W' });
    const cursors = this.input.keyboard.createCursorKeys();
    const key2 = this.online
      ? (this.playerNumber === 2 ? this.localControls : this.remoteControls)
      : { left: cursors.left, right: cursors.right, jump: cursors.up };

    this.player1 = new Jelly(
      this,
      this.level.spawn.player1.x,
      this.level.spawn.player1.y,
      'jelly-blue',
      key1,
      1,
    );
    this.player2 = new Jelly(
      this,
      this.level.spawn.player2.x,
      this.level.spawn.player2.y,
      'jelly-pink',
      key2,
      2,
    );
    this.players = [this.player1, this.player2];

    this.add.text(this.player1.x, this.player1.y - 48, 'P1', {
      fontFamily: 'Arial Black, sans-serif', fontSize: '13px', color: '#8edcff',
    }).setOrigin(0.5).setName('p1-label');
    this.add.text(this.player2.x, this.player2.y - 48, 'P2', {
      fontFamily: 'Arial Black, sans-serif', fontSize: '13px', color: '#ffaad0',
    }).setOrigin(0.5).setName('p2-label');
  }

  createPhysics() {
    this.players.forEach((player) => {
      this.physics.add.collider(player, this.platforms);
      this.physics.add.collider(player, this.exitDoor.door);
      this.boxes.forEach((box) => this.physics.add.collider(player, box));
      this.movingPlatforms.forEach((moving) => this.physics.add.collider(player, moving.platform));
    });

    this.physics.add.collider(this.player1, this.player2);
    this.boxes.forEach((box, index) => {
      this.physics.add.collider(box, this.platforms);
      this.physics.add.collider(box, this.exitDoor.door);
      this.boxes.slice(index + 1).forEach((otherBox) => this.physics.add.collider(box, otherBox));
      this.movingPlatforms.forEach((moving) => this.physics.add.collider(box, moving.platform));
    });
  }

  createHud() {
    this.add.rectangle(480, 30, 960, 60, 0x0a1024, 0.88);
    this.add.text(24, 15, this.level.name, {
      fontFamily: 'Arial Black, Noto Sans KR, sans-serif', fontSize: '20px', color: '#ffffff',
    });
    this.objectiveText = this.add.text(480, 17, `목표: ${this.level.objective}`, {
      fontFamily: 'Noto Sans KR, sans-serif', fontSize: '16px', color: '#c5d2f1',
    }).setOrigin(0.5, 0);
    this.add.text(935, 20, 'R 재시작', {
      fontFamily: 'Noto Sans KR, sans-serif', fontSize: '14px', color: '#8fa1c7',
    }).setOrigin(1, 0);

    const initialStatus = this.level.sequence
      ? `신호 순서 0 / ${this.level.sequence.length}`
      : `협동 신호 0 / ${this.plates.length}`;
    this.statusText = this.add.text(480, 75, initialStatus, {
      fontFamily: 'Arial Black, Noto Sans KR, sans-serif', fontSize: '19px', color: '#ffd979',
      backgroundColor: '#10182fd9', padding: { x: 12, y: 7 },
    }).setOrigin(0.5);

    if (this.remainingTime !== null) {
      this.timerText = this.add.text(935, 72, `남은 시간 ${this.remainingTime}`, {
        fontFamily: 'Arial Black, Noto Sans KR, sans-serif', fontSize: '17px', color: '#ffcf78',
        backgroundColor: '#10182fd9', padding: { x: 10, y: 6 },
      }).setOrigin(1, 0.5);
    }
  }

  update() {
    if (this.completed || this.timeExpired) return;

    if (this.online && this.role === 'guest') {
      this.publishGuestInput();
      this.applyGuestWorld();
      this.updateLabels();
      return;
    }

    this.updateTimer();

    this.players.forEach((player) => player.update());
    this.boxes.forEach((box) => box.updateCoop(this.players));
    this.plates.forEach((plate) => plate.update(this.players, this.boxes));

    this.movingPlatforms.forEach((moving) => {
      if (!moving.config.requiresPlate) return;
      const control = this.plates.find((plate) => plate.config.id === moving.config.requiresPlate);
      moving.setActive(Boolean(control?.active));
    });

    const activeCount = this.plates.filter((plate) => plate.active).length;
    this.updatePuzzle(activeCount);

    this.updateLabels();
    this.checkFalls();
    this.checkExit();

    if (this.online && this.role === 'host') this.publishHostWorld();
  }

  updatePuzzle(activeCount) {
    if (this.doorUnlocked) return;

    if (this.level.sequence) {
      const activated = this.plates.find((plate) => plate.justActivated);
      if (activated) {
        const expectedId = this.level.sequence[this.sequenceStep];
        if (activated.config.id === expectedId) {
          this.sequenceStep += 1;
          this.statusText.setText(`신호 순서 ${this.sequenceStep} / ${this.level.sequence.length}`)
            .setColor('#ffd979');
        } else {
          this.sequenceStep = activated.config.id === this.level.sequence[0] ? 1 : 0;
          this.statusText.setText('순서가 달라요. 단서를 다시 살펴보세요!').setColor('#ff9aaa');
        }
      }

      if (this.sequenceStep >= this.level.sequence.length) this.unlockDoor();
      return;
    }

    if (this.level.doorRule === 'relay') {
      if (activeCount === this.plates.length) {
        this.unlockDoor();
      } else if (this.plates[0].active) {
        this.exitDoor.open();
        this.statusText.setText('문이 열려 있는 동안 친구가 건너가야 해요!').setColor('#9ed4ff');
      } else {
        this.exitDoor.close();
        this.statusText.setText('첫 번째 신호를 누르면 중앙 문이 열려요').setColor('#ffd979');
      }
      return;
    }

    const subject = this.levelIndex === 0 ? '발판' : '협동 신호';
    this.statusText.setText(`${subject} ${activeCount} / ${this.plates.length}`);
    if (activeCount === this.plates.length) this.unlockDoor();
  }

  unlockDoor() {
    this.doorUnlocked = true;
    this.exitDoor.open();
    this.statusText.setText('퍼즐 해결! 모두 구조 구역으로!').setColor('#83ffc0');
  }

  updateTimer() {
    if (this.remainingTime === null) return;
    const elapsed = (this.time.now - this.startedAt) / 1000;
    const seconds = Math.max(0, Math.ceil(this.level.timeLimit - elapsed));
    this.remainingTime = seconds;
    this.timerText.setText(`남은 시간 ${seconds}`);
    if (seconds <= 10) this.timerText.setColor('#ff8098');
    if (seconds === 0) {
      this.timeExpired = true;
      this.statusText.setText('시간 종료! 다시 도전해요').setColor('#ff8098');
      this.time.delayedCall(1100, () => {
        if (this.online) this.restartOnlineLevel();
        else this.scene.restart({ levelIndex: this.levelIndex });
      });
    }
  }

  updateLabels() {
    const p1Label = this.children.getByName('p1-label');
    const p2Label = this.children.getByName('p2-label');
    p1Label.setPosition(this.player1.x, this.player1.y - 48);
    p2Label.setPosition(this.player2.x, this.player2.y - 48);
  }

  checkFalls() {
    this.players.forEach((player) => {
      if (player.y > 570) player.resetToSpawn();
    });
    if (this.boxes.some((box) => box.y > 590)) {
      if (this.online) this.restartOnlineLevel();
      else this.scene.restart({ levelIndex: this.levelIndex });
    }
  }

  checkExit() {
    if (!this.doorUnlocked) return;

    const zoneBounds = this.exitZone.getBounds();
    const rescued = this.players.filter((player) => (
      Phaser.Geom.Intersects.RectangleToRectangle(zoneBounds, player.getBounds())
    ));
    this.exitZone.setFillStyle(0x65f3a3, rescued.length === 2 ? 0.35 : 0.12 + rescued.length * 0.09);

    if (rescued.length === 2) {
      this.completed = true;
      this.soundManager.playSuccess();
      const elapsedSeconds = Math.max(1, Math.round((this.time.now - this.startedAt) / 1000));
      if (this.online && this.role === 'host') {
        roomService.completeLevel({
          elapsedSeconds,
          levelIndex: this.levelIndex,
          levelName: this.level.name,
        });
      }
      this.time.delayedCall(650, () => this.scene.start('ResultScene', {
        elapsedSeconds,
        levelIndex: this.levelIndex,
        levelName: this.level.name,
        hasNext: this.levelIndex < levels.length - 1,
        online: this.online,
        role: this.role,
        roomCode: this.roomCode,
        playerNumber: this.playerNumber,
      }));
    }
  }

  setupOnlinePlay() {
    this.lastInputSentAt = 0;
    this.lastWorldSentAt = 0;
    this.lastInputJson = '';
    this.guestWorld = null;
    this.roomStatusHandled = false;

    this.roomBadge = this.add.text(24, 78, `방 ${this.roomCode} · ${this.playerNumber}번 젤리`, {
      fontFamily: 'Arial Black, Noto Sans KR, sans-serif',
      fontSize: '13px',
      color: this.playerNumber === 1 ? '#8edcff' : '#ffaad0',
      backgroundColor: '#10182fd9',
      padding: { x: 9, y: 5 },
    });

    if (this.role === 'host') {
      this.inputUnsubscribe = roomService.subscribeInput(2, (input) => {
        this.remoteControls.setState(input);
      });
    } else {
      this.players.forEach((player) => {
        player.body.setAllowGravity(false);
        player.body.setImmovable(true);
      });
      this.boxes.forEach((box) => {
        box.body.setAllowGravity(false);
        box.body.setImmovable(true);
      });
      this.movingPlatforms.forEach((moving) => moving.tween.pause());
      this.worldUnsubscribe = roomService.subscribeWorld((world) => {
        this.guestWorld = world;
      });
    }

    this.roomUnsubscribe = roomService.subscribeRoom((room) => this.handleOnlineRoom(room));
    this.createTouchControls();
  }

  handleOnlineRoom(room) {
    if (!room) {
      this.statusText?.setText('방 연결이 종료되었습니다.').setColor('#ff9aaa');
      return;
    }
    const otherNumber = this.playerNumber === 1 ? 2 : 1;
    if (!room.players?.[otherNumber]?.connected && room.status === 'playing') {
      this.statusText?.setText('친구의 재접속을 기다리는 중...').setColor('#ffcf78');
    }
    if (this.role === 'guest' && room.status === 'completed' && !this.roomStatusHandled) {
      this.roomStatusHandled = true;
      const result = room.completed ?? {};
      this.scene.start('ResultScene', {
        elapsedSeconds: result.elapsedSeconds ?? 0,
        levelIndex: result.levelIndex ?? this.levelIndex,
        levelName: result.levelName ?? this.level.name,
        hasNext: (result.levelIndex ?? this.levelIndex) < levels.length - 1,
        online: true,
        role: this.role,
        roomCode: this.roomCode,
        playerNumber: this.playerNumber,
      });
    }
  }

  publishGuestInput() {
    const input = this.localControls.snapshot();
    const inputJson = JSON.stringify(input);
    if (inputJson !== this.lastInputJson || this.time.now - this.lastInputSentAt > 180) {
      this.lastInputJson = inputJson;
      this.lastInputSentAt = this.time.now;
      roomService.sendInput(input).catch(() => {});
    }
  }

  publishHostWorld(force = false) {
    if (!force && this.time.now - this.lastWorldSentAt < 75) return;
    this.lastWorldSentAt = this.time.now;
    roomService.publishWorld({
      levelIndex: this.levelIndex,
      players: this.players.map((player) => ({
        x: Math.round(player.x * 10) / 10,
        y: Math.round(player.y * 10) / 10,
        vx: Math.round(player.body.velocity.x),
        vy: Math.round(player.body.velocity.y),
        flipX: player.flipX,
      })),
      boxes: this.boxes.map((box) => ({ x: box.x, y: box.y, vx: box.body.velocity.x })),
      movingPlatforms: this.movingPlatforms.map((moving) => ({
        x: moving.platform.x, y: moving.platform.y, active: moving.isActive,
      })),
      plates: this.plates.map((plate) => plate.active),
      doorUnlocked: this.doorUnlocked,
      doorOpen: this.exitDoor.isOpen,
      sequenceStep: this.sequenceStep,
      remainingTime: this.remainingTime,
      status: this.statusText.text,
    }).catch(() => {});
  }

  applyGuestWorld() {
    const world = this.guestWorld;
    if (!world || world.levelIndex !== this.levelIndex) return;
    world.players?.forEach((state, index) => {
      const player = this.players[index];
      player.setPosition(
        Phaser.Math.Linear(player.x, state.x, 0.42),
        Phaser.Math.Linear(player.y, state.y, 0.42),
      );
      player.setFlipX(Boolean(state.flipX));
    });
    world.boxes?.forEach((state, index) => {
      const box = this.boxes[index];
      if (!box) return;
      box.setPosition(
        Phaser.Math.Linear(box.x, state.x, 0.45),
        Phaser.Math.Linear(box.y, state.y, 0.45),
      );
      if (box.coopLabel) box.coopLabel.setPosition(box.x, box.y - box.displayHeight / 2 - 24);
    });
    world.movingPlatforms?.forEach((state, index) => {
      const moving = this.movingPlatforms[index];
      if (!moving) return;
      moving.platform.setPosition(state.x, state.y);
      moving.platform.body.updateFromGameObject();
    });
    world.plates?.forEach((active, index) => this.plates[index]?.setNetworkActive(active));
    if (world.doorOpen || world.doorUnlocked) this.exitDoor.open();
    else this.exitDoor.close();
    this.doorUnlocked = Boolean(world.doorUnlocked);
    this.sequenceStep = world.sequenceStep ?? this.sequenceStep;
    if (world.status) this.statusText.setText(world.status);
    if (this.timerText && world.remainingTime !== null) {
      this.timerText.setText(`남은 시간 ${world.remainingTime}`);
    }
  }

  createTouchControls() {
    if (!('ontouchstart' in window) && navigator.maxTouchPoints === 0) return;
    const addButton = (x, y, label, action) => {
      const circle = this.add.circle(x, y, 30, 0xffffff, 0.16)
        .setStrokeStyle(2, 0xffffff, 0.45)
        .setScrollFactor(0)
        .setDepth(50)
        .setInteractive();
      this.add.text(x, y, label, {
        fontFamily: 'Arial Black, sans-serif', fontSize: '22px', color: '#ffffff',
      }).setOrigin(0.5).setDepth(51);
      circle.on('pointerdown', () => this.localControls.setTouch(action, true));
      circle.on('pointerup', () => this.localControls.setTouch(action, false));
      circle.on('pointerout', () => this.localControls.setTouch(action, false));
    };
    addButton(64, 486, '◀', 'left');
    addButton(134, 486, '▶', 'right');
    addButton(892, 486, '↑', 'jump');
  }

  restartOnlineLevel() {
    if (this.role !== 'host') return;
    roomService.startLevel(this.levelIndex).then(() => {
      this.scene.restart({
        online: true,
        levelIndex: this.levelIndex,
        role: this.role,
        roomCode: this.roomCode,
        playerNumber: this.playerNumber,
      });
    });
  }

  async exitOnlineRoom() {
    if (this.online) await roomService.leave();
    this.scene.start(this.online ? 'OnlineLobbyScene' : 'MenuScene');
  }

  cleanupOnline() {
    this.inputUnsubscribe?.();
    this.worldUnsubscribe?.();
    this.roomUnsubscribe?.();
    this.inputUnsubscribe = null;
    this.worldUnsubscribe = null;
    this.roomUnsubscribe = null;
  }
}
