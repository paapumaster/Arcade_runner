class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    this.groundY = 340;
    this.speed = 6;
    this.score = 0;
    this.highScore = localStorage.getItem('cyber_high_score') || 0;
    this.gameOver = false;
    this.started = false;

    this.player = new Player(this.groundY);
    this.obstacleManager = new ObstacleManager(this.canvas.width, this.groundY);
    this.particleSystem = new ParticleSystem();

    this.bindEvents();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      audio.init();
      if (!this.started || this.gameOver) {
        if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
          this.restart();
        }
        return;
      }

      if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
        this.player.jump();
      }
      if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        this.player.setCrouch(true);
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        this.player.setCrouch(false);
      }
    });
  }

  restart() {
    this.score = 0;
    this.speed = 6;
    this.gameOver = false;
    this.started = true;
    this.player.reset();
    this.obstacleManager.reset();
    this.particleSystem.clear();
  }

  checkCollisions() {
    const p = this.player;

    for (let i = this.obstacleManager.list.length - 1; i >= 0; i--) {
      const obs = this.obstacleManager.list[i];

      // Detección AABB (Axis-Aligned Bounding Box)
      if (
        p.x < obs.x + obs.width &&
        p.x + p.width > obs.x &&
        p.y < obs.y + obs.height &&
        p.y + p.height > obs.y
      ) {
        // Colisión con Power-ups
        if (obs.type === 'shield') {
          p.activateShield();
          this.obstacleManager.list.splice(i, 1);
          continue;
        }
        if (obs.type === 'turbo') {
          p.activateTurbo();
          this.obstacleManager.list.splice(i, 1);
          continue;
        }
        if (obs.type === 'score') {
          this.score += 200;
          audio.playPowerup();
          this.obstacleManager.list.splice(i, 1);
          continue;
        }

        // Colisión con Obstáculos
        if (p.isTurbo) {
          this.particleSystem.spawn(obs.x, obs.y, obs.color, 12);
          this.obstacleManager.list.splice(i, 1);
          this.score += 50;
        } else if (p.hasShield) {
          p.hasShield = false;
          audio.playCrash();
          this.particleSystem.spawn(obs.x, obs.y, '#00ff66', 10);
          this.obstacleManager.list.splice(i, 1);
        } else {
          // Game Over
          audio.playCrash();
          this.particleSystem.spawn(p.x, p.y, '#ff0055', 20);
          this.gameOver = true;
          if (this.score > this.highScore) {
            this.highScore = Math.floor(this.score);
            localStorage.setItem('cyber_high_score', this.highScore);
          }
        }
      }
    }
  }

  update() {
    if (!this.started || this.gameOver) return;

    this.speed += 0.001; // Dificultad progresiva
    this.score += 0.1;

    const currentSpeed = this.player.isTurbo ? this.speed * 1.8 : this.speed;

    this.player.update();
    this.obstacleManager.update(currentSpeed);
    this.checkCollisions();
  }

  draw() {
    // Limpiar pantalla
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Dibujar suelo Synthwave
    this.ctx.strokeStyle = '#2d1b4e';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.groundY);
    this.ctx.lineTo(this.canvas.width, this.groundY);
    this.ctx.stroke();

    // Dibujar entidades
    this.player.draw(this.ctx, this.particleSystem);
    this.obstacleManager.draw(this.ctx);
    this.particleSystem.updateAndDraw(this.ctx);

    // Dibujar UI (Puntaje e Instrucciones)
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '16px monospace';
    this.ctx.fillText(`SCORE: ${Math.floor(this.score)}`, 20, 30);
    this.ctx.fillText(`MAX: ${this.highScore}`, 20, 55);

    if (!this.started) {
      this.renderOverlay('CYBER RUNNER 2D', 'Presiona ESPACIO o W para Comenzar');
    } else if (this.gameOver) {
      this.renderOverlay('GAME OVER', 'Presiona ESPACIO para Reiniciar');
    }
  }

  renderOverlay(title, subtitle) {
    this.ctx.fillStyle = 'rgba(10, 10, 18, 0.75)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#00f3ff';
    this.ctx.font = 'bold 32px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(title, this.canvas.width / 2, 180);

    this.ctx.fillStyle = '#fff';
    this.ctx.font = '16px monospace';
    this.ctx.fillText(subtitle, this.canvas.width / 2, 220);
    this.ctx.textAlign = 'left';
  }

  loop() {
    this.update();
    this.draw();
    requestAnimationFrame(this.loop);
  }
}

// Inicializar el juego al cargar la página
window.onload = () => {
  new Game();
};