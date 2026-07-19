import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getDatabase,
  get,
  onDisconnect,
  onValue,
  ref,
  remove,
  runTransaction,
  serverTimestamp,
  set,
  update,
} from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyAHib_-XPXfuvhsZcPlMSnqi4O46kAR0mM',
  authDomain: 'non-1-4a6f5.firebaseapp.com',
  databaseURL: 'https://non-1-4a6f5-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'non-1-4a6f5',
  storageBucket: 'non-1-4a6f5.firebasestorage.app',
  messagingSenderId: '871721592960',
  appId: '1:871721592960:web:b342eab286024473845e65',
};

const ROOM_ROOT = 'jellyRescueRooms';
const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function makeRoomCode() {
  return Array.from({ length: 6 }, () => (
    ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)]
  )).join('');
}

function makeClientId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

class FirebaseRoomService {
  constructor() {
    this.app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    this.db = getDatabase(this.app);
    this.clientId = makeClientId();
    this.roomCode = null;
    this.role = null;
    this.playerNumber = null;
    this.disconnectHandle = null;
  }

  roomPath(child = '') {
    const base = `${ROOM_ROOT}/${this.roomCode}`;
    return child ? `${base}/${child}` : base;
  }

  async createRoom(levelIndex = 0) {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const roomCode = makeRoomCode();
      const roomRef = ref(this.db, `${ROOM_ROOT}/${roomCode}`);
      const result = await runTransaction(roomRef, (current) => {
        if (current !== null) return undefined;
        return {
          status: 'waiting',
          levelIndex,
          generation: Date.now(),
          createdAt: serverTimestamp(),
          players: {
            1: { id: this.clientId, connected: true, joinedAt: serverTimestamp() },
          },
        };
      }, { applyLocally: false });

      if (result.committed) {
        this.roomCode = roomCode;
        this.role = 'host';
        this.playerNumber = 1;
        await this.attachPresence();
        return roomCode;
      }
    }
    throw new Error('방 코드를 만들지 못했습니다. 잠시 후 다시 시도해 주세요.');
  }

  async joinRoom(code) {
    const roomCode = code.trim().toUpperCase();
    if (roomCode.length !== 6) throw new Error('6자리 방 코드를 입력해 주세요.');

    const roomRef = ref(this.db, `${ROOM_ROOT}/${roomCode}`);
    const snapshot = await get(roomRef);
    if (!snapshot.exists()) throw new Error('존재하지 않는 방입니다. 코드를 확인해 주세요.');

    const guestRef = ref(this.db, `${ROOM_ROOT}/${roomCode}/players/2`);
    const guestResult = await runTransaction(guestRef, (current) => {
      if (current?.connected && current.id !== this.clientId) return undefined;
      return { id: this.clientId, connected: true, joinedAt: serverTimestamp() };
    }, { applyLocally: false });
    if (!guestResult.committed) throw new Error('이미 두 명이 참가한 방입니다.');

    this.roomCode = roomCode;
    this.role = 'guest';
    this.playerNumber = 2;
    await this.attachPresence();
    await update(roomRef, { status: 'playing', generation: Date.now() });
    return snapshot.val().levelIndex ?? 0;
  }

  async attachPresence() {
    const connectedRef = ref(this.db, this.roomPath(`players/${this.playerNumber}/connected`));
    this.disconnectHandle = onDisconnect(connectedRef);
    await this.disconnectHandle.set(false);
    await set(connectedRef, true);
  }

  subscribeRoom(callback) {
    return onValue(ref(this.db, this.roomPath()), (snapshot) => callback(snapshot.val()));
  }

  subscribeInput(playerNumber, callback) {
    return onValue(ref(this.db, this.roomPath(`inputs/${playerNumber}`)), (snapshot) => {
      callback(snapshot.val() ?? { left: false, right: false, jump: false });
    });
  }

  subscribeWorld(callback) {
    return onValue(ref(this.db, this.roomPath('world')), (snapshot) => {
      if (snapshot.exists()) callback(snapshot.val());
    });
  }

  sendInput(input) {
    if (!this.roomCode || !this.playerNumber) return Promise.resolve();
    return set(ref(this.db, this.roomPath(`inputs/${this.playerNumber}`)), {
      ...input,
      at: Date.now(),
    });
  }

  publishWorld(world) {
    if (this.role !== 'host') return Promise.resolve();
    return set(ref(this.db, this.roomPath('world')), { ...world, at: Date.now() });
  }

  completeLevel(result) {
    if (this.role !== 'host') return Promise.resolve();
    return update(ref(this.db, this.roomPath()), {
      status: 'completed',
      completed: result,
    });
  }

  async startLevel(levelIndex) {
    if (this.role !== 'host') return;
    await update(ref(this.db, this.roomPath()), {
      status: 'playing',
      levelIndex,
      generation: Date.now(),
      completed: null,
      world: null,
      inputs: null,
    });
  }

  async leave() {
    if (!this.roomCode || !this.playerNumber) return;
    if (this.disconnectHandle) await this.disconnectHandle.cancel();
    await set(ref(this.db, this.roomPath(`players/${this.playerNumber}/connected`)), false);
    if (this.role === 'host') {
      const roomSnapshot = await get(ref(this.db, this.roomPath()));
      if (!roomSnapshot.val()?.players?.[2]?.connected) {
        await remove(ref(this.db, this.roomPath()));
      }
    }
    this.roomCode = null;
    this.role = null;
    this.playerNumber = null;
  }
}

export const roomService = new FirebaseRoomService();
