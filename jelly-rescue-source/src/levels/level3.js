const level3 = {
  id: 'level3',
  name: '세 번째 구조 신호',
  number: 3,
  hint: '보라색 상자는 두 젤리가 함께 밀어야 해요',
  objective: '① 둘이 상자 왼쪽에 서기  ② 함께 오른쪽으로 밀기  ③ 탈출',
  spawn: {
    player1: { x: 90, y: 430 },
    player2: { x: 150, y: 430 },
  },
  platforms: [
    { x: 480, y: 520, width: 960, height: 40 },
    { x: 645, y: 365, width: 170, height: 24 },
  ],
  walls: [
    { x: 12, y: 290, width: 24, height: 460 },
    { x: 948, y: 290, width: 24, height: 460 },
  ],
  boxes: [
    { x: 350, y: 450, width: 96, height: 72, heavy: true },
  ],
  plates: [
    { id: 'heavy', x: 640, y: 493, width: 112, label: '무거운 상자', accepts: 'boxes' },
  ],
  door: { x: 785, y: 420, width: 32, height: 160 },
  exit: { x: 866, y: 450, width: 112, height: 96 },
};

export default level3;
