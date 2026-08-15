const grid = [
    [2, 1, 1],
    [1, 1, 1],
    [1, 1, 3]
];

document.getElementById('start-btn').onclick = () => {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    initBoard();
};

function initBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    grid.forEach((row, r) => {
        row.forEach((cell, c) => {
            const t = document.createElement('div');
            t.className = 'tile' + (cell===2?' start':'') + (cell===3?' end':'');
            t.onmouseenter = () => t.classList.add('visited'); // 簡單滑動效果
            board.appendChild(t);
        });
    });
}

document.getElementById('restart-btn').onclick = () => location.reload();
