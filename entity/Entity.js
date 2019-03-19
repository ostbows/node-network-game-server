const CmdKey = require('../cmd/CmdKey');
const CmdType = require('../cmd/CmdType');

class Entity {
  constructor() {
    this.x = 10;
    this.speed = 30;
  }

  applyInput(input) {
    switch (input[CmdKey.type]) {
      case CmdType.move:
        this.x += (input[CmdKey.move.press_time]/1000) * this.speed;
        break;
    }
  }
}

module.exports = Entity;