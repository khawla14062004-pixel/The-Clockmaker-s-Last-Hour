document.addEventListener("DOMContentLoaded", () => {
  let socket = null;
    if (typeof io !== "undefined") {
        socket = io();
    }
    
    let musicVolume = Number(localStorage.getItem("musicVolume")) || 100;
    let sfxVolume = Number(localStorage.getItem("sfxVolume")) || 100;
    let uiVolume = Number(localStorage.getItem("uiVolume")) || 100;
    
    const finalMessagePopup = document.getElementById("final-message-popup");
    const finalMessageText = document.getElementById("final-message-text");
    const finalMessageCloseBtn = document.getElementById("final-message-close-btn");
    
    
    function showFinalMessage(message) {
      if (!finalMessagePopup || !finalMessageText) return;
      finalMessageText.textContent = message;
      finalMessagePopup.classList.remove("hidden");
    }

    function closeFinalMessage() {
      if (finalMessagePopup) {
        finalMessagePopup.classList.add("hidden");
      }
    }
    
    if (finalMessageCloseBtn) {
      finalMessageCloseBtn.addEventListener("click", closeFinalMessage);
    }

    if (finalMessagePopup) {
      finalMessagePopup.addEventListener("click", (e) => {
        if (e.target === finalMessagePopup) {
          closeFinalMessage();
        }
      });
    }
    
      // ==========================
      // AUDIO
      // ==========================
      const bgMusic = new Audio("assets/audio/background.mp3");
      const clickSound = new Audio("assets/audio/click.mp3");
      const puzzleSolvedSound = new Audio("assets/audio/doneWithPuzzle.mp3");
      const lockedSound = new Audio("assets/audio/Locked.mp3");
      const openChestSound = new Audio("assets/audio/OpenChest.mp3");

      bgMusic.loop = true;

      function applyAudioVolumes() {
        bgMusic.volume = musicVolume / 100;
        puzzleSolvedSound.volume = sfxVolume / 100;
        lockedSound.volume = sfxVolume / 100;
        openChestSound.volume = sfxVolume / 100;
        clickSound.volume = uiVolume / 100;
      }

      function playSound(sound) {
        if (!sound) return;
        sound.currentTime = 0;
        sound.play().catch(() => {});
      }

      function startBackgroundMusic() {
        applyAudioVolumes();
        bgMusic.play().catch(() => {});
      }
      
      function unlockAudio() {
        startBackgroundMusic();
        document.removeEventListener("click", unlockAudio);
        document.removeEventListener("touchstart", unlockAudio);
      }

      document.addEventListener("click", unlockAudio);
      document.addEventListener("touchstart", unlockAudio);
      
      document.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => {
          playSound(clickSound);
        });
      });

    

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
    booksPuzzle: document.getElementById("books-puzzle-screen"),
    codePuzzle: document.getElementById("code-puzzle-screen"),
    workshopOpen: document.getElementById("workshop-open-screen"),
    watchshop2: document.getElementById("watchshop2-screen"),
    drawerOpen: document.getElementById("drawer-open-screen"),
    watchshop2Close: document.getElementById("watchshop2-close-screen"),
    settings: document.getElementById("settings-screen"),
    gameSettings: document.getElementById("game-settings-screen"),
    audioSettings: document.getElementById("audio-settings-screen"),
    winner: document.getElementById("winner-screen"),
    loser: document.getElementById("loser-screen"),
    familyPhoto: document.getElementById("family-photo-screen"),
  };

  const hintBtn = document.getElementById("hint-btn");
  const hintPopup = document.getElementById("hint-popup");
  const closeHintBtn = document.getElementById("close-hint-btn");
  const hintImage = document.getElementById("hint-image");
  const timerDisplay = document.getElementById("timer-display");
  const resetPopup = document.getElementById("reset-popup");
  const resetConfirmBtn = document.getElementById("reset-confirm-btn");
  const resetCancelBtn = document.getElementById("reset-cancel-btn");
  const startHostedGameBtn = document.getElementById("start-hosted-game-btn");

  


  const screenHints = {
    "box-puzzle-screen": "assets/images/box-hint.png",
    "clock-puzzle-screen": "assets/images/clockwatch-hint.png",
    "chest-puzzle-screen": "assets/images/chest-hint.png",
    "portrait-puzzle-screen": "assets/images/portrait-hint.png",
    "books-closeup-screen": "assets/images/bookshelf-hint.png",
    "code-puzzle-screen": "assets/images/lock-hint.png",
    "watchshop2-close-screen": "assets/images/last-hint.png",
    "family-photo-screen": "assets/images/photo-hint.png"
  };

  const gameState = {
    selectedRole: null,
    cluesFound: 0,
    timer: 3600,
    drawerOpened: false
  };


  let previousScreen = screens.start;
  let currentRoomCode = null;
  let playerNumber = null;
  let gameStarted = false;
  let doorUnlocked = false;
  let chestUnlocked = false;
  let messageCollected = false;
  let selectedItem = null;
  let gameWon = false;
  let finalPuzzleChances = 3;

  
