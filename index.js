const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


const game = {
  board: Array(9).fill(''), 
  currentPlayer: 1, // 1: círculo (O), 2: cruz (X)
  winner: null,
};

// Maneja la lógica del juego
function checkWinner() {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let line of lines) {
    const [a, b, c] = line;
    if (
      game.board[a] !== '' &&
      game.board[a] === game.board[b] &&
      game.board[a] === game.board[c]
    ) {
      game.winner = game.board[a];
      return;
    }
  }

  if (!game.board.includes('')) {
    game.winner = 'draw'; // Empate
  }
}

// Maneja la conexión de un nuevo cliente
io.on('connection', (socket) => {
  socket.emit('init', game);

  socket.on('move', (position) => {
    if (game.winner || game.board[position] !== '' || game.currentPlayer !== socket.player) {
      return;
    }

    game.board[position] = game.currentPlayer === 1 ? 'O' : 'X';
    game.currentPlayer = 3 - game.currentPlayer; // Cambia el turno

    checkWinner();
    io.emit('update', game);
  });

  socket.on('restart', () => {
    // Reinicia el juego
    game.board = Array(9).fill('');
    game.currentPlayer = 1;
    game.winner = null;
    io.emit('update', game);
  });

  // Asigna a cada jugador su figura
  if (!game.player1) {
    game.player1 = socket.id;
    socket.player = 1;
  } else if (!game.player2) {
    game.player2 = socket.id;
    socket.player = 2;
  }

  if (game.player1 && game.player2) {
    io.emit('start', game);
  }

  
});
