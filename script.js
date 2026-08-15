/* ==========================================
   一筆畫關卡地圖資料（0: 空格, 1: 可走格子）
========================================== */
var levels = [
  // 第一關：鑰匙（Key Shape）
  {
    title: "LEVEL 1: THE KEY",
    rows: 5, cols: 5,
    grid: [
      [0, 1, 1, 1, 0],
      [0, 1, 0, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
      [0, 0, 1, 1, 0]
    ],
    start: { r: 0, c: 1 },
    end: { r: 4, c: 3 },
    hintPath: [
      {r:0,c:1}, {r:0,c:2}, {r:0,c:3}, {r:1,c:3},
      {r:2,c:3}, {r:2,c:2}, {r:2,c:1}, {r:1,c:1},
      {r:3,c:2}, {r:4,c:2}, {r:4,c:3}
    ]
  },
  // 第二關：手銬（Handcuffs Shape）
  {
    title: "LEVEL 2: HANDCUFFS",
    rows: 4, cols: 5,
    grid: [
      [1, 1, 0, 1, 1],
      [1, 1, 1, 1, 1],
      [1, 1, 0, 1, 1],
      [0, 0, 0, 0, 0]
    ],
    start: { r: 0, c: 0 },
    end: { r: 0, c: 4 },
    hintPath: [
      {r:0,c:0}, {r:1,c:0}, {r:2,c:0}, {r:2,c:1},
      {r:1,c:1}, {r:0,c:1}, {r:1,c:2}, {r:1,c:3},
      {r:0,c:3}, {r:0,c:4}, {r:1,c:4}, {r:2,c:4}, {r:2,c:3}
    ]
  },
  // 第三關：房子（House Shape）
  {
    title: "LEVEL 3: HOME AT LAST",
    rows: 5, cols: 5,
    grid: [
      [0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 0, 1, 1],
      [1, 1, 0, 1, 1]
    ],
    start: { r: 0, c: 2 },
    end: { r: 4, c: 3 },
    hintPath: [
      {r:0,c:2}, {r:1,c:1}, {r:2,c:0}, {r:3,c:0}, {r:4,c:0},
      {r:4,c:1}, {r:3,c:1}, {r:2,c:1}, {r:2,c:2}, {r:1,c:2},
      {r:1,c:3}, {r:2,c:3}, {r:2,c:4}, {r:3,c:3}, {r:4,c:3},
      {r:4,c:4}, {r:3,c:4}
    ]
  }
];

var currentLevelIdx = 0;
var currentPath = [];
var totalValidCells = 0;
var isDrawing = false;

/* ==========================================
   初始化與事件控制
========================================== */
window.addEventListener("DOMContentLoaded", function() {
  document.getElementById("startButton").addEventListener("click", function() {
    document.getElementById("startScreen").classList.add("hidden");
    document.getElementById("gameScreen").classList.remove("hidden");
    loadLevel(0);
  });

  document.getElementById("restartBtn").addEventListener("click", resetCurrentLevel);
  document.getElementById("hintBtn").addEventListener("click", showHint);
  document.getElementById("replayBtn").addEventListener("click", function() {
    document.getElementById("winScreen").classList.add("hidden");
    document.getElementById("startScreen").classList.remove("hidden");
    currentLevelIdx = 0;
  });

  // 全域放開觸控/滑鼠處理
  window.addEventListener("mouseup", handleInputEnd);
  window.addEventListener("touchend", handleInputEnd);
});

function loadLevel(idx) {
  currentLevelIdx = idx;
  var lvl = levels[currentLevelIdx];
  document.getElementById("levelTitle").textContent = lvl.title;
  document.getElementById("gameStatus").textContent = "Draw a single path to fill all blocks!";
  
  var board = document.getElementById("gridBoard");
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${lvl.cols}, 50px)`;
  
  totalValidCells = 0;
  currentPath = [];

  for (var r = 0; r < lvl.rows; r++) {
    for (var c = 0; c < lvl.cols; c++) {
      var cell = document.createElement("div");
      cell.className = "cell";
      cell.setAttribute("data-r", r);
      cell.setAttribute("data-c", c);

      if (lvl.grid[r][c] === 1) {
        totalValidCells++;
        if (r === lvl.start.r && c === lvl.start.c) {
          cell.classList.add("start-node");
          cell.textContent = "🏃🏻‍♂️";
        } else if (r === lvl.end.r && c === lvl.end.c) {
          cell.classList.add("target-node");
          cell.textContent = "🏁";
        }
        
        // 綁定輸入事件
        cell.addEventListener("mousedown", handleInputStart);
        cell.addEventListener("mouseenter", handleInputMove);
        cell.addEventListener("touchstart", handleTouchStart, {passive: false});
        cell.addEventListener("touchmove", handleTouchMove, {passive: false});
      } else {
        cell.classList.add("empty");
      }
      board.appendChild(cell);
    }
  }
}

function resetCurrentLevel() {
  loadLevel(currentLevelIdx);
}

/* ==========================================
   路徑劃線與碰撞邏輯
========================================== */
function handleInputStart(e) {
  var r = parseInt(e.currentTarget.getAttribute("data-r"));
  var c = parseInt(e.currentTarget.getAttribute("data-c"));
  var lvl = levels[currentLevelIdx];

  // 必須從起點開始
  if (r === lvl.start.r && c === lvl.start.c) {
    isDrawing = true;
    currentPath = [{r: r, c: c}];
    updatePathUI();
  }
}

function handleInputMove(e) {
  if (!isDrawing) return;
  var r = parseInt(e.currentTarget.getAttribute("data-r"));
  var c = parseInt(e.currentTarget.getAttribute("data-c"));
  tryMoveTo(r, c);
}

function handleTouchStart(e) {
  e.preventDefault();
  var touch = e.touches[0];
  var elem = document.elementFromPoint(touch.clientX, touch.clientY);
  if (elem && elem.classList.contains("cell")) {
    handleInputStart({ currentTarget: elem });
  }
}

function handleTouchMove(e) {
  if (!isDrawing) return;
  e.preventDefault();
  var touch = e.touches[0];
  var elem = document.elementFromPoint(touch.clientX, touch.clientY);
  if (elem && elem.classList.contains("cell") && !elem.classList.contains("empty")) {
    var r = parseInt(elem.getAttribute("data-r"));
    var c = parseInt(elem.getAttribute("data-c"));
    tryMoveTo(r, c);
  }
}

function tryMoveTo(r, c) {
  if (currentPath.length === 0) return;
  var last = currentPath[currentPath.length - 1];

  // 避免重複放入最新點
  if (last.r === r && last.c === c) return;

  // 退回上一步
  if (currentPath.length > 1) {
    var secondLast = currentPath[currentPath.length - 2];
    if (secondLast.r === r && secondLast.c === c) {
      currentPath.pop();
      updatePathUI();
      return;
    }
  }

  // 判斷是否相鄰（上下左右，不含斜向）
  var isAdjacent = (Math.abs(last.r - r) + Math.abs(last.c - c)) === 1;
  // 檢查是否已通過
  var isVisited = currentPath.some(node => node.r === r && node.c === c);

  if (isAdjacent && !isVisited) {
    currentPath.push({r: r, c: c});
    updatePathUI();

    // 檢查是否到達終點
    var lvl = levels[currentLevelIdx];
    if (r === lvl.end.r && c === lvl.end.c) {
      checkWinCondition();
    }
  }
}

function handleInputEnd() {
  isDrawing = false;
}

/* ==========================================
   UI 渲染與勝負判定
========================================== */
function updatePathUI() {
  var cells = document.querySelectorAll(".cell");
  var lvl = levels[currentLevelIdx];

  cells.forEach(cell => {
    cell.classList.remove("visited", "hint-path");
    var r = parseInt(cell.getAttribute("data-r"));
    var c = parseInt(cell.getAttribute("data-c"));

    if (cell.classList.contains("empty")) return;

    // 還原圖示
    if (r === lvl.start.r && c === lvl.start.c) {
      cell.textContent = "🏃🏻‍♂️";
    } else if (r === lvl.end.r && c === lvl.end.c) {
      cell.textContent = "🏁";
    } else {
      cell.textContent = "";
    }
  });

  currentPath.forEach((node, index) => {
    var cell = getCellElem(node.r, node.c);
    if (cell) {
      cell.classList.add("visited");
      // 移動小人在目前最新位置
      if (index === currentPath.length - 1) {
        cell.textContent = "🏃🏻‍♂️";
      }
    }
  });
}

function checkWinCondition() {
  var lvl = levels[currentLevelIdx];
  
  // 必須填充完【所有】有效格子才算通關
  if (currentPath.length === totalValidCells) {
    document.getElementById("gameStatus").textContent = "✨ LEVEL CLEARED!";
    setTimeout(function() {
      if (currentLevelIdx + 1 < levels.length) {
        loadLevel(currentLevelIdx + 1);
      } else {
        document.getElementById("gameScreen").classList.add("hidden");
        document.getElementById("winScreen").classList.remove("hidden");
      }
    }, 400);
  } else {
    // 沒填滿就提前到終點 -> 抖動 + 錯誤紅框 + 重置
    var board = document.getElementById("gridBoard");
    board.classList.add("error-shake");
    document.getElementById("gameStatus").textContent = "❌ Not all blocks filled! Try again.";
    
    setTimeout(function() {
      board.classList.remove("error-shake");
      resetCurrentLevel();
    }, 600);
  }
}

function showHint() {
  var lvl = levels[currentLevelIdx];
  if (!lvl.hintPath) return;

  resetCurrentLevel();
  lvl.hintPath.forEach(node => {
    var cell = getCellElem(node.r, node.c);
    if (cell && !cell.classList.contains("start-node") && !cell.classList.contains("target-node")) {
      cell.classList.add("hint-path");
    }
  });
  document.getElementById("gameStatus").textContent = "💡 Follow the dashed route!";
}

function getCellElem(r, c) {
  return document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
}