let timerOn = localStorage.getItem("timerOn") !== "false";
let timeLeft = Number(localStorage.getItem("timeLeft")) || 3600; // 1 hour
let timerInterval = null;

  const inventoryBar = document.getElementById("inventory-bar");
  if (inventoryBar) inventoryBar.classList.add("hidden");

  const inventory = [];

  const workshopScreen = document.getElementById("workshop-screen");
  const clockwatchScreen = document.getElementById("clockwatch-screen");

  const puzzleBoard = document.getElementById("puzzle-board");
  const puzzlePieces = Array.from(document.querySelectorAll(".puzzle-piece"));

  const books = Array.from(document.querySelectorAll(".book-piece"));

  const boxSymbolButtons = document.querySelectorAll(".box-symbol-btn");
  const symbolMessagePopup = document.getElementById("symbol-message-popup");
  const symbolMessageImage = document.getElementById("symbol-message-image");

  const clockFaceArea = document.getElementById("clock-face-area");
  const hourHand = document.getElementById("hour-hand");
  const minuteHand = document.getElementById("minute-hand");
  const clockKey = document.getElementById("clock-key");


  const codeBoxes = document.querySelectorAll(".code-box");
  const codeKeys = document.querySelectorAll(".code-key");

  const finalHourInput = document.getElementById("final-hour-input");
  const finalMinuteInput = document.getElementById("final-minute-input");
  const finalClockSubmitBtn = document.getElementById("final-clock-submit-btn");

  const clockCenter = { x: 0, y: 0 };

  const clockPuzzleState = {
    hourAngle: 0,
    minuteAngle: 0,
    dragging: null,
    solved: false
  };

  const TARGET_MINUTE_ANGLE = 17 * 6;
  const TARGET_HOUR_ANGLE = (10 % 12) * 30 + 17 * 0.5;

  const boxPuzzleCorrectSequence = ["star", "moon", "triangle", "gear", "ring"];
  let boxPuzzleCurrentIndex = 0;

  const correctCode = "1752";
  let enteredCode = "";

  const hostRoles = ["Analyst", "Mechanist"];
  let currentHostRoleIndex = 0;

  const roleCards = document.querySelectorAll(".role-card");
  const switchRoleBtn = document.getElementById("switch-role-btn");

  function addClickListener(id, handler) {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener("click", handler);
    }
  }

  function getActiveScreen() {
    return document.querySelector(".screen.active");
  }

function showScreen(screenToShow) {
  Object.values(screens).forEach((screen) => {
    if (!screen) return;
    screen.classList.add("hidden");
    screen.classList.remove("active");
  });

  if (!screenToShow) return;

  screenToShow.classList.remove("hidden");
  screenToShow.classList.add("active");

  const hideUI =
    screenToShow === screens.start ||
    screenToShow === screens.host ||
    screenToShow === screens.join ||
    screenToShow === screens.instructions ||
    screenToShow === screens.waiting ||
    screenToShow === screens.settings ||
    screenToShow === screens.gameSettings ||
    screenToShow === screens.audioSettings;

  if (inventoryBar) {
    if (hideUI) {
      inventoryBar.classList.add("hidden");
    } else {
      inventoryBar.classList.remove("hidden");
    }
  }

  if (timerDisplay) {
    if (hideUI || !timerOn) {
      timerDisplay.classList.add("hidden");
    } else {
      timerDisplay.classList.remove("hidden");
    }
  }

  updateHintButton();
}

addClickListener("audio-settings-btn", () => {
  showScreen(screens.audioSettings);
});

addClickListener("audio-settings-back-btn", () => {
  showScreen(screens.settings);
});

addClickListener("quit-game-btn", () => {
  if (socket && currentRoomCode) {
    socket.emit("quit_game", { code: currentRoomCode });
  }

  resetGame();
});

addClickListener("family-photo-item", () => {
  showScreen(screens.familyPhoto);
});

addClickListener("family-photo-back-btn", () => {
  showScreen(screens.watchshop);

  const watchshop = document.getElementById("watchshop-screen");
  const familyPhotoItem = document.getElementById("family-photo-item");

  if (gameState.drawerOpened) {
    if (watchshop) {
      watchshop.style.backgroundImage = 'url("assets/images/watchshop-open.png")';
    }
    if (familyPhotoItem) {
      familyPhotoItem.classList.remove("hidden");
    }
  }
});

if (startHostedGameBtn) {
  startHostedGameBtn.disabled = true;
  startHostedGameBtn.textContent = "Waiting for player 2...";
}


