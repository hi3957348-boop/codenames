const level8 = {
  id: 'level8', name: '여덟 번째 구조 신호', number: 8,
  hint: '두 상자의 이동 거리는 다릅니다. 먼저 역할을 나누세요',
  objective: '가장 빠른 운반 순서를 정하고 50초 안에 탈출하세요',
  timeLimit: 50,
  spawn: { player1: { x: 80, y: 430 }, player2: { x: 140, y: 430 } },
  platforms: [{ x: 480, y: 520, width: 960, height: 40 }],
  walls: [
    { x: 12, y: 290, width: 24, height: 460 },
    { x: 948, y: 290, width: 24, height: 460 },
  ],
  boxes: [
    { x: 260, y: 452, width: 64, height: 64 },
    { x: 430, y: 452, width: 64, height: 64 },
  ],
  plates: [
    { id: 'box1', x: 590, y: 493, width: 78, label: '긴 거리', accepts: 'boxes' },
    { id: 'box2', x: 700, y: 493, width: 78, label: '짧은 거리', accepts: 'boxes' },
  ],
  door: { x: 790, y: 420, width: 32, height: 160 },
  exit: { x: 870, y: 450, width: 105, height: 96 },
};
export default level8;
