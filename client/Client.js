class Client {
  setTcpSocket(socket) {
    this.tcpSocket = socket;
  }

  setUdpServer(server) {
    this.udpServer = server;
  }

  setUdpRemotePort(port) {
    this.udpRemotePort = port;
  }

  sendTcp(buffer) {
    this.tcpSocket.write(buffer);
  }

  sendUdp(buffer) {
    this.udpServer.send(buffer, this.udpRemotePort, this.tcpSocket.remoteAddress);
  }
}

module.exports = Client;