function updateHintButton() {
  const activeScreen = getActiveScreen();

  if (!hintBtn || !activeScreen) {
    if (hintBtn) hintBtn.classList.add("hidden");
    return;
  }

  // 🔴 NEW: if hints are OFF → always hide
  if (!hintsOn) {
    hintBtn.classList.add("hidden");
    if (hintPopup) hintPopup.classList.add("hidden");
    return;
  }

  const hintPath = screenHints[activeScreen.id];

  if (hintPath) {
    hintBtn.classList.remove("hidden");
  } else {
    hintBtn.classList.add("hidden");
    if (hintPopup) hintPopup.classList.add("hidden");
  }
}

  function openHintForCurrentScreen() {
    const activeScreen = getActiveScreen();
    if (!activeScreen || !hintPopup || !hintImage) return;

    const hintPath = screenHints[activeScreen.id];
    if (!hintPath) return;

    hintImage.src = hintPath;
    hintPopup.classList.remove("hidden");
  }

  function closeHint() {
    if (hintPopup) hintPopup.classList.add("hidden");
  }

  if (hintBtn) {
    hintBtn.addEventListener("click", openHintForCurrentScreen);
  }

  if (closeHintBtn) {
    closeHintBtn.addEventListener("click", closeHint);
  }

  if (hintPopup) {
    hintPopup.addEventListener("click", (e) => {
      if (e.target === hintPopup) {
        closeHint();
      }
    });
  }

  function openSettings() {
    const activeScreen = Object.values(screens).find(
      (screen) => screen && screen.classList.contains("active")
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
    updateWaitingText(message);
    showScreen(screens.waiting);
  }

  function showWorkshopIfStarted() {
    if (!gameStarted) return;
    showScreen(screens.workshop);
  }

  function updateHostRoleSelection() {
    roleCards.forEach((card, index) => {
      card.classList.remove("active-role");

      const label = card.querySelector("p");

      if (index === currentHostRoleIndex) {
        card.classList.add("active-role");
        if (label) label.textContent = "Player 1 (you)";
      } else {
        if (label) label.textContent = "Player 2";
      }
    });

    gameState.selectedRole = hostRoles[currentHostRoleIndex];
  }

  function updateWorkshopDoor() {
    if (!workshopScreen) return;

    if (doorUnlocked) {
      workshopScreen.style.backgroundImage = 'url("assets/images/workshop-main-open.png")';
    } else {
      workshopScreen.style.backgroundImage = 'url("assets/images/workshop-background.png")';
    }
  }

  function addToInventory(itemName, imagePath) {
    if (inventory.length >= 5) return;

    inventory.push({ name: itemName, img: imagePath });
    renderInventory();
  }

  function renderInventory() {
    for (let i = 0; i < 5; i++) {
      const slot = document.getElementById(`slot-${i + 1}`);
      if (!slot) continue;

      const item = inventory[i];

      if (item) {
        slot.innerHTML = `<img src="${item.img}" alt="${item.name}" />`;

        slot.onclick = () => {
          selectedItem = item.name;
          highlightSelectedSlot(i);

          if (item.name === "message" && symbolMessagePopup) {
            symbolMessagePopup.classList.remove("hidden");
          }
        };
      } else {
        slot.innerHTML = "";
        slot.onclick = null;
        slot.style.outline = "none";
      }
    }
  }

  function highlightSelectedSlot(selectedIndex) {
    document.querySelectorAll(".inventory-slot").forEach((slot, i) => {
      if (i === selectedIndex) {
        slot.style.outline = "3px solid gold";
      } else {
        slot.style.outline = "none";
      }
    });
  }

  function removeFromInventory(itemName) {
    const index = inventory.findIndex((item) => item.name === itemName);

    if (index !== -1) {
      inventory.splice(index, 1);
      selectedItem = null;
      renderInventory();
      highlightSelectedSlot(-1);
    }
  }

  function shufflePuzzle() {
    if (!puzzleBoard) return;

    const shuffled = [...puzzlePieces].sort(() => Math.random() - 0.5);
    puzzleBoard.innerHTML = "";
    shuffled.forEach((piece) => {
      piece.classList.remove("selected");
      puzzleBoard.appendChild(piece);
    });
  }

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
      playSound(puzzleSolvedSound);
    }
  }

  function shuffleBooks() {
    const container = document.getElementById("books-puzzle");
    if (!container) return;

    let items = Array.from(container.children);
    let solved = true;

    while (solved && items.length > 1) {
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }

      solved = items.every((book, index) => Number(book.dataset.order) === index + 1);
    }

    container.innerHTML = "";
    items.forEach((item) => container.appendChild(item));
  }

  function swapBooks(bookA, bookB) {
    const tempSrc = bookA.src;
    const tempOrder = bookA.dataset.order;

    bookA.src = bookB.src;
    bookA.dataset.order = bookB.dataset.order;

    bookB.src = tempSrc;
    bookB.dataset.order = tempOrder;
  }

  function checkBooksSolved() {
    const current = Array.from(document.querySelectorAll(".book-piece"));

    const solved = current.every((book, index) => {
      return Number(book.dataset.order) === index + 1;
    });

    if (solved) {
      playSound(puzzleSolvedSound);
      showScreen(screens.bookshelf);
    }
  }

  function resetBoxPuzzle() {
    boxPuzzleCurrentIndex = 0;
    boxSymbolButtons.forEach((button) => {
      button.classList.remove("correct", "wrong");
      button.disabled = false;
    });
  }

function completeBoxPuzzle() {
  boxSymbolButtons.forEach((button) => {
    button.disabled = true;
  });
    
    playSound(puzzleSolvedSound);

  if (symbolMessagePopup) {
    symbolMessagePopup.classList.remove("hidden");
  }
}

if (symbolMessagePopup) {
  symbolMessagePopup.classList.add("hidden");

  symbolMessagePopup.addEventListener("click", () => {
    symbolMessagePopup.classList.add("hidden");

    if (!messageCollected) {
      addToInventory("message", "assets/images/message.png");
      messageCollected = true;
    }
  });
}


  function normalizeAngle(angle) {
    return ((angle % 360) + 360) % 360;
  }

  function setHandRotation(hand, angle) {
    if (!hand) return;
    hand.style.transform = `translate(-50%, -84%) rotate(${angle}deg)`;
  }

  function getAngleFromPointer(event, element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    const clientY = event.touches ? event.touches[0].clientY : event.clientY;

    const dx = clientX - centerX;
    const dy = clientY - centerY;

    return normalizeAngle(Math.atan2(dy, dx) * (180 / Math.PI) + 90);
  }

  function angleDifferencePuzzle(a, b) {
    let diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
    return Math.min(diff, 360 - diff);
  }

  function checkClockSolved() {
    const minuteOk = angleDifferencePuzzle(clockPuzzleState.minuteAngle, TARGET_MINUTE_ANGLE) <= 4;
    const hourOk = angleDifferencePuzzle(clockPuzzleState.hourAngle, TARGET_HOUR_ANGLE) <= 6;

    if (minuteOk && hourOk && !clockPuzzleState.solved) {
      clockPuzzleState.solved = true;
      playSound(puzzleSolvedSound);
        
      if (hourHand) hourHand.style.pointerEvents = "none";
      if (minuteHand) minuteHand.style.pointerEvents = "none";

      if (clockKey) {
        clockKey.classList.remove("hidden");
      }
    }
  }

  function updateClockHandsFromDrag(event) {
    const activeScreen = document.querySelector(".screen.active");
    if (!activeScreen || activeScreen.id !== "clock-puzzle-screen") return;
    if (!clockPuzzleState.dragging || !clockFaceArea || clockPuzzleState.solved) return;

    const angle = getAngleFromPointer(event, clockFaceArea);

    if (clockPuzzleState.dragging === "minute") {
      clockPuzzleState.minuteAngle = angle;
      setHandRotation(minuteHand, clockPuzzleState.minuteAngle);
    }

    if (clockPuzzleState.dragging === "hour") {
      clockPuzzleState.hourAngle = angle;
      setHandRotation(hourHand, clockPuzzleState.hourAngle);
    }

    checkClockSolved();
  }

  function stopClockDrag() {
    clockPuzzleState.dragging = null;
  }

  function updateCodeDisplay() {
    codeBoxes.forEach((box, index) => {
      box.textContent = enteredCode[index] || "";
    });
  }

  function resetCode() {
    enteredCode = "";
    updateCodeDisplay();
  }

