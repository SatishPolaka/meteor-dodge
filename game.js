// Meteor Dodge – core game logic
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const scoreEl = document.getElementById('score');

let width, height;
function resizeCanvas() {
    width = Math.min(window.innerWidth * 0.9, 500);
    height = Math.min(window.innerHeight * 0.7, 600);
    canvas.width = width;
    canvas.height = height;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Game assets (simple SVG images loaded as Image objects)
const shipImg = new Image();
shipImg.src = 'assets/ship.svg';
const meteorImg = new Image();
meteorImg.src = 'assets/meteor.svg';

// Game state
let gameState = 'menu'; // 'menu', 'playing', 'over'
let player = { x: width / 2, y: height - 60, width: 40, height: 40, speed: 5 };
let meteors = [];
let spawnTimer = 0;
let spawnInterval = 90; // frames
let score = 0;
let frameCount = 0;

function resetGame() {
    player.x = width / 2;
    meteors = [];
    spawnTimer = 0;
    score = 0;
    frameCount = 0;
    scoreEl.textContent = 'Score: 0';
}

function startGame() {
    resetGame();
    gameState = 'playing';
    startBtn.style.display = 'none';
    restartBtn.style.display = 'none';
    requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameState = 'over';
    restartBtn.style.display = 'inline-block';
}

function spawnMeteor() {
    const size = Math.random() * 30 + 20;
    const x = Math.random() * (width - size);
    const speed = Math.random() * 2 + 1.5;
    meteors.push({ x, y: -size, size, speed });
}

function update() {
    // Player movement (keyboard)
    if (keys['ArrowLeft'] || keys['a']) player.x -= player.speed;
    if (keys['ArrowRight'] || keys['d']) player.x += player.speed;
    // Clamp within canvas
    player.x = Math.max(0, Math.min(width - player.width, player.x));

    // Touch movement handled separately

    // Meteors
    spawnTimer++;
    if (spawnTimer > spawnInterval) {
        spawnMeteor();
        spawnTimer = 0;
    }
    meteors.forEach(m => {
        m.y += m.speed;
    });
    // Remove off‑screen meteors
    meteors = meteors.filter(m => m.y < height + m.size);

    // Collision detection (circle‑rect approximation)
    for (let m of meteors) {
        const cx = m.x + m.size / 2;
        const cy = m.y + m.size / 2;
        const rx = player.x;
        const ry = player.y;
        const rw = player.width;
        const rh = player.height;
        // Simple AABB vs circle test
        const nearestX = Math.max(rx, Math.min(cx, rx + rw));
        const nearestY = Math.max(ry, Math.min(cy, ry + rh));
        const dx = cx - nearestX;
        const dy = cy - nearestY;
        if (dx * dx + dy * dy < (m.size / 2) * (m.size / 2)) {
            gameOver();
            return;
        }
    }

    // Score based on time survived
    frameCount++;
    if (frameCount % 30 === 0) {
        score++;
        scoreEl.textContent = 'Score: ' + score;
    }
}

function draw() {
    // Clear background
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, width, height);

    // Draw player ship
    ctx.drawImage(shipImg, player.x, player.y, player.width, player.height);

    // Draw meteors
    meteors.forEach(m => {
        ctx.drawImage(meteorImg, m.x, m.y, m.size, m.size);
    });
}

function gameLoop() {
    if (gameState !== 'playing') return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Input handling
const keys = {};
window.addEventListener('keydown', e => { keys[e.key] = true; });
window.addEventListener('keyup', e => { keys[e.key] = false; });

// Touch controls – move ship horizontally based on touch X
canvas.addEventListener('touchstart', e => {
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    player.x = touchX - player.width / 2;
    e.preventDefault();
});
canvas.addEventListener('touchmove', e => {
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    player.x = touchX - player.width / 2;
    e.preventDefault();
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Initial menu screen
ctx.fillStyle = '#111';
ctx.fillRect(0, 0, width, height);
ctx.fillStyle = '#fff';
ctx.font = '24px Arial';
ctx.textAlign = 'center';
ctx.fillText('Meteor Dodge', width / 2, height / 2 - 30);
ctx.font = '16px Arial';
ctx.fillText('Press Start to Play', width / 2, height / 2 + 10);
