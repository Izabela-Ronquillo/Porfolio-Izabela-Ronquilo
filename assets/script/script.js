// Scroll Reveal Animation
function reveal() {
    const reveals = document.querySelectorAll('.reveal');
    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < windowHeight - elementVisible) {
            element.classList.add('active');
        }
    });
}

window.addEventListener('scroll', reveal);
reveal();

// Snake Game Logic
const snakeCanvas = document.getElementById('snakeCanvas');
const snakeCtx = snakeCanvas.getContext('2d');
const scoreElement = document.getElementById('snakeScore');
const highScoreElement = document.getElementById('snakeHighScore');
const finalScoreElement = document.getElementById('snakeFinalScore');
const gameOverScreen = document.getElementById('snakeGameOverScreen');
const newHighScoreElement = document.getElementById('newHighScore');

const TILE_SIZE = 25;
const GRID_WIDTH = 25;
const GRID_HEIGHT = 25;
const GAME_SPEED = 100;

let snake = [];
let food = {};
let direction = 'RIGHT';
let nextDirection = 'RIGHT';
let running = false;
let gameOver = false;
let score = 0;
let highScore = 0;
let gameLoop = null;
let particles = [];

function initSnake() {
    snakeCanvas.width = GRID_WIDTH * TILE_SIZE;
    snakeCanvas.height = GRID_HEIGHT * TILE_SIZE;
    setupMobileControls();
    startSnake();
}

function setupMobileControls() {
    const btnUp = document.getElementById('btnUp');
    const btnDown = document.getElementById('btnDown');
    const btnLeft = document.getElementById('btnLeft');
    const btnRight = document.getElementById('btnRight');

    [btnUp, btnDown, btnLeft, btnRight].forEach(btn => {
        btn.addEventListener('touchstart', (e) => e.preventDefault());
    });

    btnUp.addEventListener('click', () => {
        if (running && direction !== 'DOWN') nextDirection = 'UP';
    });
    btnDown.addEventListener('click', () => {
        if (running && direction !== 'UP') nextDirection = 'DOWN';
    });
    btnLeft.addEventListener('click', () => {
        if (running && direction !== 'RIGHT') nextDirection = 'LEFT';
    });
    btnRight.addEventListener('click', () => {
        if (running && direction !== 'LEFT') nextDirection = 'RIGHT';
    });
}

function startSnake() {
    snake = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 }
    ];

    direction = 'RIGHT';
    nextDirection = 'RIGHT';
    score = 0;
    gameOver = false;
    running = true;
    particles = [];

    updateScore();
    gameOverScreen.classList.remove('show');
    newHighScoreElement.style.display = 'none';
    spawnFood();

    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(updateSnake, GAME_SPEED);
}

function spawnFood() {
    let validPosition = false;
    while (!validPosition) {
        food = {
            x: Math.floor(Math.random() * GRID_WIDTH),
            y: Math.floor(Math.random() * GRID_HEIGHT)
        };
        validPosition = !snake.some(segment => 
            segment.x === food.x && segment.y === food.y
        );
    }
}

function createFoodParticles(x, y) {
    const particleCount = 15;
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: x * TILE_SIZE + TILE_SIZE / 2,
            y: y * TILE_SIZE + TILE_SIZE / 2,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 1,
            size: Math.random() * 3 + 1
        });
    }
}

function updateParticles() {
    particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    });
}

function drawParticles() {
    particles.forEach(p => {
        snakeCtx.save();
        snakeCtx.globalAlpha = p.life;
        snakeCtx.fillStyle = '#ffd700';
        snakeCtx.beginPath();
        snakeCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        snakeCtx.fill();
        snakeCtx.restore();
    });
}

function updateSnake() {
    if (!running) return;

    direction = nextDirection;
    const head = { ...snake[0] };

    switch (direction) {
        case 'UP': head.y--; break;
        case 'DOWN': head.y++; break;
        case 'LEFT': head.x--; break;
        case 'RIGHT': head.x++; break;
    }

    if (head.x < 0 || head.x >= GRID_WIDTH || 
        head.y < 0 || head.y >= GRID_HEIGHT) {
        endSnake();
        return;
    }

    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        endSnake();
        return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        createFoodParticles(food.x, food.y);
        spawnFood();
    } else {
        snake.pop();
    }

    updateParticles();
    drawSnake();
}

