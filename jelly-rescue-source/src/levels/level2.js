const level2 = {
  id: 'level2',
  name: '두 번째 구조 신호',
  number: 2,
  hint: '이번에는 상자가 발판을 눌러야 해요',
  objective: '① 상자 2개 옮기기  ② 상자로 발판 누르기  ③ 함께 탈출',
  spawn: {
    player1: { x: 86, y: 430 },
    player2: { x: 142, y: 430 },
  },
  platforms: [
    { x: 480, y: 520, width: 960, height: 40 },
    { x: 472, y: 350, width: 180, height: 24 },
    { x: 714, y: 405, width: 140, height: 24 },
  ],
  walls: [
    { x: 12, y: 290, width: 24, height: 460 },
    { x: 948, y: 290, width: 24, height: 460 },
  ],
  boxes: [
    { x: 225, y: 452, width: 64, height: 64 },
    { x: 510, y: 282, width: 64, height: 64 },
  ],
  plates: [
    { id: 'box-left', x: 355, y: 493, width: 76, label: '상자', accepts: 'boxes' },
    { id: 'box-right', x: 650, y: 493, width: 76, label: '상자', accepts: 'boxes' },
  ],
  door: { x: 785, y: 420, width: 32, height: 160 },
  exit: { x: 866, y: 450, width: 112, height: 96 },
};

export default level2;
