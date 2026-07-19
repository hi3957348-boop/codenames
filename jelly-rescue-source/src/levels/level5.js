const level5 = {
  id: 'level5', name: '다섯 번째 구조 신호', number: 5,
  hint: '상자가 없어요. 친구를 발판 삼아 올라가 보세요',
  objective: '① 한 젤리가 받쳐주기  ② 친구 위에서 점프  ③ 두 발판 누르기',
  spawn: { player1: { x: 120, y: 430 }, player2: { x: 185, y: 430 } },
  platforms: [
    { x: 480, y: 520, width: 960, height: 40 },
    { x: 500, y: 400, width: 180, height: 24 },
  ],
  walls: [
    { x: 12, y: 290, width: 24, height: 460 },
    { x: 948, y: 290, width: 24, height: 460 },
  ],
  boxes: [],
  plates: [
    { id: 'ground', x: 255, y: 493, width: 78, label: '아래', accepts: 'players' },
    { id: 'upper', x: 500, y: 373, width: 78, label: '위', accepts: 'players' },
  ],
  door: { x: 760, y: 420, width: 32, height: 160 },
  exit: { x: 855, y: 450, width: 120, height: 96 },
};
export default level5;