function drawSnake() {
    snakeCtx.fillStyle = '#9bbc0f';
    snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

    // Draw grid pattern
    snakeCtx.strokeStyle = 'rgba(15, 56, 15, 0.05)';
    snakeCtx.lineWidth = 1;
    for (let i = 0; i < GRID_WIDTH; i++) {
        for (let j = 0; j < GRID_HEIGHT; j++) {
            if ((i + j) % 2 === 0) {
                snakeCtx.fillStyle = 'rgba(15, 56, 15, 0.02)';
                snakeCtx.fillRect(i * TILE_SIZE, j * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    // Draw food with glow effect
    snakeCtx.save();
    snakeCtx.shadowColor = '#ff0000';
    snakeCtx.shadowBlur = 15;
    snakeCtx.fillStyle = '#ff0000';
    snakeCtx.beginPath();
    snakeCtx.arc(
        food.x * TILE_SIZE + TILE_SIZE / 2,
        food.y * TILE_SIZE + TILE_SIZE / 2,
        TILE_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    snakeCtx.fill();
    snakeCtx.restore();

    // Draw snake with gradient and segments
    snake.forEach((segment, index) => {
        const isHead = index === 0;
        
        snakeCtx.save();
        if (isHead) {
            snakeCtx.shadowColor = '#0f380f';
            snakeCtx.shadowBlur = 8;
            snakeCtx.fillStyle = '#0f380f';
        } else {
            const gradient = snakeCtx.createLinearGradient(
                segment.x * TILE_SIZE,
                segment.y * TILE_SIZE,
                segment.x * TILE_SIZE + TILE_SIZE,
                segment.y * TILE_SIZE + TILE_SIZE
            );
            gradient.addColorStop(0, '#306230');
            gradient.addColorStop(1, '#204020');
            snakeCtx.fillStyle = gradient;
        }
        
        snakeCtx.fillRect(
            segment.x * TILE_SIZE + 1,
            segment.y * TILE_SIZE + 1,
            TILE_SIZE - 2,
            TILE_SIZE - 2
        );
        snakeCtx.restore();

        // Draw eyes on head
        if (isHead) {
            snakeCtx.fillStyle = '#9bbc0f';
            const eyeSize = 3;
            const eyeOffset = 6;
            
            if (direction === 'RIGHT') {
                snakeCtx.fillRect(segment.x * TILE_SIZE + TILE_SIZE - eyeOffset, segment.y * TILE_SIZE + 6, eyeSize, eyeSize);
                snakeCtx.fillRect(segment.x * TILE_SIZE + TILE_SIZE - eyeOffset, segment.y * TILE_SIZE + TILE_SIZE - 9, eyeSize, eyeSize);
            } else if (direction === 'LEFT') {
                snakeCtx.fillRect(segment.x * TILE_SIZE + eyeOffset - 3, segment.y * TILE_SIZE + 6, eyeSize, eyeSize);
                snakeCtx.fillRect(segment.x * TILE_SIZE + eyeOffset - 3, segment.y * TILE_SIZE + TILE_SIZE - 9, eyeSize, eyeSize);
            } else if (direction === 'UP') {
                snakeCtx.fillRect(segment.x * TILE_SIZE + 6, segment.y * TILE_SIZE + eyeOffset - 3, eyeSize, eyeSize);
                snakeCtx.fillRect(segment.x * TILE_SIZE + TILE_SIZE - 9, segment.y * TILE_SIZE + eyeOffset - 3, eyeSize, eyeSize);
            } else if (direction === 'DOWN') {
                snakeCtx.fillRect(segment.x * TILE_SIZE + 6, segment.y * TILE_SIZE + TILE_SIZE - eyeOffset, eyeSize, eyeSize);
                snakeCtx.fillRect(segment.x * TILE_SIZE + TILE_SIZE - 9, segment.y * TILE_SIZE + TILE_SIZE - eyeOffset, eyeSize, eyeSize);
            }
        }
    });

    drawParticles();
}

function endSnake() {
    running = false;
    gameOver = true;
    clearInterval(gameLoop);
    
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        newHighScoreElement.style.display = 'block';
    }
    
    finalScoreElement.textContent = score;
    gameOverScreen.classList.add('show');
}

function updateScore() {
    scoreElement.textContent = score;
    highScoreElement.textContent = highScore;
}

function restartSnake() {
    startSnake();
}

document.addEventListener('keydown', (e) => {
    if (gameOver && e.code === 'Space') {
        restartSnake();
        return;
    }

    if (!running) return;

    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (direction !== 'DOWN') nextDirection = 'UP';
            e.preventDefault();
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (direction !== 'UP') nextDirection = 'DOWN';
            e.preventDefault();
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (direction !== 'RIGHT') nextDirection = 'LEFT';
            e.preventDefault();
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (direction !== 'LEFT') nextDirection = 'RIGHT';
            e.preventDefault();
            break;
    }
});

// Fireworks Logic
const fireworksCanvas = document.getElementById('fireworksCanvas');
const fireworksCtx = fireworksCanvas.getContext('2d');

function initFireworks() {
    const container = fireworksCanvas.parentElement;
    fireworksCanvas.width = container.offsetWidth;
    fireworksCanvas.height = container.offsetHeight;
}

window.addEventListener('resize', () => {
    const container = fireworksCanvas.parentElement;
    fireworksCanvas.width = container.offsetWidth;
    fireworksCanvas.height = container.offsetHeight;
});

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = {
            x: (Math.random() - 0.5) * 10,
            y: (Math.random() - 0.5) * 10
        };
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.015;
        this.gravity = 0.08;
        this.size = Math.random() * 4 + 2;
        this.flicker = Math.random() * 0.5 + 0.5;
    }

    update() {
        this.velocity.y += this.gravity;
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.alpha -= this.decay;
        this.flicker = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
    }

    draw() {
        fireworksCtx.save();
        fireworksCtx.globalAlpha = this.alpha * this.flicker;
        
        // Glow effect
        const gradient = fireworksCtx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 2
        );
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, 'transparent');
        
        fireworksCtx.fillStyle = gradient;
        fireworksCtx.beginPath();
        fireworksCtx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        fireworksCtx.fill();
        
        // Core
        fireworksCtx.fillStyle = 'white';
        fireworksCtx.beginPath();
        fireworksCtx.arc(this.x, this.y, this.size * 0.3, 0, Math.PI * 2);
        fireworksCtx.fill();
        
        fireworksCtx.restore();
    }
}

