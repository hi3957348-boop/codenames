const level7 = {
  id: 'level7', name: '일곱 번째 구조 신호', number: 7,
  hint: '바깥 신호가 꺼지면 중앙 문도 닫혀요',
  objective: '한 명이 문을 유지하고 다른 한 명이 안쪽 잠금을 찾아야 합니다',
  doorRule: 'relay',
  spawn: { player1: { x: 100, y: 430 }, player2: { x: 165, y: 430 } },
  platforms: [{ x: 480, y: 520, width: 960, height: 40 }],
  walls: [
    { x: 12, y: 290, width: 24, height: 460 },
    { x: 948, y: 290, width: 24, height: 460 },
  ],
  boxes: [],
  plates: [
    { id: 'left', x: 260, y: 493, width: 88, label: '문 유지', accepts: 'players' },
    { id: 'right', x: 680, y: 493, width: 88, label: '안쪽 잠금', accepts: 'players' },
  ],
  door: { x: 480, y: 420, width: 32, height: 160 },
  exit: { x: 855, y: 450, width: 120, height: 96 },
};
export default level7;
