const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("start-btn");
const scoreDisplay = document.getElementById("score");
const leaderboardList = document.getElementById("scores-list");

let bird, gravity, velocity, score, pipes, gameRunning;

function resetGame() {
  bird = { x: 50, y: 150, width: 20, height: 20 };
  gravity = 0.6;
  velocity = 0;
  score = 0;
  pipes = [];
  gameRunning = true;
  scoreDisplay.textContent = "Score: 0";
}

function drawBird() {
  ctx.fillStyle = "yellow";
  ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

function drawPipe(pipe) {
  ctx.fillStyle = "green";
  ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
  ctx.fillRect(pipe.x, pipe.bottom, pipe.width, canvas.height - pipe.bottom);
}

function updatePipes() {
  if (pipes.length === 0 || pipes[pipes.length - 1].x < 200) {
    let topHeight = Math.floor(Math.random() * 200) + 50;
    pipes.push({
      x: canvas.width,
      width: 40,
      top: topHeight,
      bottom: topHeight + 100,
    });
  }

  pipes.forEach((pipe) => {
    pipe.x -= 2;
    drawPipe(pipe);
  });

  pipes = pipes.filter((pipe) => pipe.x + pipe.width > 0);
}

function detectCollision(pipe) {
  return (
    bird.x < pipe.x + pipe.width &&
    bird.x + bird.width > pipe.x &&
    (bird.y < pipe.top || bird.y + bird.height > pipe.bottom)
  );
}

function updateScore() {
  pipes.forEach((pipe) => {
    if (!pipe.scored && pipe.x + pipe.width < bird.x) {
      score++;
      pipe.scored = true;
      scoreDisplay.textContent = "Score: " + score;
    }
  });
}

function updateGame() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  velocity += gravity;
  bird.y += velocity;

  if (bird.y + bird.height > canvas.height || bird.y < 0) {
    endGame();
  }

  updatePipes();
  drawBird();
  updateScore();

  for (let pipe of pipes) {
    if (detectCollision(pipe)) {
      endGame();
    }
  }

  requestAnimationFrame(updateGame);
}

function flap() {
  if (gameRunning) {
    velocity = -10;
  }
}

function endGame() {
  gameRunning = false;
  saveScore(score);
  showLeaderboard();
}

function saveScore(score) {
  let scores = JSON.parse(localStorage.getItem("flappyScores")) || [];
  scores.push(score);
  scores.sort((a, b) => b - a);
  scores = scores.slice(0, 5); // top 5
  localStorage.setItem("flappyScores", JSON.stringify(scores));
}

function showLeaderboard() {
  leaderboardList.innerHTML = "";
  const scores = JSON.parse(localStorage.getItem("flappyScores")) || [];
  scores.forEach((s) => {
    const li = document.createElement("li");
    li.textContent = `Score: ${s}`;
    leaderboardList.appendChild(li);
  });
}

startBtn.addEventListener("click", () => {
  resetGame();
  updateGame();
});

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (!gameRunning) {
      startBtn.click();
    } else {
      flap();
    }
  }
});

canvas.addEventListener("click", flap);