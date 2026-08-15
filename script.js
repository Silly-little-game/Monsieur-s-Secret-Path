const levels = [
    {
        title: "LEVEL 1: THE KEY",
        // 4x4 簡單一筆畫地圖 (0為空位, 1為可走格子, 2為起點, 3為終點)
        grid: [
            [2, 1, 1, 1],
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [1, 1, 1, 3]
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
            
            if (cell === 0) tile.classList.add('empty');
            if (cell === 2) {
                tile.classList.add('start');
                tile.innerHTML = '🏃';
            }
            if (cell === 3) {
                tile.classList.add('end');
                tile.innerHTML = '🏁';
            }
            
            board.appendChild(tile);
        });
    });
}

// 綁定重新開始按鈕
document.getElementById('restart-btn').addEventListener('click', () => {
    path = [];
    initBoard();
});

// 初始化第一關
initBoard();
