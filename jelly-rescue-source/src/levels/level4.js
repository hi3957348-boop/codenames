const level4 = {
  id: 'level4', name: '네 번째 구조 신호', number: 4,
  hint: '벽의 단서: 낮은 발자국 → 나무의 무게 → 높은 손바닥',
  objective: '세 신호의 의미와 올바른 순서를 함께 추리하세요',
  sequence: ['ground', 'box', 'player'],
  spawn: { player1: { x: 90, y: 430 }, player2: { x: 150, y: 430 } },
  platforms: [
    { x: 480, y: 520, width: 960, height: 40 },
    { x: 650, y: 380, width: 200, height: 28 },
  ],
  walls: [
    { x: 12, y: 290, width: 24, height: 460 },
    { x: 948, y: 290, width: 24, height: 460 },
  ],
  boxes: [{ x: 330, y: 452, width: 64, height: 64 }],
  plates: [
    { id: 'ground', x: 225, y: 493, width: 82, label: '발자국', accepts: 'players' },
    { id: 'box', x: 500, y: 493, width: 82, label: '나무', accepts: 'boxes' },
    { id: 'player', x: 650, y: 353, width: 82, label: '손바닥', accepts: 'players' },
  ],
  door: { x: 785, y: 420, width: 32, height: 160 },
  exit: { x: 866, y: 450, width: 112, height: 96 },
};
export default level4;
