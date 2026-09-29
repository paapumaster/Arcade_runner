class Player {
  constructor(groundY) {
    this.x = 100;
    this.groundY = groundY;
    this.width = 34;
    this.height = 54;
    this.y = this.groundY - this.height;

    this.vy = 0;
    this.gravity = 0.65;
    this.jumpForce = -13;
    this.isGrounded = true;
    this.isCrouching = false;

    this.hasShield = false;
    this.isTurbo = false;
    this.turboTimer = 0;
  }

  reset() {
    this.y = this.groundY - this.height;
    this.vy = 0;
    this.isGrounded = true;
    this.isCrouching = false;
    this.hasShield = false;
    this.isTurbo = false;
    this.turboTimer = 0;
  }

  jump() {
    if (this.isGrounded) {
      this.vy = this.jumpForce;
      this.isGrounded = false;
      audio.playJump();
    }
  }

  setCrouch(crouch) {
    if (this.isGrounded) {
      this.isCrouching = crouch;
      if (crouch) {
        this.height = 28;
        this.y = this.groundY - this.height;
      } else {
        this.height = 54;
        this.y = this.groundY - this.height;
      }
    }
  }

  activateShield() {
    this.hasShield = true;
    audio.playPowerup();
  }

  activateTurbo() {
    this.isTurbo = true;
    this.turboTimer = 240; // ~4 segundos
    audio.playPowerup();
  }

  update() {
    // Gravedad y posición vertical
    this.vy += this.gravity;
    this.y += this.vy;

    if (this.y + this.height >= this.groundY) {
      this.y = this.groundY - this.height;
      this.vy = 0;
      this.isGrounded = true;
    }

    // Timer de Turbo
    if (this.isTurbo) {
      this.turboTimer--;
      if (this.turboTimer <= 0) {
        this.isTurbo = false;
      }
    }
  }

  draw(ctx, particleSystem) {
    // Rastro de partículas si está en turbo
    if (this.isTurbo && Math.random() < 0.5) {
      particleSystem.spawn(this.x, this.y + this.height / 2, '#00f3ff', 2);
    }

    // Dibujar Escudo
    if (this.hasShield) {
      ctx.save();
      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, 35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Dibujar Jugador
    ctx.save();
    ctx.fillStyle = this.isTurbo ? '#00f3ff' : '#ff0055';
    ctx.shadowColor = this.isTurbo ? '#00f3ff' : '#ff0055';
    ctx.shadowBlur = 12;

    ctx.fillRect(this.x, this.y, this.width, this.height);

    // Visor futurista
    ctx.fillStyle = '#ffffff';
    const visorY = this.isCrouching ? this.y + 6 : this.y + 10;
    ctx.fillRect(this.x + 18, visorY, 12, 6);

    ctx.restore();
  }
}