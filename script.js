// 關卡設定資料
// 0: 普通格子, 1: 起點(Start), 2: 終點(End)
const levels = [
    {
        name: "LEVEL 1: 解開手銬",
        endSymbol: "⛓️",
        rows: 3, cols: 3,
        start: {r: 0, c: 0},
        end: {r: 2, c: 2},
        solution: [[0,0],[0,1],[0,2],[1,2],[1,1],[1,0],[2,0],[2,1],[2,2]]
    },
    {
        name: "LEVEL 2: 取得鑰匙",
        endSymbol: "🔑",
        rows: 3, cols: 4,
        start: {r: 0, c: 0},
        end: {r: 2, c: 3},
        solution: [[0,0],[1,0],[2,0],[2,1],[1,1],[0,1],[0,2],[1,2],[2,2],[2,3],[1,3],[0,3]]
    },
    {
        name: "LEVEL 3: 逃回家中",
        endSymbol: "🏡",
        rows: 4, cols: 4,
        start: {r: 0, c: 0},
        end: {r: 3, c: 3},
        solution: [
            [0,0],[0,1],[0,2],[0,3],
            [1,3],[1,2],[1,1],[1,0],
            [2,0],[2,1],[2,2],[2,3],
            [3,3],[3,2],[3,1],[3,0]
        ]
    }
];

let currentLevel = 0;
let gridData = [];
let path = [];
let isDrawing = false;
let totalCells = 0;

function startGame() {
    document.getElementById('cover-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    loadLevel(currentLevel);
}

function loadLevel(lvlIndex) {
    currentLevel = lvlIndex;
    const lvl = levels[currentLevel];
    document.getElementById('level-title').innerText = lvl.name;
    
    const gridEl = document.getElementById('grid');
    gridEl.style.gridTemplateColumns = `repeat(${lvl.cols}, 50px)`;
    gridEl.innerHTML = '';
    
    gridData = [];
    path = [];
    totalCells = lvl.rows * lvl.cols;

    for (let r = 0; r < lvl.rows; r++) {
        let rowArr = [];
        for (let c = 0; c < lvl.cols; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.r = r;
            cell.dataset.c = c;

            // 標記起點與終點
            if (r === lvl.start.r && c === lvl.start.c) {
                cell.classList.add('start');
                cell.innerHTML = '🧑‍🦲'; // Monsieur 像素風起點
            } else if (r === lvl.end.r && c === lvl.end.c) {
                cell.classList.add('end');
                cell.innerHTML = lvl.endSymbol; // 關卡目標
            }

            // 滑鼠與觸控事件
            cell.addEventListener('pointerdown', (e) => startDrag(r, c, e));
            cell.addEventListener('pointerenter', (e) => enterCell(r, c, e));

            gridEl.appendChild(cell);
            rowArr.push({r, c, visited: false});
        }
        gridData.push(rowArr);
    }
    
    window.removeEventListener('pointerup', endDrag);
    window.addEventListener('pointerup', endDrag);
}

function startDrag(r, c, e) {
    const lvl = levels[currentLevel];
    // 必須從起點開始
    if (r === lvl.start.r && c === lvl.start.c) {
        isDrawing = true;
        resetPath();
        addCellToPath(r, c);
    }
}

function enterCell(r, c) {
    if (!isDrawing) return;
    const lvl = levels[currentLevel];
    const lastCell = path[path.length - 1];

    // 檢查是否為相鄰格子 (上下左右)
    const isAdjacent = Math.abs(lastCell.r - r) + Math.abs(lastCell.c - c) === 1;
    
    if (isAdjacent) {
        // 如果回到上一個格子（倒退嚕），可以取消最後一步
        if (path.length > 1 && path[path.length - 2].r === r && path[path.length - 2].c === c) {
            removeLastCell();
            return;
        }

        // 如果已經走過，不能重複走
        const alreadyVisited = path.some(p => p.r === r && p.c === c);
        if (alreadyVisited) return;

        addCellToPath(r, c);
    }
}

function addCellToPath(r, c) {
    path.push({r, c});
    const cellEl = getCellElement(r, c);
    const lvl = levels[currentLevel];

    if (!(r === lvl.start.r && c === lvl.start.c)) {
        cellEl.classList.add('visited');
    }

    // 檢查是否到達終點
    if (r === lvl.end.r && c === lvl.end.c) {
        isDrawing = false;
        // 檢查是否走完所有格子
        if (path.length === totalCells) {
            setTimeout(showWinScreen, 200);
        } else {
            triggerFailEffect();
        }
    }
}

function removeLastCell() {
    const removed = path.pop();
    const lvl = levels[currentLevel];
    // 如果不是起點，移除 visited 樣式
    if (!(removed.r === lvl.start.r && removed.c === lvl.start.c)) {
        const cellEl = getCellElement(removed.r, removed.c);
        cellEl.classList.remove('visited');
    }
}

function endDrag() {
    if (!isDrawing) return;
    isDrawing = false;
    
    const lvl = levels[currentLevel];
    const lastCell = path[path.length - 1];
    
    // 如果放手時不在終點，或者格子沒走完，算失敗
    if (lastCell.r !== lvl.end.r || lastCell.c !== lvl.end.c || path.length !== totalCells) {
        triggerFailEffect();
    }
}

function triggerFailEffect() {
    isDrawing = false;
    const gridEl = document.getElementById('grid');
    gridEl.classList.add('shake');
    setTimeout(() => {
        gridEl.classList.remove('shake');
        resetLevel();
    }, 400);
}

function resetLevel() {
    isDrawing = false;
    path = [];
    const cells = document.querySelectorAll('.cell');
    const lvl = levels[currentLevel];
    cells.forEach(cell => {
        const r = parseInt(cell.dataset.r);
        const c = parseInt(cell.dataset.c);
        if (!(r === lvl.start.r && c === lvl.start.c)) {
            cell.classList.remove('visited');
        }
    });
}

function getCellElement(r, c) {
    return document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
}

function useHint() {
    alert("提示：Monsieur 需要走遍每一個方塊，最後一步踏上目標！");
    resetLevel();
}

function showWinScreen() {
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('win-screen').classList.add('active');
    
    const lvl = levels[currentLevel];
    document.getElementById('win-emoji').innerText = lvl.endSymbol;
    
    if (currentLevel === levels.length - 1) {
        document.getElementById('win-text').innerText = "恭喜 Monsieur 成功逃回家！";
        document.querySelector('#win-screen .btn').innerText = "重新遊玩";
    } else {
        document.getElementById('win-text').innerText = "成功突破這一關！";
        document.querySelector('#win-screen .btn').innerText = "下一關";
    }
}

function nextLevel() {
    currentLevel++;
    if (currentLevel >= levels.length) {
        currentLevel = 0;
        document.getElementById('win-screen').classList.remove('active');
        document.getElementById('cover-screen').classList.add('active');
    } else {
        document.getElementById('win-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');
        loadLevel(currentLevel);
    }
}
