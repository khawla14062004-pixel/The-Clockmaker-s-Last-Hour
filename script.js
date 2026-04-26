const screens = {
  start: document.getElementById("start-screen"),
  host: document.getElementById("host-screen"),
  join: document.getElementById("join-screen"),
  instructions: document.getElementById("instructions-screen"),
  workshop: document.getElementById("workshop-screen"),
  portrait: document.getElementById("portrait-screen"),
  bookshelf: document.getElementById("bookshelf-screen"),
  booksCloseup: document.getElementById("books-closeup-screen"),
   clockwatch: document.getElementById("clockwatch-screen"),
  boxPuzzle: document.getElementById("box-puzzle-screen"),
  clockPuzzle: document.getElementById("clock-puzzle-screen"),
  chestPuzzle: document.getElementById("chest-puzzle-screen"),
  watchshop: document.getElementById("watchshop-screen"),
  portraitPuzzle: document.getElementById("portrait-puzzle-screen"),
  portraitResult: document.getElementById("portrait-result-screen"),
  booksPuzzle: document.getElementById("books-puzzle-screen"),
  codePuzzle: document.getElementById("code-puzzle-screen"),
  workshopOpen: document.getElementById("workshop-open-screen"),
  codePuzzle: document.getElementById("code-puzzle-screen"),
  settings: document.getElementById("settings-screen")
};

const gameState = {
  selectedRole: null,
  cluesFound: 0,
  timer: 3600
};

let previousScreen = screens.start;

function showScreen(screenToShow) {
  Object.values(screens).forEach((screen) => {
    screen.classList.add("hidden");
    screen.classList.remove("active");
  });

  screenToShow.classList.remove("hidden");
  screenToShow.classList.add("active");
}

function openSettings() {
  const activeScreen = Object.values(screens).find((screen) =>
    screen.classList.contains("active")
  );

  if (activeScreen) {
    previousScreen = activeScreen;
  }

  showScreen(screens.settings);
}

document.getElementById("start-btn").addEventListener("click", () => {
  refreshInviteCode();
  showScreen(screens.host);
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
      card.querySelector("p").textContent = "Player 1 (you)";
    } else {
      card.querySelector("p").textContent = "Player 2";
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
  showScreen(screens.workshop);
});

function generateInviteCode(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
}

function refreshInviteCode() {
  document.getElementById("invite-code").textContent = generateInviteCode(6);
}

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
    alert("Please enter a 6-character invitation code.");
    return;
  }

  showScreen(screens.workshop);
});

document.getElementById("join-code-input").addEventListener("input", (event) => {
  event.target.value = event.target.value.toUpperCase();
});

document.getElementById("portrait-btn").addEventListener("click", () => {
  showScreen(screens.portraitPuzzle);
});

document.getElementById("back-to-workshop-btn").addEventListener("click", () => {
  showScreen(screens.workshop);
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

const puzzleBoard = document.getElementById("puzzle-board");
const puzzlePieces = Array.from(document.querySelectorAll(".puzzle-piece"));

let selectedPiece = null;

function shufflePuzzle() {
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
}}

shufflePuzzle();


document.getElementById("portrait-puzzle-back-btn").addEventListener("click", () => {
  showScreen(screens.workshop);
});

document.getElementById("portrait-result-back-btn").addEventListener("click", () => {
  showScreen(screens.workshop);
});


books.forEach((book) => {
  book.addEventListener("click", () => {
    console.log("clicked");
  });
});

document.getElementById("door-btn").addEventListener("click", () => {
  showScreen(screens.workshopOpen);
});

document.getElementById("workshop-open-left-arrow-btn").addEventListener("click", () => {
  showScreen(screens.workshop);
});

document.getElementById("door-btn").addEventListener("click", () => {
  showScreen(screens.codePuzzle);
});

document.getElementById("code-puzzle-back-btn").addEventListener("click", () => {
  showScreen(screens.workshop);
});

document.getElementById("door-btn").addEventListener("click", () => {
  showScreen(screens.codePuzzle);
});

document.getElementById("code-puzzle-back-btn").addEventListener("click", () => {
  showScreen(screens.workshop);
});

const correctCode = "1752";
let enteredCode = "";

const codeBoxes = document.querySelectorAll(".code-box");
const codeKeys = document.querySelectorAll(".code-key");

function updateCodeDisplay() {
  codeBoxes.forEach((box, index) => {
    box.textContent = enteredCode[index] || "";
  });
}

function resetCode() {
  enteredCode = "";
  updateCodeDisplay();
}

codeKeys.forEach((key) => {
  key.addEventListener("click", () => {
    const num = key.dataset.num;

    enteredCode += num;
    updateCodeDisplay();

    if (!correctCode.startsWith(enteredCode)) {
      setTimeout(resetCode, 300);
      return;
    }

    if (enteredCode === correctCode) {
      setTimeout(() => {
        showScreen(screens.workshopOpen);
      }, 300);
    }
  });
});
