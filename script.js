// 4x4 保證可通關地圖
const solutionPath = [
    "0-0", "0-1", "0-2", "0-3",
    "1-3", "1-2", "1-1", "1-0",
    "2-0", "2-1", "2-2", "2-3",
    "3-3"
];

let path = [];
let isDragging = false;

function initBoard() {
    const board = document.getElementById('board');
    if (!board) return;
    board.innerHTML = '';
    path = [];

    // 建立 4x4 格子
    for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.id = `tile-${r}-${c}`;
            tile.dataset.r = r;
            tile.dataset.c = c;

            if (r === 0 && c === 0) {
                tile.classList.add('start');
                tile.innerHTML = '🏃';
            } else if (r === 3 && c === 3) {
                tile.classList.add('end');
                tile.innerHTML = '🔑';
            }

            board.appendChild(tile);
        }
    }
    bindEvents();
}

function bindEvents() {
    const board = document.getElementById('board');

    const getTile = (e) => {
        const touch = e.touches ? e.touches[0] : e;
        const elem = document.elementFromPoint(touch.clientX, touch.clientY);
        return elem ? elem.closest('.tile') : null;
    };

    const handleStart = (e) => {
        isDragging = true;
        path = [];
        document.querySelectorAll('.tile').forEach(t => t.classList.remove('visited', 'hint'));
        const tile = getTile(e);
        if (tile && tile.classList.contains('start')) {
            addTile(tile);
        }
    };

    const handleMove = (e) => {
        if (!isDragging) return;
        const tile = getTile(e);
        if (tile) addTile(tile);
    };

    const handleEnd = () => {
        isDragging = false;
        checkWin();
    };

    board.onmousedown = handleStart;
    board.onmousemove = handleMove;
    window.onmouseup = handleEnd;

    board.addEventListener('touchstart', handleStart, { passive: true });
    board.addEventListener('touchmove', handleMove, { passive: true });
    window.addEventListener('touchend', handleEnd);
}

function addTile(tile) {
    const id = `${tile.dataset.r}-${tile.dataset.c}`;
    if (path.includes(id)) return;

    if (path.length > 0) {
        const lastId = path[path.length - 1];
        const [lastR, lastC] = lastId.split('-').map(Number);
        const currR = Number(tile.dataset.r);
        const currC = Number(tile.dataset.c);

        // 只允許相鄰格子（上下左右）
        if (Math.abs(lastR - currR) + Math.abs(lastC - currC) !== 1) return;
    }

    path.push(id);
    tile.classList.add('visited');
}

function checkWin() {
    // 踩滿 16 格且最後一格是終點 (3-3)
    if (path.length === 16 && path[path.length - 1] === '3-3') {
        setTimeout(() => alert('🎉 通關成功！Monsieur 順利拿到鑰匙了！'), 100);
    }
}

// 按鈕事件
document.addEventListener('DOMContentLoaded', () => {
    initBoard();

    document.getElementById('restart-btn').onclick = () => initBoard();

    document.getElementById('hint-btn').onclick = () => {
        const nextIndex = path.length;
        if (nextIndex < solutionPath.length) {
            const nextTileId = solutionPath[nextIndex];
            const tile = document.getElementById(`tile-${nextTileId}`);
            if (tile) {
                tile.classList.add('hint');
                setTimeout(() => tile.classList.remove('hint'), 1200);
            }
        }
    };
});

initBoard();
