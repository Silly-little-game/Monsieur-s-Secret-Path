// 關卡設定資料 (包含起點、終點與標準解答路徑 solution)
const levels = [
    {
        name: "LEVEL 1: 解開手銬",
        endSymbol: "⛓️",
        rows: 3, cols: 3,
        start: {r: 0, c: 0},
        end: {r: 2, c: 2},
        solution: [
            {r: 0, c: 0}, {r: 0, c: 1}, {r: 0, c: 2},
            {r: 1, c: 2}, {r: 1, c: 1}, {r: 1, c: 0},
            {r: 2, c: 0}, {r: 2, c: 1}, {r: 2, c: 2}
        ]
    },
    {
        name: "LEVEL 2: 取得鑰匙",
        endSymbol: "🔑",
        rows: 3, cols: 4,
        start: {r: 0, c: 0},
        end: {r: 2, c: 3},
        solution: [
            {r: 0, c: 0}, {r: 1, c: 0}, {r: 2, c: 0},
            {r: 2, c: 1}, {r: 1, c: 1}, {r: 0, c: 1},
            {r: 0, c: 2}, {r: 1, c: 2}, {r: 2, c: 2},
            {r: 2, c: 3}, {r: 1, c: 3}, {r: 0, c: 3}
        ]
    },
    {
        name: "LEVEL 3: 逃回家中",
        endSymbol: "🏡",
        rows: 4, cols: 4,
        start: {r: 0, c: 0},
        end: {r: 3, c: 0},
        solution: [
            {r: 0, c: 0}, {r: 0, c: 1}, {r: 0, c: 2}, {r: 0, c: 3},
            {r: 1, c: 3}, {r: 1, c: 2}, {r: 1, c: 1}, {r: 1, c: 0},
            {r: 2, c: 0}, {r: 2, c: 1}, {r: 2, c: 2}, {r: 2, c: 3},
            {r: 3, c: 3}, {r: 3, c: 2}, {r: 3, c: 1}, {r: 3, c: 0}
        ]
    }
];

let currentLevel = 0;
let path = [];
let isDrawing = false;
let totalCells = 0;
let isHinting = false;
let hintTimer = null;

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
    gridEl.style.gridTemplateColumns = `repeat(${lvl.cols}, 55px)`;
    gridEl.innerHTML = '';
    
    path = [];
    isDrawing = false;
    isHinting = false;
    if (hintTimer) clearInterval(hintTimer);
    totalCells = lvl.rows * lvl.cols;

    for (let r = 0; r < lvl.rows; r++) {
        for (let c = 0; c < lvl.cols; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.r = r;
            cell.dataset.c = c;

            if (r === lvl.start.r && c === lvl.start.c) {
                cell.classList.add('start');
                cell.innerHTML = '🧑‍🦲';
            } else if (r === lvl.end.r && c === lvl.end.c) {
                cell.classList.add('end');
                cell.innerHTML = lvl.endSymbol;
            }

            // 電腦滑鼠事件
            cell.addEventListener('mousedown', () => handleStart(r, c));
            cell.addEventListener('mouseenter', () => handleMove(r, c));

            gridEl.appendChild(cell);
        }
    }
}

// 支援手機全螢幕觸控滑動
const gridContainer = document.getElementById('grid');

gridContainer.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    if (elem && elem.classList.contains('cell')) {
        const r = parseInt(elem.dataset.r);
        const c = parseInt(elem.dataset.c);
        handleStart(r, c);
    }
}, { passive: false });

gridContainer.addEventListener('touchmove', (e) => {
    if (!isDrawing) return;
    e.preventDefault(); // 防止手機滾動頁面
    const touch = e.touches[0];
    const elem = document.elementFromPoint(touch.clientX, touch.clientY);
    if (elem && elem.classList.contains('cell')) {
        const r = parseInt(elem.dataset.r);
        const c = parseInt(elem.dataset.c);
        handleMove(r, c);
    }
}, { passive: false });

window.addEventListener('mouseup', handleEnd);
window.addEventListener('touchend', handleEnd);

function handleStart(r, c) {
    if (isHinting) return;
    const lvl = levels[currentLevel];
    if (r === lvl.start.r && c === lvl.start.c) {
        isDrawing = true;
        resetLevel();
        addCellToPath(r, c);
    }
}

function handleMove(r, c) {
    if (!isDrawing || isHinting) return;
    const lastCell = path[path.length - 1];
    if (!lastCell) return;

    // 如果已經在該格子上則忽略
    if (lastCell.r === r && lastCell.c === c) return;

    // 檢查是否為相鄰格子 (上下左右)
    const isAdjacent = Math.abs(lastCell.r - r) + Math.abs(lastCell.c - c) === 1;
    
    if (isAdjacent) {
        // 倒退機制（回上一格）
        if (path.length > 1 && path[path.length - 2].r === r && path[path.length - 2].c === c) {
            removeLastCell();
            return;
        }

        // 不可重複走過
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

    // 走到終點立即判定
    if (r === lvl.end.r && c === lvl.end.c) {
        isDrawing = false;
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
    if (!(removed.r === lvl.start.r && removed.c === lvl.start.c)) {
        const cellEl = getCellElement(removed.r, removed.c);
        if (cellEl) cellEl.classList.remove('visited');
    }
}

function handleEnd() {
    if (!isDrawing) return;
    isDrawing = false;
    
    const lvl = levels[currentLevel];
    const lastCell = path[path.length - 1];
    
    if (!lastCell || lastCell.r !== lvl.end.r || lastCell.c !== lvl.end.c || path.length !== totalCells) {
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
    if (hintTimer) clearInterval(hintTimer);
    isHinting = false;
    path = [];
    const cells = document.querySelectorAll('.cell');
    const lvl = levels[currentLevel];
    cells.forEach(cell => {
        const r = parseInt(cell.dataset.r);
        const c = parseInt(cell.dataset.c);
        cell.classList.remove('hint-glow');
        if (!(r === lvl.start.r && c === lvl.start.c)) {
            cell.classList.remove('visited');
        }
    });
}

function getCellElement(r, c) {
    return document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
}

// 提示功能：逐步閃爍正確解答路線
function useHint() {
    if (isHinting) return;
    resetLevel();
    isHinting = true;
    
    const lvl = levels[currentLevel];
    const solution = lvl.solution;
    
    let step = 0;
    hintTimer = setInterval(() => {
        if (step < solution.length) {
            let pos = solution[step];
            let cellEl = getCellElement(pos.r, pos.c);
            if (cellEl) {
                cellEl.classList.add('hint-glow');
            }
            step++;
        } else {
            clearInterval(hintTimer);
            // 示範完畢後停留 1.5 秒自動清除並讓玩家開始挑戰
            setTimeout(() => {
                resetLevel();
            }, 1500);
        }
    }, 250); // 每 0.25 秒亮起下一格
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
