const { createSocket } = require('dgram');
const cmd = require('../cmd');
const rpc = require('../rpc');

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
      const message = cmd.parse(msg);

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
    while (this.messages.length) {
      this.onInput(this.messages[0]);
      this.messages.shift();
    }
  }

  onInput(input) {
    if (this.validateInput(input)) {
      const id = input.client_id;
      this.entities[id].applyInput(input);
      this.last_processed_input[id] = input.input_number;

      if (!this.clients[id].udpRemotePort) {
        this.clients[id].setUdpRemotePort(input.rinfo.port);
      }
    }
  }

  validateInput(input) {
    return this.clients[input.client_id];
  }

  sendWorldState() {
    this.broadcast(rpc.getWorldState(this.entities, this.last_processed_input));
  }

  broadcast(buffer) {
    for (const id in this.clients) this.clients[id].sendUdp(buffer);
  }
}

module.exports = UdpServer;