if (socket) {
  socket.on("match_created", (data) => {
    currentRoomCode = data.code;
    playerNumber = data.role;
    gameStarted = false;

    const inviteCodeEl = document.getElementById("invite-code");
    if (inviteCodeEl) {
      inviteCodeEl.textContent = currentRoomCode;
    }

    const startBtn = document.getElementById("start-hosted-game-btn");
    if (startBtn) {
      startBtn.disabled = true;
      startBtn.textContent = "Waiting for player 2...";
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
    if (playerNumber === "player1") {
      const startBtn = document.getElementById("start-hosted-game-btn");
      if (startBtn) {
        startBtn.disabled = false;
        startBtn.textContent = "Start game";
      }
    } else {
      showWaitingScreen("waiting for host to start...");
    }
  });

  socket.on("game_started", () => {
    gameStarted = true;
    resetAllSettings();
    resetTimer();
    showScreen(screens.workshop);
  });

  socket.on("join_error", (data) => {
    alert(data.message || "Could not join room.");
  });

  socket.on("player_disconnected", () => {
    gameStarted = false;
    showWaitingScreen("The other player disconnected. Waiting for player to rejoin...");
  });

socket.on("game_quit", () => {
  resetGame();
});

socket.on("show_loser_screen", () => {
  gameWon = false;
  showScreen(screens.loser);
});

}

  if (switchRoleBtn) {
    switchRoleBtn.addEventListener("click", () => {
      currentHostRoleIndex = currentHostRoleIndex === 0 ? 1 : 0;
      updateHostRoleSelection();
    });
  }

  updateHostRoleSelection();


addClickListener("start-hosted-game-btn", () => {
  if (!currentRoomCode) {
    alert("No room code found.");
    return;
  }

  if (socket) {
    socket.emit("start_match", { code: currentRoomCode });
  } else {
    gameStarted = true;
    resetAllSettings();
    resetTimer();
    showScreen(screens.workshop);
  }
});

addClickListener("start-btn", () => {
  resetGame();
  showScreen(screens.host);

  if (socket) {
    socket.emit("create_match");
  }
});

addClickListener("back-from-host-btn", () => {
  showScreen(screens.start);
});
  
  addClickListener("instructions-btn", () => {
    showScreen(screens.instructions);
  });

addClickListener("back-btn", () => {
  showScreen(screens.start);
});

  addClickListener("to-role-btn", () => {
    showScreen(screens.host);
  });

addClickListener("join-btn", () => {
  const joinCodeInput = document.getElementById("join-code-input");
  if (joinCodeInput) {
    joinCodeInput.value = "";
  }

  showScreen(screens.join);
});

  addClickListener("back-from-join-btn", () => {
    showScreen(screens.start);
  });

  addClickListener("join-room-confirm-btn", () => {
    const codeInput = document.getElementById("join-code-input");
    const entered = codeInput ? codeInput.value.trim().toUpperCase() : "";

    if (entered.length !== 6) {
      alert("Please enter a 6-character room code.");
      return;
    }

    if (socket) {
      socket.emit("join_match", { code: entered });
    } else {
      showScreen(screens.workshop);
    }
  });


  const joinCodeInput = document.getElementById("join-code-input");
  if (joinCodeInput) {
    joinCodeInput.addEventListener("input", (event) => {
      event.target.value = event.target.value.toUpperCase();
    });
  }

  addClickListener("portrait-btn", () => {
    showScreen(screens.portraitPuzzle);
  });

  addClickListener("back-to-workshop-btn", () => {
    showWorkshopIfStarted();
  });

  addClickListener("right-arrow-btn", () => {
    showScreen(screens.bookshelf);
  });

  addClickListener("bookshelf-left-arrow-btn", () => {
    showScreen(screens.workshop);
  });

  addClickListener("bookshelf-right-arrow-btn", () => {
    showScreen(screens.clockwatch);
  });

  addClickListener("books-btn", () => {
    showScreen(screens.booksCloseup);
    shuffleBooks();
  });

  addClickListener("books-closeup-back-btn", () => {
    showScreen(screens.bookshelf);
  });

  addClickListener("clockwatch-left-arrow-btn", () => {
    showScreen(screens.bookshelf);
  });

  addClickListener("watchshop2-left-arrow-btn", () => {
    showScreen(screens.watchshop);
  });

  addClickListener("box-btn", () => {
    showScreen(screens.boxPuzzle);
  });

  addClickListener("box-puzzle-back-btn", () => {
    showScreen(screens.clockwatch);
  });

  addClickListener("clock-btn", () => {
    showScreen(screens.clockPuzzle);
  });

  addClickListener("clock-puzzle-back-btn", () => {
    showScreen(screens.clockwatch);
  });

  addClickListener("settings-back-btn", () => {
    showScreen(previousScreen);
  });

  addClickListener("game-settings-btn", () => {
  showScreen(screens.gameSettings);
});

addClickListener("game-settings-back-btn", () => {
  showScreen(screens.settings);
});

  document.querySelectorAll(".settings-open-btn").forEach((button) => {
    button.addEventListener("click", openSettings);
  });

    const chestBtn = document.getElementById("chest-btn");
    if (chestBtn) {
      chestBtn.addEventListener("click", () => {
        if (chestUnlocked) {
          showScreen(screens.chestPuzzle);
          return;
        }

        if (selectedItem === "key") {
          chestUnlocked = true;
          removeFromInventory("key");
          selectedItem = null;
          highlightSelectedSlot(-1);

          if (clockwatchScreen) {
            clockwatchScreen.classList.add("chest-open");
          }

          playSound(openChestSound);
          showScreen(screens.chestPuzzle);
        } else {
          playSound(lockedSound);
        }
      });
    }

  addClickListener("chest-puzzle-back-btn", () => {
    showScreen(screens.clockwatch);
  });

  addClickListener("watchshop-right-arrow-btn", () => {
    showScreen(screens.watchshop2);
  });

  puzzlePieces.forEach((piece) => {
    piece.addEventListener("click", () => {
      if (!selectedItem && !piece) return;

      if (!window._selectedPiece) {
        window._selectedPiece = piece;
        piece.classList.add("selected");
        return;
      }

      if (window._selectedPiece === piece) {
        piece.classList.remove("selected");
        window._selectedPiece = null;
        return;
      }

      swapPieces(window._selectedPiece, piece);
      window._selectedPiece.classList.remove("selected");
      window._selectedPiece = null;
      checkPuzzleSolved();
    });
  });

  books.forEach((book) => {
    book.addEventListener("click", () => {
      if (!window._selectedBook) {
        window._selectedBook = book;
        book.classList.add("selected");
        return;
      }

      if (window._selectedBook === book) {
        book.classList.remove("selected");
        window._selectedBook = null;
        return;
      }

      swapBooks(window._selectedBook, book);
      window._selectedBook.classList.remove("selected");
      window._selectedBook = null;
      checkBooksSolved();
    });
  });

  addClickListener("books-puzzle-back-btn", () => {
    showScreen(screens.bookshelf);
  });

  addClickListener("portrait-puzzle-back-btn", () => {
    showScreen(screens.workshop);
  });

  addClickListener("portrait-result-back-btn", () => {
    showScreen(screens.workshop);
  });

  boxSymbolButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const expectedSymbol = boxPuzzleCorrectSequence[boxPuzzleCurrentIndex];
      const pressedSymbol = button.dataset.symbol;

      if (pressedSymbol === expectedSymbol) {
        button.classList.remove("wrong");
        button.classList.add("correct");
        button.disabled = true;
        boxPuzzleCurrentIndex += 1;

        if (boxPuzzleCurrentIndex === boxPuzzleCorrectSequence.length) {
          completeBoxPuzzle();
        }
      } else {
        button.classList.remove("correct");
        button.classList.add("wrong");

        setTimeout(() => {
          resetBoxPuzzle();
        }, 700);
      }
    });
  });

  if (clockFaceArea && hourHand && minuteHand) {
    setHandRotation(hourHand, clockPuzzleState.hourAngle);
    setHandRotation(minuteHand, clockPuzzleState.minuteAngle);

    hourHand.addEventListener("mousedown", () => {
      if (!clockPuzzleState.solved) clockPuzzleState.dragging = "hour";
    });

    minuteHand.addEventListener("mousedown", () => {
      if (!clockPuzzleState.solved) clockPuzzleState.dragging = "minute";
    });

    hourHand.addEventListener(
      "touchstart",
      () => {
        if (!clockPuzzleState.solved) clockPuzzleState.dragging = "hour";
      },
      { passive: true }
    );


    minuteHand.addEventListener(
      "touchstart",
      () => {
        if (!clockPuzzleState.solved) clockPuzzleState.dragging = "minute";
      },
      { passive: true }
    );

    document.addEventListener("mousemove", updateClockHandsFromDrag);
    document.addEventListener("mouseup", stopClockDrag);
    document.addEventListener("touchmove", updateClockHandsFromDrag, { passive: true });
    document.addEventListener("touchend", stopClockDrag);
  }

  if (clockKey) {
    clockKey.addEventListener("click", () => {
      clockKey.classList.add("hidden");
      addToInventory("key", "assets/images/key.png");
    });
  }

  addClickListener("door-btn", () => {
    if (doorUnlocked) {
      showScreen(screens.workshopOpen);
    } else {
      resetCode();
      showScreen(screens.codePuzzle);
    }
  });

  

  addClickListener("code-puzzle-back-btn", () => {
    updateWorkshopDoor();
    showScreen(screens.workshop);
  });

  codeKeys.forEach((key) => {
    key.addEventListener("click", () => {
      const num = key.dataset.num;
      if (!num) return;
      if (enteredCode.length >= 4) return;

      enteredCode += num;
      updateCodeDisplay();

      if (!correctCode.startsWith(enteredCode)) {
        setTimeout(resetCode, 300);
        return;
      }

      if (enteredCode === correctCode) {
        doorUnlocked = true;

        setTimeout(() => {
          updateWorkshopDoor();
          showScreen(screens.workshopOpen);
        }, 300);
      }
    });
  });

  addClickListener("workshop-open-right-arrow-btn", () => {
    showScreen(screens.bookshelf);
  });

  addClickListener("open-door-btn", () => {
    showScreen(screens.watchshop);
  });

