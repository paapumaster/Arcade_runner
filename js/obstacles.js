class Obstacle {
  constructor(canvasWidth, groundY, type) {
    this.type = type; // 'ground', 'air', 'shield', 'turbo', 'score'
    this.x = canvasWidth + 50;
    this.markedForDeletion = false;

    if (type === 'ground') {
      this.width = 28;
      this.height = 45;
      this.y = groundY - this.height;
      this.color = '#ffaa00';
    } else if (type === 'air') {
      this.width = 35;
      this.height = 25;
      this.y = groundY - 75;
      this.color = '#ff00aa';
    } else {
      // Power-ups / Orbes
      this.width = 20;
      this.height = 20;
      this.y = groundY - (Math.random() > 0.5 ? 40 : 80);
      if (type === 'shield') this.color = '#00ff66';
      if (type === 'turbo') this.color = '#00f3ff';
      if (type === 'score') this.color = '#ffd700';
    }
  }

  update(speed) {
    this.x -= speed;
    if (this.x + this.width < -50) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;

    if (['shield', 'turbo', 'score'].includes(this.type)) {
      ctx.beginPath();
      ctx.arc(this.x + 10, this.y + 10, 10, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    ctx.restore();
  }
}

class ObstacleManager {
  constructor(canvasWidth, groundY) {
    this.canvasWidth = canvasWidth;
    this.groundY = groundY;
    this.list = [];
    this.spawnTimer = 0;
    this.spawnInterval = 100;
  }

  reset() {
    this.list = [];
    this.spawnTimer = 0;
  }

  update(speed) {
    this.spawnTimer++;
    if (this.spawnTimer > this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnInterval = Math.floor(Math.random() * 60) + 70;

      const rand = Math.random();
      let type = 'ground';
      if (rand < 0.4) type = 'ground';
      else if (rand < 0.7) type = 'air';
      else if (rand < 0.8) type = 'shield';
      else if (rand < 0.9) type = 'turbo';
      else type = 'score';

      this.list.push(new Obstacle(this.canvasWidth, this.groundY, type));
    }

    for (let i = this.list.length - 1; i >= 0; i--) {
      const obs = this.list[i];
      obs.update(speed);
      if (obs.markedForDeletion) {
        this.list.splice(i, 1);
      }
    }
  }

  draw(ctx) {
    this.list.forEach(obs => obs.draw(ctx));
  }
}