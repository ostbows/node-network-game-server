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
    if (this.tcpSocket) this.tcpSocket.write(buffer);
  }

  sendUdp(buffer) {
    if (this.udpServer && this.udpRemotePort && this.tcpSocket.remoteAddress) {
      this.udpServer.send(buffer, this.udpRemotePort, this.tcpSocket.remoteAddress);
    }
  }
}

module.exports = Client;