addClickListener("drawer-btn", () => {
  const watchshop = document.getElementById("watchshop-screen");
  const familyPhotoItem = document.getElementById("family-photo-item");
  const drawerBtn = document.getElementById("drawer-btn");

  gameState.drawerOpened = true;

  if (watchshop) {
    watchshop.style.backgroundImage = 'url("assets/images/watchshop-open.png")';
  }

  if (familyPhotoItem) {
    familyPhotoItem.classList.remove("hidden");
  }

  // 🔥 THIS LINE FIXES YOUR ISSUE
  if (drawerBtn) {
    drawerBtn.style.pointerEvents = "none";
  }
});

addClickListener("center-clock-btn", () => {
  finalPuzzleChances = 3;
  if (finalHourInput) finalHourInput.value = "";
  if (finalMinuteInput) finalMinuteInput.value = "";
  showScreen(screens.watchshop2Close);
});

  addClickListener("watchshop2-close-back-btn", () => {
    showScreen(screens.watchshop2);
  });

  addClickListener("book-btn", () => {
    showScreen(screens.book);
  });

  addClickListener("back-from-book-btn", () => {
    showScreen(screens.workshop);
  });


const confirmKnobBtn = document.getElementById("confirm-knob-btn");

if (confirmKnobBtn) {
  confirmKnobBtn.addEventListener("click", checkFinalDigitalClock);
}

