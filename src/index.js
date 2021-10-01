import Game from './Game';

const startBtn = document.getElementById('btn-start');
const difficultyElem = document.getElementById('difficulty');
const game = new Game('canvas');

difficultyElem.addEventListener('change', (e) => game.changeDifficulty(e.target.value), false);

startBtn.addEventListener('click', () => {
  document.querySelector('.options').classList.toggle('hide');
  game.start();
}, false);
