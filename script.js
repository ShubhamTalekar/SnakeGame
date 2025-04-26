document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('high-score');
    const startButton = document.getElementById('start-btn');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // Game variables
    const gridSize = 20;
    const tileCount = canvas.width / gridSize;
    let snake = [{ x: 10, y: 10 }];
    let food = { x: 5, y: 5 };
    let direction = { x: 0, y: 0 };
    let gameRunning = false;
    let baseSpeed = 150; // Starting speed (higher number = slower)
    let speedIncrease = 5; // How much to speed up after each food
    let minSpeed = 50; // Maximum speed (lower number = faster)
    let currentSpeed = baseSpeed;
    let score = 0;
    let highScore = localStorage.getItem('snakeHighScore') || 0;
    let gameInterval;

    highScoreElement.textContent = highScore;

    // Event listeners
    startButton.addEventListener('click', startGame);

    // Arrow button controls
    document.getElementById('up-btn').addEventListener('click', () => changeDirection(0, -1));
    document.getElementById('left-btn').addEventListener('click', () => changeDirection(-1, 0));
    document.getElementById('down-btn').addEventListener('click', () => changeDirection(0, 1));
    document.getElementById('right-btn').addEventListener('click', () => changeDirection(1, 0));

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp':
                changeDirection(0, -1);
                break;
            case 'ArrowLeft':
                changeDirection(-1, 0);
                break;
            case 'ArrowDown':
                changeDirection(0, 1);
                break;
            case 'ArrowRight':
                changeDirection(1, 0);
                break;
            case ' ':
                if (!gameRunning) startGame();
                break;
        }
    });

    // Toggle dark mode
    darkModeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode');
        drawGame(); // Redraw the canvas to apply the new background color
    });

    function startGame() {
        if (gameRunning) return;

        // Reset game state
        snake = [{ x: 10, y: 10 }];
        direction = { x: 1, y: 0 }; // Start moving right
        currentSpeed = baseSpeed; // Reset to base speed
        score = 0;
        scoreElement.textContent = score;
        placeFood();
        gameRunning = true;
        startButton.textContent = 'Restart Game';

        // Start game loop
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, currentSpeed);

        // Redraw the initial game state
        drawGame();
    }

    function gameLoop() {
        if (!gameRunning) return;

        // Move snake
        const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

        // Check for collisions
        if (
            head.x < 0 || head.x >= tileCount ||
            head.y < 0 || head.y >= tileCount ||
            snake.some(segment => segment.x === head.x && segment.y === head.y)
        ) {
            gameOver();
            return;
        }

        // Add new head
        snake.unshift(head);

        // Check if snake ate food
        if (head.x === food.x && head.y === food.y) {
            score++;
            scoreElement.textContent = score;

            // Increase speed (but not beyond minSpeed)
            currentSpeed = Math.max(minSpeed, currentSpeed - speedIncrease);
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, currentSpeed);

            placeFood();
        } else {
            // Remove tail if no food was eaten
            snake.pop();
        }

        // Draw game
        drawGame();
    }

    function drawGame() {
        // Get the current canvas background color from CSS variables
        const canvasBgColor = getComputedStyle(document.body).getPropertyValue('--canvas-bg').trim();

        // Clear canvas with the current background color
        ctx.fillStyle = canvasBgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw snake
        snake.forEach((segment, index) => {
            ctx.fillStyle = index === 0 ? '#4CAF50' : '#8BC34A';
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        });

        // Draw food
        ctx.fillStyle = '#FF5722';
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
    }

    function placeFood() {
        let newFoodPosition;
        do {
            newFoodPosition = {
                x: Math.floor(Math.random() * tileCount),
                y: Math.floor(Math.random() * tileCount)
            };
        } while (snake.some(segment =>
            segment.x === newFoodPosition.x && segment.y === newFoodPosition.y
        ));

        food = newFoodPosition;
    }

    function changeDirection(x, y) {
        // Prevent reversing direction
        if (direction.x !== -x && direction.y !== -y) {
            direction = { x, y };
        }
    }

    function gameOver() {
        gameRunning = false;
        clearInterval(gameInterval);

        // Update high score
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }

        // Draw game over screen
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40);

        ctx.font = '24px Arial';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText(`High Score: ${highScore}`, canvas.width / 2, canvas.height / 2 + 40);

        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(canvas.width / 2 - 75, canvas.height / 2 + 80, 150, 40);
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText('Restart', canvas.width / 2, canvas.height / 2 + 105);

        // Add click handler for restart button
        canvas.onclick = (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Check if click was on restart button
            if (x >= canvas.width / 2 - 75 && x <= canvas.width / 2 + 75 &&
                y >= canvas.height / 2 + 80 && y <= canvas.height / 2 + 120) {
                canvas.onclick = null; // Remove click handler
                startGame();
            }
        };
    }

    // Initial draw
    drawGame();
});