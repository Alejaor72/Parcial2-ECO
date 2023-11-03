const socket = io();

const cells = document.getElementsByClassName('cell');
const status = document.getElementById('status');
const restartButton = document.getElementById('restart');
let currentPlayer = 1;
let gameOver = false;

socket.on('init', (game) => {
  updateBoard(game);
});

socket.on('start', (game) => {
  status.textContent = `Es el turno del Jugador ${game.currentPlayer === 1 ? 'O' : 'X'}`;
});

socket.on('update', (game) => {
  updateBoard(game);
  if (game.winner) {
    if (game.winner === 'draw') {
      status.textContent = "Es un empate!";
    } else {
      status.textContent = `Jugador ${game.winner === 'O' ? 'O' : 'X'} gana!`;
    }
  } else {
    status.textContent = `Es el turno del Jugador ${game.currentPlayer === 1 ? 'O' : 'X'}`;
  }
});

restartButton.addEventListener('click', () => {
  socket.emit('restart');
});

for (let i = 0; i < cells.length; i++) {
  cells[i].addEventListener('click', () => {
    socket.emit('move', i);
  });
}

function updateBoard(game) {
  for (let i = 0; i < game.board.length; i++) {
    cells[i].textContent = game.board[i];
  }
}

