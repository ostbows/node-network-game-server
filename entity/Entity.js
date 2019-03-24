const { actions } = require('../cmd');

class Entity {
  constructor() {
    this.x = 10;
    this.speed = 50;
  }

  applyInput(input) {
    switch (input.action) {
      case actions.move:
        this.x += input.press_time * this.speed;
        break;
    }
  }
}

module.exports = Entity;