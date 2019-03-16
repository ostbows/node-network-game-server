const net = require('net');
const Client = require('../client/Client');
const Entity = require('../entity/Entity');
const { objectToBuffer, sizeOfObject } = require('../utils');

class TcpServer {
  constructor(port, clients, entities, last_processed_input) {
    this.port = port;
    this.clients = clients;
    this.entities = entities;
    this.last_processed_input = last_processed_input;

    this.server = net.createServer();
    this.next_client_id = 0;
  }

  startServer(udpServer) {
    this.udpServer = udpServer;

    this.server.on('error', err => {
      console.log(`server(tcp) error:\n${err.stack}`);
      this.server.close();
    });

    this.server.on('connection', socket => {
      this.onConnect(socket);
      socket.on('end', () => this.onDisconnect(socket));
    });

    this.server.on('listening', () => {
      const address = this.server.address();
      console.log(`server(tcp) listening ${address.address}:${address.port}`);
    });

    this.server.maxConnections = 2;
    this.server.listen(this.port, '127.0.0.1');
  }

  onConnect(socket) {
    const id = this.next_client_id++;

    this.clients[id] = new Client();
    this.clients[id].setTcpSocket(socket);
    this.clients[id].setUdpServer(this.udpServer);

    this.entities[id] = new Entity();
    this.last_processed_input[id] = 0;

    this.clients[id].sendTcp(objectToBuffer({rpc: 'connected', id}));
    console.log(`client #${id} connected, clients: ${sizeOfObject(this.clients)}`);
  }

  onDisconnect(socket) {
    const rport = socket.remotePort;
    const raddr = socket.remoteAddress;
    const message = {rpc: 'disconnect', id: null};

    for (const id in this.clients) {
      const { remotePort, remoteAddress } = this.clients[id].tcpSocket;

      if (remotePort === rport && remoteAddress === raddr) {
        delete this.clients[id];
        delete this.entities[id];
        delete this.last_processed_input[id];

        message.id = id;
        console.log(`client #${id} disconnected, clients: ${sizeOfObject(this.clients)}`);

        break;
      }
    }

    this.broadcast(objectToBuffer(message));
  }

  broadcast(buffer) {
    for (const id in this.clients) this.clients[id].sendTcp(buffer);
  }
}

module.exports = TcpServer;