[finalHourInput, finalMinuteInput].forEach((input) => {
  if (!input) return;
  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "");
  });
});



// ==========================
// SETTINGS LOGIC
// ==========================
let hintsOn = localStorage.getItem("hintsOn") !== "false";

const timerBtn = document.getElementById("timer-btn");
const hintsBtn = document.getElementById("hints-btn");
const resetBtn = document.getElementById("reset-btn");

if (timerBtn) {
  timerBtn.textContent = "Timer: " + (timerOn ? "ON" : "OFF");

  timerBtn.onclick = () => {
    timerOn = !timerOn;
    localStorage.setItem("timerOn", timerOn);

    timerBtn.textContent = "Timer: " + (timerOn ? "ON" : "OFF");

    const activeScreen = getActiveScreen();
    const isMenuScreen =
      activeScreen === screens.start ||
      activeScreen === screens.host ||
      activeScreen === screens.join ||
      activeScreen === screens.instructions ||
      activeScreen === screens.waiting ||
      activeScreen === screens.settings ||
      activeScreen === screens.gameSettings ||
      activeScreen === screens.audioSettings;

    if (timerOn) {
      startTimer();
      if (timerDisplay && !isMenuScreen) {
        timerDisplay.classList.remove("hidden");
      }
    } else {
      stopTimer();
      if (timerDisplay) {
        timerDisplay.classList.add("hidden");
      }
    }
  };
}

if (hintsBtn) {
  hintsBtn.textContent = "Hints: " + (hintsOn ? "ON" : "OFF");

  hintsBtn.onclick = () => {
    hintsOn = !hintsOn;
    localStorage.setItem("hintsOn", hintsOn);
    hintsBtn.textContent = "Hints: " + (hintsOn ? "ON" : "OFF");
    updateHintButton();
  };
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return String(mins).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
}

function updateTimerDisplay() {
  if (!timerDisplay) return;
  timerDisplay.textContent = formatTime(timeLeft);
}

