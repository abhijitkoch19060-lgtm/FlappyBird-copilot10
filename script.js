const menu = document.getElementById("menu");
const settings = document.getElementById("settings");
const game = document.getElementById("game");

const menuBg = document.getElementById("menu-bg");
const gameCanvas = document.getElementById("gameCanvas");

const menuMusic = document.getElementById("menuMusic");
const gameMusic = document.getElementById("gameMusic");
const passSound = document.getElementById("passSound");
const hitSound = document.getElementById("hitSound");

const ctxMenu = menuBg.getContext("2d");
const ctx = gameCanvas.getContext("2d");

let W = window.innerWidth;
let H = window.innerHeight;

menuBg.width = W;
menuBg.height = H;
gameCanvas.width = W;
gameCanvas.height = H;

/* === SETTINGS === */
let birdColor = "#00aa00";
let eyeSize = 10;
let gravity = 0.3;
let lift = -6;
let gapSize = H * 0.35; // wider gap
let speed = 2.5;

/* === BIRD === */
let bird = {
    x: W * 0.2,
    y: H / 2,
    vy: 0,
    radius: 18
};

/* === PILLARS === */
let pillars = [];
let score = 0;
let gameRunning = false;

/* MENU BUTTONS */
document.getElementById("btn-new").onclick = startCountdown;
document.getElementById("btn-settings").onclick = () => {
    menu.classList.add("hidden");
    settings.classList.remove("hidden");
};
document.getElementById("btn-back").onclick = () => {
    settings.classList.add("hidden");
    menu.classList.remove("hidden");
};
document.getElementById("btn-quit").onclick = () => window.close();

/* SETTINGS INPUTS */
document.getElementById("birdColorPicker").oninput = e => birdColor = e.target.value;
document.getElementById("eyeSizeSlider").oninput = e => eyeSize = e.target.value;
document.getElementById("muteToggle").onchange = e => {
    menuMusic.muted = e.target.checked;
    gameMusic.muted = e.target.checked;
};

/* TOUCH + KEY + MOUSE CONTROL */
document.addEventListener("keydown", flap);
document.addEventListener("mousedown", flap);
document.addEventListener("touchstart", flap);

function flap() {
    if (gameRunning) bird.vy = lift;
}

/* MENU BACKGROUND GAMEPLAY (INFINITE AUTO MODE) */
function drawMenuBG() {
    ctxMenu.clearRect(0, 0, W, H);

    ctxMenu.fillStyle = "#87CEEB";
    ctxMenu.fillRect(0, 0, W, H);

    bird.y += 0.5; // slow auto flight
    if (bird.y > H) bird.y = 0;

    drawBird(ctxMenu, bird.x, bird.y);
    requestAnimationFrame(drawMenuBG);
}

/* START COUNTDOWN */
function startCountdown() {
    menu.classList.add("hidden");
    game.classList.remove("hidden");

    menuMusic.pause();
    gameMusic.currentTime = 0;

    let count = 3;
    const cd = document.getElementById("countdown");
    cd.classList.remove("hidden");
    cd.innerText = count;

    let timer = setInterval(() => {
        count--;
        cd.innerText = count;

        if (count < 0) {
            clearInterval(timer);
            cd.classList.add("hidden");
            startGame();
        }
    }, 1000);
}

/* START GAME */
function startGame() {
    pillars = [];
    score = 0;
    bird.y = H / 2;
    bird.vy = 0;
    gameRunning = true;
    gameMusic.play();
    loop();
}

/* GAME LOOP */
function loop() {
    if (!gameRunning) return;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, W, H);

    bird.vy += gravity;
    bird.y += bird.vy;

    if (Math.random() < 0.01) addPillar();

    movePillars();
    drawPillars();

    drawBird(ctx, bird.x, bird.y);

    document.getElementById("score").innerText = score;

    if (checkCollision()) {
        gameOver();
        return;
    }

    requestAnimationFrame(loop);
}

/* DRAW BIRD */
function drawBird(c, x, y) {
    c.fillStyle = birdColor;
    c.beginPath();
    c.arc(x, y, 18, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = "white";
    c.beginPath();
    c.arc(x + 8, y - 5, eyeSize, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = "black";
    c.beginPath();
    c.arc(x + 10, y - 5, eyeSize / 2, 0, Math.PI * 2);
    c.fill();
}

/* ADD ANCIENT PILLAR */
function addPillar() {
    let gapTop = Math.random() * (H - gapSize - 100) + 50;

    pillars.push({
        x: W,
        top: gapTop,
        bottom: gapTop + gapSize
    });
}

/* MOVE & DRAW PILLARS */
function movePillars() {
    for (let p of pillars) {
        p.x -= speed;
    }

    if (pillars.length && pillars[0].x < -80) {
        pillars.shift();
        score++;
        passSound.play();
    }
}

function drawPillars() {
    ctx.fillStyle = "#c2a270"; // stone color

    for (let p of pillars) {
        ctx.fillRect(p.x, 0, 80, p.top);

        ctx.fillRect(p.x, p.bottom, 80, H - p.bottom);

        ctx.fillStyle = "#d4b483";
        ctx.fillRect(p.x - 5, p.top - 30, 90, 30);
        ctx.fillRect(p.x - 5, p.bottom, 90, 30);
        ctx.fillStyle = "#c2a270";
    }
}

/* COLLISION */
function checkCollision() {
    if (bird.y > H || bird.y < 0) return true;

    for (let p of pillars) {
        if (bird.x + 18 > p.x && bird.x - 18 < p.x + 80) {
            if (bird.y - 18 < p.top || bird.y + 18 > p.bottom) {
                return true;
            }
        }
    }
    return false;
}

/* GAME OVER */
function gameOver() {
    gameRunning = false;
    gameMusic.pause();
    hitSound.play();
    document.getElementById("game-over").classList.remove("hidden");
}

/* RESET */
document.getElementById("btn-reset").onclick = () => {
    document.getElementById("game-over").classList.add("hidden");
    startCountdown();
};

document.getElementById("btn-menu").onclick = () => {
    document.getElementById("game-over").classList.add("hidden");
    game.classList.add("hidden");
    menu.classList.remove("hidden");
    menuMusic.play();
};

/* RESIZE FOR MOBILE */
window.onresize = () => {
    W = window.innerWidth;
    H = window.innerHeight;
    menuBg.width = W;
    menuBg.height = H;
    gameCanvas.width = W;
    gameCanvas.height = H;
};

menuMusic.play();
drawMenuBG();
