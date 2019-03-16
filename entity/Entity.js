class Entity {
  constructor() {
    this.x = 10;
    this.speed = 30;
    this.position_buffer = [];
  }

  applyInput(input) {
    switch (input.cmd) {
      case 'move':
        this.x += (input.dt/1000) * this.speed;
        break;
    }
  }
}

module.exports = Entity;