function startTimer() {
  if (!timerOn) return;
  if (timerInterval) return;

  timerInterval = setInterval(() => {
    if (!timerOn) return;

    if (timeLeft > 0) {
      timeLeft--;
      localStorage.setItem("timeLeft", timeLeft);
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
      alert("Time is up!");
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetTimer() {
  timeLeft = 3600;
  stopTimer();
  updateTimerDisplay();

  if (timerOn) {
    startTimer();
  }
}

if (resetBtn && resetPopup) {
  resetBtn.onclick = () => {
    resetPopup.classList.remove("hidden");
  };
}

if (resetCancelBtn && resetPopup) {
  resetCancelBtn.onclick = () => {
    resetPopup.classList.add("hidden");
  };
}

if (resetConfirmBtn && resetPopup) {
  resetConfirmBtn.onclick = () => {
    resetPopup.classList.add("hidden");

    localStorage.clear();

    timeLeft = 3600;
    stopTimer();
    updateTimerDisplay();

    if (timerOn) {
      startTimer();
    }

    doorUnlocked = false;
    chestUnlocked = false;
    messageCollected = false;
    selectedItem = null;
    gameWon = false;
    enteredCode = "";
    boxPuzzleCurrentIndex = 0;
    finalPuzzleChances = 3;

    inventory.length = 0;
    renderInventory();
    highlightSelectedSlot(-1);

    updateWorkshopDoor();
    resetBoxPuzzle();
    shufflePuzzle();
    shuffleBooks();

    if (clockKey) clockKey.classList.add("hidden");
    if (symbolMessagePopup) symbolMessagePopup.classList.add("hidden");
    if (hintPopup) hintPopup.classList.add("hidden");

    gameStarted = true;
    showScreen(screens.workshop);
  };
}

shufflePuzzle();
resetBoxPuzzle();
updateWorkshopDoor();
updateHintButton();
updateTimerDisplay();

if (timerOn) {
  startTimer();
}

const musicSlider = document.getElementById("music-slider");
const sfxSlider = document.getElementById("sfx-slider");
const uiSlider = document.getElementById("ui-slider");

const musicValue = document.getElementById("music-value");
const sfxValue = document.getElementById("sfx-value");
const uiValue = document.getElementById("ui-value");


    if (musicSlider && musicValue) {
      musicSlider.value = musicVolume;
      musicValue.textContent = musicVolume;

      musicSlider.addEventListener("input", () => {
        musicVolume = Number(musicSlider.value);
        musicValue.textContent = musicVolume;
        localStorage.setItem("musicVolume", musicVolume);
        applyAudioVolumes();
      });
    }
    

addClickListener("winner-back-btn", () => {
  showScreen(screens.start);
});

addClickListener("loser-back-btn", () => {
  showScreen(screens.start);
});

    if (sfxSlider && sfxValue) {
      sfxSlider.value = sfxVolume;
      sfxValue.textContent = sfxVolume;

      sfxSlider.addEventListener("input", () => {
        sfxVolume = Number(sfxSlider.value);
        sfxValue.textContent = sfxVolume;
        localStorage.setItem("sfxVolume", sfxVolume);
        applyAudioVolumes();
      });
    }

    if (uiSlider && uiValue) {
      uiSlider.value = uiVolume;
      uiValue.textContent = uiVolume;

      uiSlider.addEventListener("input", () => {
        uiVolume = Number(uiSlider.value);
        uiValue.textContent = uiVolume;
        localStorage.setItem("uiVolume", uiVolume);
        applyAudioVolumes();
      });
    }
    
    applyAudioVolumes();

    function resetAllSettings() {
      timerOn = true;
      hintsOn = true;
      timeLeft = 3600;

      musicVolume = 100;
      sfxVolume = 100;
      uiVolume = 100;

      localStorage.setItem("timerOn", "true");
      localStorage.setItem("hintsOn", "true");
      localStorage.setItem("timeLeft", "3600");
      localStorage.setItem("musicVolume", "100");
      localStorage.setItem("sfxVolume", "100");
      localStorage.setItem("uiVolume", "100");

      updateTimerDisplay();
      updateHintButton();

      if (timerBtn) timerBtn.textContent = "Timer: ON";
      if (hintsBtn) hintsBtn.textContent = "Hints: ON";

      if (musicSlider && musicValue) {
        musicSlider.value = 100;
        musicValue.textContent = "100";
      }

      if (sfxSlider && sfxValue) {
        sfxSlider.value = 100;
        sfxValue.textContent = "100";
      }

      if (uiSlider && uiValue) {
        uiSlider.value = 100;
        uiValue.textContent = "100";
      }

      applyAudioVolumes();
    }

function clearRoomState() {
  currentRoomCode = null;
  playerNumber = null;
  gameStarted = false;

  const inviteCodeEl = document.getElementById("invite-code");
  if (inviteCodeEl) {
    inviteCodeEl.textContent = "------";
  }

  const joinCodeInput = document.getElementById("join-code-input");
  if (joinCodeInput) {
    joinCodeInput.value = "";
  }
}


const chestPuzzleBoard = document.getElementById("chest-puzzle-board");
const chestPuzzleScreen = document.getElementById("chest-puzzle-screen");
const chestBackBtn = document.getElementById("chest-puzzle-back-btn");

const chestGearData = {
  gear1: { targetX: 26.5, targetY: 28.5, startX: 14, startY: 84, spin: "cw" },
  gear2: { targetX: 40.5, targetY: 30.5, startX: 24, startY: 84, spin: "ccw" },
  gear3: { targetX: 31.5, targetY: 50.5, startX: 34, startY: 84, spin: "cw" },
  gear4: { targetX: 48, targetY: 50.5, startX: 44, startY: 84, spin: "ccw" },
  gear5: { targetX: 40.5, targetY: 64.5, startX: 54, startY: 84, spin: "cw" },
  gear6: { targetX: 57.5, targetY: 64.5, startX: 64, startY: 84, spin: "ccw" }
};

const chestGears = [...document.querySelectorAll("#chest-puzzle-board .gear-piece")];

let activeChestGear = null;
let chestOffsetX = 0;
let chestOffsetY = 0;
let chestSolvedCount = 0;
let chestPuzzleSolved = false;

function initChestPuzzle() {
  if (!chestPuzzleBoard) return;

  chestSolvedCount = 0;
  chestPuzzleSolved = false;

  chestGears.forEach((gear) => {
    const id = gear.id;
    const data = chestGearData[id];
    if (!data) return;

    gear.dataset.correctX = data.targetX;
    gear.dataset.correctY = data.targetY;
    gear.dataset.spin = data.spin;
    gear.dataset.placed = "false";

    gear.style.left = `${data.startX}%`;
    gear.style.top = `${data.startY}%`;
    gear.style.position = "absolute";
    gear.style.transform = "translate(-50%, -50%)";
    gear.style.cursor = "grab";
    gear.style.touchAction = "none";

    gear.classList.remove("placed", "spin-clockwise", "spin-counter", "dragging");
    gear.removeEventListener("pointerdown", onChestGearPointerDown);
    gear.addEventListener("pointerdown", onChestGearPointerDown);
  });
}

function onChestGearPointerDown(e) {
  const gear = e.currentTarget;
  if (gear.dataset.placed === "true") return;

  activeChestGear = gear;
  activeChestGear.classList.add("dragging");

  const gearRect = activeChestGear.getBoundingClientRect();
  chestOffsetX = e.clientX - gearRect.left;
  chestOffsetY = e.clientY - gearRect.top;

  activeChestGear.setPointerCapture(e.pointerId);
  activeChestGear.addEventListener("pointermove", onChestGearPointerMove);
  activeChestGear.addEventListener("pointerup", onChestGearPointerUp);
  activeChestGear.addEventListener("pointercancel", onChestGearPointerUp);
}

function onChestGearPointerMove(e) {
  if (!activeChestGear || !chestPuzzleBoard) return;

  const boardRect = chestPuzzleBoard.getBoundingClientRect();

  const x = e.clientX - boardRect.left - chestOffsetX + activeChestGear.offsetWidth / 2;
  const y = e.clientY - boardRect.top - chestOffsetY + activeChestGear.offsetHeight / 2;

  const xPercent = (x / boardRect.width) * 100;
  const yPercent = (y / boardRect.height) * 100;

  activeChestGear.style.left = `${xPercent}%`;
  activeChestGear.style.top = `${yPercent}%`;
}

function onChestGearPointerUp() {
  if (!activeChestGear || !chestPuzzleBoard) return;

  activeChestGear.classList.remove("dragging");

  const currentGear = activeChestGear;
  currentGear.removeEventListener("pointermove", onChestGearPointerMove);
  currentGear.removeEventListener("pointerup", onChestGearPointerUp);
  currentGear.removeEventListener("pointercancel", onChestGearPointerUp);

  const currentX = parseFloat(currentGear.style.left);
  const currentY = parseFloat(currentGear.style.top);
  const targetX = parseFloat(currentGear.dataset.correctX);
  const targetY = parseFloat(currentGear.dataset.correctY);

  const dx = currentX - targetX;
  const dy = currentY - targetY;
  const distance = Math.hypot(dx, dy);

  if (distance < 6) {
    placeChestGear(currentGear);
  }

  activeChestGear = null;
}

function placeChestGear(gear) {
  if (gear.dataset.placed === "true") return;

  gear.style.left = `${gear.dataset.correctX}%`;
  gear.style.top = `${gear.dataset.correctY}%`;
  gear.dataset.placed = "true";
  gear.classList.add("placed");

  if (gear.dataset.spin === "cw") {
    gear.classList.add("spin-clockwise");
  } else {
    gear.classList.add("spin-counter");
  }

  chestSolvedCount++;

  if (chestSolvedCount === chestGears.length) {
    onChestPuzzleSolved();
  }
}

function onChestPuzzleSolved() {
  if (chestPuzzleSolved) return;
  chestPuzzleSolved = true;
    
  playSound(puzzleSolvedSound);

  console.log("Chest puzzle solved");

  // if you have puzzle state tracking, use it here:
  // puzzleState.chest = true;

  // if you want to trigger something after solving, add it here
}

if (chestBackBtn) {
  chestBackBtn.addEventListener("click", () => {
    showScreen(screens.clockwatch);
  });
}


function announceFinalResult(isCorrect) {
  if (isCorrect) {
    playSound(puzzleSolvedSound);
    gameWon = true;
    showScreen(screens.winner);

    if (socket && currentRoomCode) {
      socket.emit("game_finished", {
        code: currentRoomCode,
        result: "win"
      });
    }
  } else {
    gameWon = false;
    showScreen(screens.loser);
  }
}

function checkFinalDigitalClock() {
  if (!finalHourInput || !finalMinuteInput) return;

  const hour = finalHourInput.value.trim();
  const minute = finalMinuteInput.value.trim().padStart(2, "0");

  const isCorrect = hour === "9" && minute === "52";

  if (isCorrect) {
    announceFinalResult(true);
    return;
  }

  finalPuzzleChances--;

  if (finalPuzzleChances <= 0) {
    announceFinalResult(false);
  } else {
    showFinalMessage(`Incorrect time. ${finalPuzzleChances} attempt${finalPuzzleChances === 1 ? "" : "s"} remaining.`);
    finalHourInput.value = "";
    finalMinuteInput.value = "";
  }
}

function resetGame() {
  stopTimer();
  localStorage.clear();

  gameState.selectedRole = null;
  gameState.cluesFound = 0;
  gameState.timer = 3600;
  gameState.drawerOpened = false;

  finalPuzzleChances = 3;
  doorUnlocked = false;
  chestUnlocked = false;
  messageCollected = false;
  selectedItem = null;
  gameWon = false;
  enteredCode = "";
  boxPuzzleCurrentIndex = 0;

  timerOn = true;
  hintsOn = true;
  timeLeft = 3600;

  inventory.length = 0;
  renderInventory();
  highlightSelectedSlot(-1);

  clearRoomState();
  updateWorkshopDoor();
  resetBoxPuzzle();
  shufflePuzzle();
  shuffleBooks();

  clockPuzzleState.hourAngle = 0;
  clockPuzzleState.minuteAngle = 0;
  clockPuzzleState.dragging = null;
  clockPuzzleState.solved = false;

  setHandRotation(hourHand, clockPuzzleState.hourAngle);
  setHandRotation(minuteHand, clockPuzzleState.minuteAngle);

  if (clockKey) {
    clockKey.classList.add("hidden");
    clockKey.style.pointerEvents = "auto";
  }

  if (symbolMessagePopup) symbolMessagePopup.classList.add("hidden");
  if (hintPopup) hintPopup.classList.add("hidden");
  if (resetPopup) resetPopup.classList.add("hidden");
  if (finalMessagePopup) finalMessagePopup.classList.add("hidden");

  resetCode();
  initChestPuzzle();

  const watchshop = document.getElementById("watchshop-screen");
  const familyPhotoItem = document.getElementById("family-photo-item");
  const drawerBtn = document.getElementById("drawer-btn");

  if (watchshop) {
    watchshop.style.backgroundImage = 'url("assets/images/watchshop-screen.png")';
  }

  if (familyPhotoItem) {
    familyPhotoItem.classList.add("hidden");
  }

  if (drawerBtn) {
    drawerBtn.style.pointerEvents = "auto";
  }

  if (finalHourInput) finalHourInput.value = "";
  if (finalMinuteInput) finalMinuteInput.value = "";

  updateHintButton();
  updateTimerDisplay();
  startTimer();

  showScreen(screens.start);
}



initChestPuzzle();

});
