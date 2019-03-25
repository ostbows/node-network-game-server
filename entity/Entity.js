const { actions } = require('../cmd');

class Entity {
  constructor() {
    this.x = 10;
    this.speed = 50;
    this.width = 32;
  }

  applyInput(input, entities) {
    switch (input.action) {
      case actions.move:
        let x = this.x + input.press_time * this.speed;
        const right_edge = x + this.width;

        for (const id in entities) {
          if (id != input.client_id) {
            const other = entities[id];

            if (x < other.x + other.width && right_edge > other.x) {
              if (Math.sign(input.press_time) < 0) {
                this.x = other.x + other.width;
              } else {
                this.x = other.x - this.width;
              }

              return;
            }
          }
        }

        this.x = x;

        break;
    }
  }
}

module.exports = Entity;