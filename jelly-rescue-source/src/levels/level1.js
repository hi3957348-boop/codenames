const level1 = {
  id: 'level1',
  name: '첫 번째 구조 신호',
  number: 1,
  hint: '상자를 높은 발판의 지지 기둥 앞까지 밀어 보세요',
  objective: '① 상자 밀기  ② 발판 2개 누르기  ③ 둘 다 탈출',
  spawn: {
    player1: { x: 92, y: 430 },
    player2: { x: 150, y: 430 },
  },
  platforms: [
    { x: 480, y: 520, width: 960, height: 40 },
    { x: 610, y: 380, width: 300, height: 28 },
    { x: 905, y: 330, width: 110, height: 20 },
  ],
  walls: [
    { x: 12, y: 290, width: 24, height: 460 },
    { x: 948, y: 290, width: 24, height: 460 },
    { x: 500, y: 447, width: 16, height: 106 },
  ],
  boxes: [{ x: 390, y: 452, width: 64, height: 64 }],
  plates: [
    { id: 'left', x: 245, y: 493, width: 74, label: '1', accepts: 'players' },
    { id: 'right', x: 625, y: 353, width: 74, label: '2', accepts: 'players' },
  ],
  door: { x: 760, y: 420, width: 32, height: 160 },
  exit: { x: 857, y: 450, width: 118, height: 96 },
};

export default level1;
