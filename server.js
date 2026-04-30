const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const matches = new Map();

function generateCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";

  do {
    code = "";
    for (let i = 0; i < length; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
  } while (matches.has(code));

  return code;
}

function makePlayer(socketId) {
  return {
    socketId,
    connected: true,
    finished: false,
    finishTime: null,
    progress: {
      portrait: false,
      box: false,
      clock: false,
      chest: false
    }
  };
}

function solvedCount(progress) {
  return Object.values(progress).filter(Boolean).length;
}

function allSolved(progress) {
  return Object.values(progress).every(Boolean);
}

io.on("connection", (socket) => {
  // PLAYER 1 CREATES MATCH
  socket.on("create_match", () => {
    const code = generateCode();

    const match = {
      code,
      status: "waiting",
      startedAt: null,
      winner: null,
      players: {
        player1: makePlayer(socket.id),
        player2: null
      }
    };

    matches.set(code, match);
    socket.join(code);
    socket.data.matchCode = code;
    socket.data.role = "player1";

    socket.emit("match_created", {
      code,
      role: "player1"
    });
  });

  // PLAYER 2 JOINS MATCH
  socket.on("join_match", ({ code }) => {
    const match = matches.get(code);

    if (!match) {
      socket.emit("join_error", { message: "Match not found" });
      return;
    }

    if (match.players.player2) {
      socket.emit("join_error", { message: "Match is full" });
      return;
    }

    match.players.player2 = makePlayer(socket.id);

    socket.join(code);
    socket.data.matchCode = code;
    socket.data.role = "player2";

    socket.emit("match_joined", {
      code,
      role: "player2"
    });

    io.to(code).emit("match_ready", { code });
  });

  // PLAYER 1 STARTS MATCH
  socket.on("start_match", ({ code }) => {
    const match = matches.get(code);
    if (!match) return;

    // only player1 can start
    if (socket.data.role !== "player1") return;

    if (!match.players.player1 || !match.players.player2) return;
    if (match.status !== "waiting") return;

    match.status = "started";
    match.startedAt = Date.now();

    io.to(code).emit("game_started", {
      startedAt: match.startedAt
    });
  });

  socket.on("progress_update", ({ code, puzzle, solved }) => {
    const match = matches.get(code);
    const role = socket.data.role;

    if (!match || !role || match.status !== "started") return;
    if (!match.players[role]) return;
    if (!(puzzle in match.players[role].progress)) return;

    match.players[role].progress[puzzle] = !!solved;

    const opponentRole = role === "player1" ? "player2" : "player1";
    const opponent = match.players[opponentRole];

    if (opponent) {
      io.to(opponent.socketId).emit("opponent_progress", {
        solvedCount: solvedCount(match.players[role].progress),
        total: 4
      });
    }
  });

  socket.on("finish_game", ({ code }) => {
    const match = matches.get(code);
    const role = socket.data.role;

    if (!match || !role || match.status !== "started") return;

    const player = match.players[role];
    if (!player || player.finished) return;
    if (!allSolved(player.progress)) return;

    player.finished = true;
    player.finishTime = Date.now() - match.startedAt;

    if (!match.winner) {
      match.winner = role;
      match.status = "finished";
    }

    io.to(code).emit("game_over", {
      winner: match.winner,
      results: {
        player1: match.players.player1
          ? {
              finished: match.players.player1.finished,
              finishTime: match.players.player1.finishTime
            }
          : null,
        player2: match.players.player2
          ? {
              finished: match.players.player2.finished,
              finishTime: match.players.player2.finishTime
            }
          : null
      }
    });
  });

  socket.on("quit_game", ({ code }) => {
    const roomCode = code || socket.data.matchCode;
    if (!roomCode) return;

    console.log("quit_game received for room:", roomCode);

    socket.to(roomCode).emit("game_quit");
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);

    const code = socket.data.matchCode;
    const role = socket.data.role;

    if (!code || !role) return;

    const match = matches.get(code);
    if (!match) return;

    if (match.players[role]) {
      match.players[role].connected = false;
    }

    socket.to(code).emit("player_disconnected");
  });

  socket.on("game_finished", ({ code }) => {
  socket.to(code).emit("show_loser_screen");
});
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
