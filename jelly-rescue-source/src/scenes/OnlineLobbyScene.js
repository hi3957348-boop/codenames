import Phaser from 'phaser';
import { roomService } from '../online/FirebaseRoomService.js';

export default class OnlineLobbyScene extends Phaser.Scene {
  constructor() {
    super('OnlineLobbyScene');
  }

  create() {
    this.started = false;
    this.roomUnsubscribe = null;
    this.cameras.main.setBackgroundColor('#6255a5');
    this.add.rectangle(480, 270, 960, 540, 0x6255a5);
    this.add.rectangle(480, 270, 960, 540, 0x38a9c8, 0.2);
    this.add.circle(820, 70, 190, 0x91a9e8, 0.13);
    this.add.circle(120, 480, 210, 0x594293, 0.18);

    this.lobby = this.add.dom(480, 270).createFromHTML(this.lobbyMarkup());
    this.mode = 'host';
    this.bindLobbyEvents();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());
  }

  lobbyMarkup() {
    return `
      <section class="online-lobby" aria-label="젤리구조대 온라인 입장">
        <div class="oncuvate-logo"><span class="oncuvate-mark">↟</span>Oncuvate</div>
        <div class="lobby-card">
          <div class="lesson-icon">🤝</div>
          <h1>젤리구조대 온라인</h1>
          <p class="lesson-line">10개의 협동 퍼즐 · 2인 실시간 플레이</p>
          <p class="lobby-guide">한 명은 방을 만들고, 친구는 코드를 입력하세요.</p>
          <div class="role-tabs" role="tablist">
            <button id="host-tab" class="role-tab active" type="button">🏠 방 만들기</button>
            <button id="guest-tab" class="role-tab" type="button">🔑 코드 입장</button>
          </div>
          <label id="stage-wrap" class="lobby-field">
            <span>시작 스테이지</span>
            <select id="stage-select">
              ${Array.from({ length: 10 }, (_, index) => (
                `<option value="${index}">${index + 1}단계</option>`
              )).join('')}
            </select>
          </label>
          <label id="code-wrap" class="lobby-field hidden">
            <span>방 코드</span>
            <input id="room-code" maxlength="6" autocomplete="off" placeholder="6자리 코드 입력" />
          </label>
          <p id="lobby-error" class="lobby-error" aria-live="polite"></p>
          <button id="enter-room" class="enter-room" type="button">방 만들기</button>
          <p class="lobby-footnote">각 기기에서 이 주소를 열고 접속하세요 · PC 키보드와 터치 지원</p>
        </div>
      </section>`;
  }

  bindLobbyEvents() {
    const hostTab = this.lobby.getChildByID('host-tab');
    const guestTab = this.lobby.getChildByID('guest-tab');
    const enterButton = this.lobby.getChildByID('enter-room');
    const roomCode = this.lobby.getChildByID('room-code');

    hostTab.addEventListener('click', () => this.setMode('host'));
    guestTab.addEventListener('click', () => this.setMode('guest'));
    enterButton.addEventListener('click', () => this.submit());
    roomCode.addEventListener('input', () => {
      roomCode.value = roomCode.value.toUpperCase().replace(/[^A-Z2-9]/g, '').slice(0, 6);
    });
    roomCode.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') this.submit();
    });
  }

  setMode(mode) {
    this.mode = mode;
    const hostTab = this.lobby.getChildByID('host-tab');
    const guestTab = this.lobby.getChildByID('guest-tab');
    hostTab.classList.toggle('active', mode === 'host');
    guestTab.classList.toggle('active', mode === 'guest');
    this.lobby.getChildByID('stage-wrap').classList.toggle('hidden', mode !== 'host');
    this.lobby.getChildByID('code-wrap').classList.toggle('hidden', mode !== 'guest');
    this.lobby.getChildByID('enter-room').textContent = mode === 'host' ? '방 만들기' : '입장하기';
    this.setError('');
  }

  setError(message) {
    this.lobby.getChildByID('lobby-error').textContent = message;
  }

  async submit() {
    const button = this.lobby.getChildByID('enter-room');
    button.disabled = true;
    button.textContent = '연결 중...';
    this.setError('');
    try {
      if (this.mode === 'host') {
        const levelIndex = Number(this.lobby.getChildByID('stage-select').value);
        const code = await roomService.createRoom(levelIndex);
        this.showWaiting(code, levelIndex);
        this.watchRoom(levelIndex);
      } else {
        const code = this.lobby.getChildByID('room-code').value;
        const levelIndex = await roomService.joinRoom(code);
        this.startGame(levelIndex);
      }
    } catch (error) {
      this.setError(this.friendlyError(error));
      button.disabled = false;
      button.textContent = this.mode === 'host' ? '방 만들기' : '입장하기';
    }
  }

  friendlyError(error) {
    const message = error?.message ?? '';
    if (message.includes('PERMISSION_DENIED')) {
      return 'Firebase 접근 권한이 필요합니다. 데이터베이스 규칙을 확인해 주세요.';
    }
    if (message.includes('network')) return '인터넷 연결을 확인해 주세요.';
    return message || '방 연결에 실패했습니다. 다시 시도해 주세요.';
  }

  showWaiting(code, levelIndex) {
    this.lobby.setHTML(`
      <section class="online-lobby waiting" aria-label="친구 기다리기">
        <div class="oncuvate-logo"><span class="oncuvate-mark">↟</span>Oncuvate</div>
        <div class="lobby-card waiting-card">
          <div class="lesson-icon">🫧</div>
          <h1>방이 만들어졌어요</h1>
          <p class="lesson-line">${levelIndex + 1}단계부터 시작</p>
          <p class="lobby-guide">친구에게 아래 코드를 알려주세요.</p>
          <div class="room-code-display">${code}</div>
          <div class="waiting-status"><span></span> 2번 젤리를 기다리는 중...</div>
          <button id="copy-code" class="enter-room" type="button">코드 복사</button>
          <p class="lobby-footnote">친구도 같은 게임 주소에서 ‘코드 입장’을 선택하면 됩니다.</p>
        </div>
      </section>`);
    this.lobby.getChildByID('copy-code').addEventListener('click', async () => {
      await navigator.clipboard?.writeText(code);
      this.lobby.getChildByID('copy-code').textContent = '복사했어요!';
    });
  }

  watchRoom(fallbackLevelIndex) {
    this.roomUnsubscribe = roomService.subscribeRoom((room) => {
      if (!room || this.started) return;
      if (room.status === 'playing' && room.players?.[2]?.connected) {
        this.startGame(room.levelIndex ?? fallbackLevelIndex);
      }
    });
  }

  startGame(levelIndex) {
    if (this.started) return;
    this.started = true;
    this.cleanup();
    this.scene.start('GameScene', {
      online: true,
      levelIndex,
      roomCode: roomService.roomCode,
      role: roomService.role,
      playerNumber: roomService.playerNumber,
    });
  }

  cleanup() {
    if (this.roomUnsubscribe) this.roomUnsubscribe();
    this.roomUnsubscribe = null;
  }
}
