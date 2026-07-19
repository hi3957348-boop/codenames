const level9 = {
  id: 'level9', name: '아홉 번째 구조 신호', number: 9,
  hint: '단서: 큰 힘이 먼저 길을 열고, 작은 힘이 마지막을 채운다',
  objective: '두 상자의 규칙과 신호 순서를 추리하세요',
  sequence: ['heavy', 'light'],
  spawn: { player1: { x: 75, y: 430 }, player2: { x: 135, y: 430 } },
  platforms: [{ x: 480, y: 520, width: 960, height: 40 }],
  walls: [
    { x: 12, y: 290, width: 24, height: 460 },
    { x: 948, y: 290, width: 24, height: 460 },
  ],
  boxes: [
    { x: 270, y: 450, width: 96, height: 72, heavy: true },
    { x: 455, y: 452, width: 64, height: 64 },
  ],
  plates: [
    { id: 'heavy', x: 585, y: 493, width: 108, label: '큰 힘', accepts: 'boxes' },
    { id: 'light', x: 715, y: 493, width: 82, label: '작은 힘', accepts: 'boxes' },
  ],
  door: { x: 800, y: 420, width: 32, height: 160 },
  exit: { x: 878, y: 450, width: 95, height: 96 },
};
export default level9;