class Firework {
    constructor() {
        this.x = Math.random() * fireworksCanvas.width;
        this.y = fireworksCanvas.height;
        this.targetY = Math.random() * fireworksCanvas.height * 0.4 + 50;
        this.velocity = (this.y - this.targetY) / 50;
        this.particles = [];
        this.exploded = false;
        
        // More vibrant color palette
        const hue = Math.random() * 360;
        this.color = `hsl(${hue}, 100%, 60%)`;
        this.trailParticles = [];
        this.trailColor = `hsl(${hue}, 100%, 70%)`;
        
        // Random explosion patterns
        this.explosionType = Math.floor(Math.random() * 3);
    }

    update() {
        if (!this.exploded) {
            this.y -= this.velocity;

            // Enhanced trail
            if (Math.random() < 0.5) {
                this.trailParticles.push({
                    x: this.x + (Math.random() - 0.5) * 3,
                    y: this.y,
                    alpha: 0.8,
                    size: 3
                });
            }

            if (this.y <= this.targetY) {
                this.explode();
            }
        } else {
            this.particles.forEach((p, i) => {
                p.update();
                if (p.alpha <= 0) {
                    this.particles.splice(i, 1);
                }
            });
        }

        this.trailParticles.forEach((t, i) => {
            t.alpha -= 0.03;
            t.y += 1;
            if (t.alpha <= 0) {
                this.trailParticles.splice(i, 1);
            }
        });
    }

