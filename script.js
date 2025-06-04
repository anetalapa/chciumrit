const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let bird = { x: 50, y: 150, width: 20, height: 20, gravity: 0.6, lift: -10, velocity: 0 };
let pipes = [];
let frame = 0;
let score = 0;
let isGameOver = false;

const scoreDisplay = document.getElementById("score");
const leaderboardList = document.getElementById("leaderboard-list");

function drawBird() {
  ctx.fillStyle = "yellow";
  ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
  ctx.fillStyle = "green";
  pipes.forEach(pipe => {
    ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
    ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipe.width, pipe.bottom);
  });
}

function updatePipes() {
  if (frame % 90 === 0) {
    let top = Math.random() * 200 + 50;
    let gap = 120;
    pipes.push({
      x: canvas.width,
      width: 40,
      top: top,
      bottom: canvas.height - (top + gap),
      passed: false
    });
  }

  pipes.forEach(pipe => {
    pipe.x -= 2;
    if (!pipe.passed && pipe.x + pipe.width < bird.x) {
      score++;
      pipe.passed = true;
    }

    if (
      bird.x < pipe.x + pipe.width &&
      bird.x + bird.width > pipe.x &&
      (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom)
    ) {
      gameOver();
    }
  });

  pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);
}

function updateBird() {
  bird.velocity += bird.gravity;
  bird.y += bird.velocity;

  if (bird.y + bird.height > canvas.height || bird.y < 0) {
    gameOver();
  }
}

function gameOver() {
  isGameOver = true;
  score -= 1;
  updateLeaderboard(score);
  alert("Konec hry! Tvé skóre: " + score);
  document.location.reload();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBird();
  drawPipes();
}

function update() {
  if (isGameOver) return;

  frame++;
  updateBird();
  updatePipes();
  draw();
  scoreDisplay.innerText = "Skóre: " + score;

  requestAnimationFrame(update);
}

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    bird.velocity = bird.lift;
  }
});

function updateLeaderboard(currentScore) {
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  let name = prompt("Zadej své jméno:");
  leaderboard.push({ name, score: currentScore });
  leaderboard.sort((a, b) => b.score - a.score);
  leaderboard = leaderboard.slice(0, 5);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
}

function loadLeaderboard() {
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  leaderboardList.innerHTML = "";
  leaderboard.forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `${entry.name}: ${entry.score}`;
    leaderboardList.appendChild(li);
  });
}

loadLeaderboard();
update();
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    bird.velocity = bird.lift;
  }
});

// Přidáme dotykové ovládání pro mobily
document.addEventListener("touchstart", () => {
  bird.velocity = bird.lift;
});