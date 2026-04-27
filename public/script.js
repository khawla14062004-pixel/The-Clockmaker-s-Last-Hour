const socket = io();

const screens = {
  start: document.getElementById("start-screen"),
  host: document.getElementById("host-screen"),
  join: document.getElementById("join-screen"),
  instructions: document.getElementById("instructions-screen"),
  waiting: document.getElementById("waiting-screen"),
  workshop: document.getElementById("workshop-screen"),
  portrait: document.getElementById("portrait-screen"),
  bookshelf: document.getElementById("bookshelf-screen"),
  booksCloseup: document.getElementById("books-closeup-screen"),
  book: document.getElementById("book-screen"),
  clockwatch: document.getElementById("clockwatch-screen"),
  boxPuzzle: document.getElementById("box-puzzle-screen"),
  clockPuzzle: document.getElementById("clock-puzzle-screen"),
  chestPuzzle: document.getElementById("chest-puzzle-screen"),
  watchshop: document.getElementById("watchshop-screen"),
  portraitPuzzle: document.getElementById("portrait-puzzle-screen"),
  portraitResult: document.getElementById("portrait-result-screen"),
  settings: document.getElementById("settings-screen")
};

const gameState = {
  selectedRole: null,
  cluesFound: 0,
  timer: 3600
};

let previousScreen = screens.start;
let currentRoomCode = null;
let playerNumber = null;
let gameStarted = false;

function showScreen(screenToShow) {
  Object.values(screens).forEach((screen) => {
    if (!screen) return;
    screen.classList.add("hidden");
    screen.classList.remove("active");
  });

  if (!screenToShow) return;
  screenToShow.classList.remove("hidden");
  screenToShow.classList.add("active");
}

function openSettings() {
  const activeScreen = Object.values(screens).find((screen) =>
    screen && screen.classList.contains("active")
  );

  if (activeScreen) {
    previousScreen = activeScreen;
  }

  showScreen(screens.settings);
}

function updateWaitingText(message) {
  const waitingText = document.getElementById("waiting-text");
  if (waitingText) {
    waitingText.textContent = message;
  }
}

function showWaitingScreen(message = "waiting for all players to join...") {
  showScreen(screens.waiting);
}

function showWorkshopIfStarted() {
  if (!gameStarted) return;
  showScreen(screens.workshop);
}

document.getElementById("start-btn").addEventListener("click", () => {
  showScreen(screens.host);
  socket.emit("create_match");
});

document.getElementById("back-from-host-btn").addEventListener("click", () => {
  showScreen(screens.start);
});

const hostRoles = ["Analyst", "Mechanist"];
let currentHostRoleIndex = 0;

const roleCards = document.querySelectorAll(".role-card");
const switchRoleBtn = document.getElementById("switch-role-btn");

function updateHostRoleSelection() {
  roleCards.forEach((card, index) => {
    card.classList.remove("active-role");

    if (index === currentHostRoleIndex) {
      card.classList.add("active-role");
      const label = card.querySelector("p");
      if (label) label.textContent = "Player 1 (you)";
    } else {
      const label = card.querySelector("p");
      if (label) label.textContent = "Player 2";
    }
  });

  gameState.selectedRole = hostRoles[currentHostRoleIndex];
}

switchRoleBtn.addEventListener("click", () => {
  currentHostRoleIndex = currentHostRoleIndex === 0 ? 1 : 0;
  updateHostRoleSelection();
});

updateHostRoleSelection();

document.getElementById("start-hosted-game-btn").addEventListener("click", () => {
  if (!currentRoomCode) return;
  socket.emit("start_match", { code: currentRoomCode });
});

document.getElementById("instructions-btn").addEventListener("click", () => {
  showScreen(screens.instructions);
});

document.getElementById("back-to-menu-btn").addEventListener("click", () => {
  showScreen(screens.start);
});

document.getElementById("join-btn").addEventListener("click", () => {
  showScreen(screens.join);
});

document.getElementById("back-from-join-btn").addEventListener("click", () => {
  showScreen(screens.start);
});

document.getElementById("join-room-confirm-btn").addEventListener("click", () => {
  const codeInput = document.getElementById("join-code-input");
  const enteredCode = codeInput.value.trim().toUpperCase();

  if (enteredCode.length !== 6) {
    alert("Please enter a 6-character room code.");
    return;
  }

  socket.emit("join_match", {
  code: enteredCode
});
});

document.getElementById("join-code-input").addEventListener("input", (event) => {
  event.target.value = event.target.value.toUpperCase();
});

/* -------------------------
   Socket.IO multiplayer
------------------------- */

socket.on("match_created", (data) => {
  currentRoomCode = data.code;
  playerNumber = data.role;
  gameStarted = false;

  const inviteCodeEl = document.getElementById("invite-code");
  if (inviteCodeEl) {
    inviteCodeEl.textContent = currentRoomCode;
  }

  showScreen(screens.host);
});

socket.on("match_joined", (data) => {
  currentRoomCode = data.code;
  playerNumber = data.role;
  gameStarted = false;

  showWaitingScreen("waiting for host to start...");
});

