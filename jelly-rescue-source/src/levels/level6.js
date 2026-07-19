const level6 = {
  id: 'level6', name: '여섯 번째 구조 신호', number: 6,
  hint: '승강기는 아래 신호가 켜져 있는 동안에만 움직여요',
  objective: '누가 조종하고 누가 올라갈지 먼저 역할을 정하세요',
  spawn: { player1: { x: 100, y: 430 }, player2: { x: 165, y: 430 } },
  platforms: [
    { x: 480, y: 520, width: 960, height: 40 },
    { x: 650, y: 300, width: 220, height: 24 },
  ],
  movingPlatforms: [
    { x: 420, y: 450, width: 120, height: 20, toY: 335, duration: 2200, requiresPlate: 'ground' },
  ],
  walls: [
    { x: 12, y: 290, width: 24, height: 460 },
    { x: 948, y: 290, width: 24, height: 460 },
  ],
  boxes: [],
  plates: [
    { id: 'ground', x: 210, y: 493, width: 88, label: '승강기 전원', accepts: 'players' },
    { id: 'upper', x: 650, y: 273, width: 82, label: '위쪽 잠금', accepts: 'players' },
  ],
  door: { x: 790, y: 420, width: 32, height: 160 },
  exit: { x: 870, y: 450, width: 105, height: 96 },
};
export default level6;
