const { createSocket } = require('dgram');
const { bufferToObject, objectToBuffer } = require('../utils');
const CmdKey = require('../cmd/CmdKey');
const RpcKey = require('../rpc/RpcKey');
const RpcType = require('../rpc/RpcType');

class UdpServer {
  constructor(port, clients, entities, last_processed_input) {
    this.port = port;
    this.clients = clients;
    this.entities = entities;
    this.last_processed_input = last_processed_input;

    this.server = createSocket('udp4');
    this.messages = [];
  }

  getServer() {
    return this.server;
  }

  startServer(update_rate) {
    this.update_rate = update_rate;

    this.server.on('error', err => {
      console.log(`server(udp) error:\n${err.stack}`);
      this.server.close();
    });

    this.server.on('message', (msg, rinfo) => {
      const message = bufferToObject(msg);

      if (message) {
        message.rinfo = rinfo;
        this.messages.push(message);
      }
    });

    this.server.on('listening', () => {
      const address = this.server.address();
      console.log(`server(udp) listening ${address.address}:${address.port}`);
      this.setUpdateRate();
    });

    this.server.bind(this.port, '127.0.0.1');
  }

  setUpdateRate(hz) {
    if (hz) this.update_rate = hz;

    clearInterval(this.update_interval);
    this.update_interval = setInterval(() => {
      this.update();
    }, 1000/this.update_rate);
  }

  update() {
    this.processInputs();
    this.sendWorldState();
  }

  processInputs() {
    const message_count = this.messages.length;

    if (message_count) {
      console.log(`messages to process: ${message_count}`);

      let i = 0; while (i < message_count) {
        this.onInput(this.messages[i++]);
      }

      this.messages = this.messages.slice(i);
      console.log(`messages left: ${this.messages.length}`);
    }
  }

  onInput(message) {
    if (this.validateInput(message)) {
      const id = message[CmdKey.client_id];
      this.entities[id].applyInput(message);
      this.last_processed_input[id] = message[CmdKey.input_number];

      if (!this.clients[id].udpRemotePort) {
        this.clients[id].setUdpRemotePort(message.rinfo.port);
      }
    }
  }

  validateInput(message) {
    return this.clients[message[CmdKey.client_id]];
  }

  sendWorldState() {
    const world_state = {};
    world_state[RpcKey.type] = RpcType.world_state;
    world_state[RpcKey.world_state.states] = [];

    for (const id in this.entities) {
      const entity = this.entities[id];

      const state = {};
      state[RpcKey.world_state.state.entity_id] = id;
      state[RpcKey.world_state.state.pos_x] = entity.x.toFixed(2);
      state[RpcKey.world_state.state.last_processed_input] = this.last_processed_input[id];

      world_state[RpcKey.world_state.states].push(state);
    }

    this.broadcast(objectToBuffer(world_state));
  };

  broadcast(buffer) {
    for (const id in this.clients) this.clients[id].sendUdp(buffer);
  }
}

module.exports = UdpServer;