socket.on("match_ready", () => {
  updateWaitingText("all players joined. starting game...");

  if (playerNumber === "player1") {
    socket.emit("start_match", { code: currentRoomCode });
  }
});

socket.on("game_started", () => {
  gameStarted = true;
  showScreen(screens.workshop);
});

socket.on("join_error", (data) => {
  alert(data.message || "Could not join room.");
});

socket.on("playerLeft", () => {
  gameStarted = false;
  showWaitingScreen("the other player disconnected. waiting for player to rejoin...");
});

/* -------------------------
   Game navigation
------------------------- */

document.getElementById("portrait-btn").addEventListener("click", () => {
  showScreen(screens.portraitPuzzle);
});

document.getElementById("back-to-workshop-btn").addEventListener("click", () => {
  showWorkshopIfStarted();
});

document.getElementById("left-arrow-btn").addEventListener("click", () => {
  alert("Go left");
});

document.getElementById("right-arrow-btn").addEventListener("click", () => {
  showScreen(screens.bookshelf);
});

document.getElementById("bookshelf-left-arrow-btn").addEventListener("click", () => {
  showScreen(screens.workshop);
});

document.getElementById("bookshelf-right-arrow-btn").addEventListener("click", () => {
  showScreen(screens.clockwatch);
});

document.getElementById("books-btn").addEventListener("click", () => {
  showScreen(screens.booksCloseup);
});

document.getElementById("books-closeup-back-btn").addEventListener("click", () => {
  showScreen(screens.bookshelf);
});

document.getElementById("clockwatch-left-arrow-btn").addEventListener("click", () => {
  showScreen(screens.bookshelf);
});

document.getElementById("clockwatch-right-arrow-btn").addEventListener("click", () => {
  showScreen(screens.watchshop);
});

document.getElementById("box-btn").addEventListener("click", () => {
  showScreen(screens.boxPuzzle);
});

document.getElementById("box-puzzle-back-btn").addEventListener("click", () => {
  showScreen(screens.clockwatch);
});

document.getElementById("clock-btn").addEventListener("click", () => {
  showScreen(screens.clockPuzzle);
});

document.getElementById("clock-puzzle-back-btn").addEventListener("click", () => {
  showScreen(screens.clockwatch);
});

const settingsButtons = document.querySelectorAll(".settings-open-btn");

settingsButtons.forEach((button) => {
  button.addEventListener("click", openSettings);
});

document.getElementById("settings-back-btn").addEventListener("click", () => {
  showScreen(previousScreen);
});

document.getElementById("chest-btn").addEventListener("click", () => {
  showScreen(screens.chestPuzzle);
});

document.getElementById("chest-puzzle-back-btn").addEventListener("click", () => {
  showScreen(screens.clockwatch);
});

document.getElementById("watchshop-left-arrow-btn").addEventListener("click", () => {
  showScreen(screens.clockwatch);
});

/* -------------------------
   Portrait puzzle
------------------------- */

const puzzleBoard = document.getElementById("puzzle-board");
const puzzlePieces = Array.from(document.querySelectorAll(".puzzle-piece"));

let selectedPiece = null;

function shufflePuzzle() {
  if (!puzzleBoard) return;

  const shuffled = [...puzzlePieces].sort(() => Math.random() - 0.5);
  puzzleBoard.innerHTML = "";
  shuffled.forEach((piece) => {
    piece.classList.remove("selected");
    puzzleBoard.appendChild(piece);
  });
}

puzzlePieces.forEach((piece) => {
  piece.addEventListener("click", () => {
    if (!selectedPiece) {
      selectedPiece = piece;
      piece.classList.add("selected");
      return;
    }

    if (selectedPiece === piece) {
      piece.classList.remove("selected");
      selectedPiece = null;
      return;
    }

    swapPieces(selectedPiece, piece);
    selectedPiece.classList.remove("selected");
    selectedPiece = null;

    checkPuzzleSolved();
  });
});

function swapPieces(pieceA, pieceB) {
  const tempSrc = pieceA.src;
  const tempCorrect = pieceA.dataset.correct;

  pieceA.src = pieceB.src;
  pieceA.dataset.correct = pieceB.dataset.correct;

  pieceB.src = tempSrc;
  pieceB.dataset.correct = tempCorrect;
}

function checkPuzzleSolved() {
  const currentPieces = Array.from(document.querySelectorAll(".puzzle-piece"));

  const solved = currentPieces.every((piece, index) => {
    return Number(piece.dataset.correct) === index;
  });

  if (solved) {
    showScreen(screens.portraitResult);
  }
}

shufflePuzzle();

document.getElementById("portrait-puzzle-back-btn").addEventListener("click", () => {
  showScreen(screens.workshop);
});

document.getElementById("portrait-result-back-btn").addEventListener("click", () => {
  showScreen(screens.workshop);
});

document.getElementById("book-btn").addEventListener("click", () => {
  showScreen(screens.book);
});

document.getElementById("back-from-book-btn").addEventListener("click", () => {
  showScreen(screens.workshop);
});
