const levels = [
    {
        title: "LEVEL 1: THE KEY",
        // 4x4 經典地圖：2是起點(小人), 3是終點(鑰匙/旗子), 1是可走格子
        grid: [
            [2, 1, 1, 1],
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [1, 1, 1, 3]
        ],
        // 正確解答路徑 (順序: R0C0 -> R0C1 -> ...)
        solution: [
            "0-0", "0-1", "0-2", "0-3",
            "1-3", "1-2", "1-1", "1-0",
            "2-0", "2-1", "2-2", "2-3",
            "3-3"
        ]
    }
];

let currentLevel = 0;
let path = [];
let isDragging = false;

function initBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    const levelData = levels[currentLevel];
    document.getElementById('level-title').innerText = levelData.title;
    
    const rows = levelData.grid.length;
    const cols = levelData.grid[0].length;
    board.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    levelData.grid.forEach((row, r) => {
        row.forEach((cell, c) => {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.dataset.r = r;
            tile.dataset.c = c;
            tile.id = `tile-${r}-${c}`;
            
            if (cell === 0) tile.classList.add('empty');
            if (cell === 2) {
                tile.classList.add('start');
                tile.innerHTML = '🏃';
            }
            if (cell === 3) {
                tile.classList.add('end');
                tile.innerHTML = '🔑';
            }
            
            board.appendChild(tile);
        });
    });

    bindTouchEvents();
}

// 絲滑滑動連線邏輯 (Touch & Mouse Support)
function bindTouchEvents() {
    const board = document.getElementById('board');

    const getTileFromPoint = (x, y) => {
        const elem = document.elementFromPoint(x, y);
        return elem ? elem.closest('.tile') : null;
    };

    const handleStart = (e) => {
        isDragging = true;
        path = [];
        document.querySelectorAll('.tile').forEach(t => t.classList.remove('visited', 'hint'));
        
        const touch = e.touches ? e.touches[0] : e;
        const tile = getTileFromPoint(touch.clientX, touch.clientY);
        if (tile && tile.classList.contains('start')) {
            addTileToPath(tile);
        }
    };

    const handleMove = (e) => {
        if (!isDragging) return;
        e.preventDefault(); // 防止手機畫面滑動
        const touch = e.touches ? e.touches[0] : e;
        const tile = getTileFromPoint(touch.clientX, touch.clientY);
        if (tile && !tile.classList.contains('empty')) {
            addTileToPath(tile);
        }
    };

    const handleEnd = () => {
        isDragging = false;
        checkWin();
    };

    board.addEventListener('mousedown', handleStart);
    board.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);

    board.addEventListener('touchstart', handleStart, { passive: false });
    board.addEventListener('touchmove', handleMove, { passive: false });
    window.addEventListener('touchend', handleEnd);
}

function addTileToPath(tile) {
    const id = `${tile.dataset.r}-${tile.dataset.c}`;
    if (path.includes(id)) return; // 不能重複踩

    // 檢查是否與上一格相鄰
    if (path.length > 0) {
        const lastTile = document.getElementById(`tile-${path[path.length - 1]}`);
        const rDiff = Math.abs(lastTile.dataset.r - tile.dataset.r);
        const cDiff = Math.abs(lastTile.dataset.c - tile.dataset.c);
        if (rDiff + cDiff !== 1) return; // 只能上下左右走
    }

    path.push(id);
    tile.classList.add('visited');
}

// 檢查通關條件
function checkWin() {
    const levelData = levels[currentLevel];
    const totalValidTiles = levelData.grid.flat().filter(cell => cell !== 0).length;
    const lastTileId = path[path.length - 1];
    
    if (path.length === totalValidTiles && lastTileId === '3-3') {
        setTimeout(() => alert('🎉 通關成功！Monsieur 順利找到鑰匙了！'), 200);
    }
}

// 提示功能 (Hint)
document.getElementById('hint-btn')?.addEventListener('click', () => {
    const levelData = levels[currentLevel];
    const nextStepIndex = path.length;
    
    if (nextStepIndex < levelData.solution.length) {
        const nextTileId = levelData.solution[nextStepIndex];
        const nextTile = document.getElementById(`tile-${nextTileId}`);
        if (nextTile) {
            nextTile.classList.add('hint');
            setTimeout(() => nextTile.classList.remove('hint'), 1500);
        }
    }
});

// 重新開始
document.getElementById('restart-btn').addEventListener('click', () => {
    path = [];
    initBoard();
});

initBoard();