    explode() {
        this.exploded = true;
        const particleCount = Math.random() * 100 + 150;

        for (let i = 0; i < particleCount; i++) {
            const particle = new Particle(this.x, this.y, this.color);
            
            // Different explosion patterns
            if (this.explosionType === 0) {
                // Circular burst
                const angle = (Math.PI * 2 * i) / particleCount;
                const speed = Math.random() * 5 + 3;
                particle.velocity.x = Math.cos(angle) * speed;
                particle.velocity.y = Math.sin(angle) * speed;
            } else if (this.explosionType === 1) {
                // Ring explosion
                const angle = (Math.PI * 2 * i) / particleCount;
                const speed = Math.random() * 2 + 6;
                particle.velocity.x = Math.cos(angle) * speed;
                particle.velocity.y = Math.sin(angle) * speed;
                particle.gravity = 0.05;
            } else {
                // Willow effect
                const angle = (Math.PI * 2 * i) / particleCount;
                const speed = Math.random() * 4 + 2;
                particle.velocity.x = Math.cos(angle) * speed;
                particle.velocity.y = Math.sin(angle) * speed - 2;
                particle.gravity = 0.15;
            }
            
            this.particles.push(particle);
        }
        
        // Add some secondary sparkles
        for (let i = 0; i < 30; i++) {
            const sparkle = new Particle(this.x, this.y, 'white');
            sparkle.velocity.x = (Math.random() - 0.5) * 12;
            sparkle.velocity.y = (Math.random() - 0.5) * 12;
            sparkle.size = Math.random() * 2 + 1;
            sparkle.decay = 0.03;
            this.particles.push(sparkle);
        }
    }

    draw() {
        if (!this.exploded) {
            // Enhanced trail
            this.trailParticles.forEach(t => {
                fireworksCtx.save();
                fireworksCtx.globalAlpha = t.alpha;
                
                const gradient = fireworksCtx.createRadialGradient(
                    t.x, t.y, 0,
                    t.x, t.y, t.size * 2
                );
                gradient.addColorStop(0, this.trailColor);
                gradient.addColorStop(1, 'transparent');
                
                fireworksCtx.fillStyle = gradient;
                fireworksCtx.beginPath();
                fireworksCtx.arc(t.x, t.y, t.size * 2, 0, Math.PI * 2);
                fireworksCtx.fill();
                fireworksCtx.restore();
            });

            // Rocket with glow
            fireworksCtx.save();
            fireworksCtx.shadowColor = this.color;
            fireworksCtx.shadowBlur = 20;
            fireworksCtx.fillStyle = this.color;
            fireworksCtx.beginPath();
            fireworksCtx.arc(this.x, this.y, 4, 0, Math.PI * 2);
            fireworksCtx.fill();
            
            fireworksCtx.fillStyle = 'white';
            fireworksCtx.beginPath();
            fireworksCtx.arc(this.x, this.y, 2, 0, Math.PI * 2);
            fireworksCtx.fill();
            fireworksCtx.restore();
        } else {
            this.particles.forEach(p => p.draw());
        }
    }

    isDone() {
        return this.exploded && this.particles.length === 0;
    }
}

const fireworks = [];
let lastFireworkTime = 0;

function animateFireworks(currentTime) {
    fireworksCtx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    fireworksCtx.fillRect(0, 0, fireworksCanvas.width, fireworksCanvas.height);

    // Spawn fireworks at varying intervals
    const spawnInterval = Math.random() * 400 + 300;
    if (currentTime - lastFireworkTime > spawnInterval) {
        fireworks.push(new Firework());
        lastFireworkTime = currentTime;
        
        // Sometimes spawn multiple at once
        if (Math.random() < 0.3) {
            setTimeout(() => fireworks.push(new Firework()), 100);
        }
    }

    fireworks.forEach((fw, i) => {
        fw.update();
        fw.draw();

        if (fw.isDone()) {
            fireworks.splice(i, 1);
        }
    });

    requestAnimationFrame(animateFireworks);
}

// Initialize both games
initSnake();
initFireworks();
animateFireworks(0);