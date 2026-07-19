const level10 = {
  id: 'level10', name: '마지막 구조 작전', number: 10,
  hint: '상자는 신호이면서 승강기로 가는 길을 막을 수도 있어요',
  objective: '상자 위치와 두 사람의 최종 역할을 먼저 계획하세요',
  spawn: { player1: { x: 70, y: 430 }, player2: { x: 130, y: 430 } },
  platforms: [
    { x: 480, y: 520, width: 960, height: 40 },
    { x: 665, y: 285, width: 210, height: 24 },
  ],
  movingPlatforms: [
    { x: 510, y: 450, width: 110, height: 20, toY: 320, duration: 1900, requiresPlate: 'heavy' },
  ],
  walls: [
    { x: 12, y: 290, width: 24, height: 460 },
    { x: 948, y: 290, width: 24, height: 460 },
  ],
  boxes: [{ x: 270, y: 450, width: 96, height: 72, heavy: true }],
  plates: [
    { id: 'heavy', x: 400, y: 493, width: 110, label: '승강기 전원', accepts: 'boxes' },
    { id: 'upper', x: 665, y: 258, width: 92, label: '마지막 신호', accepts: 'players' },
  ],
  door: { x: 800, y: 420, width: 32, height: 160 },
  exit: { x: 878, y: 450, width: 95, height: 96 },
};
export default level10;
