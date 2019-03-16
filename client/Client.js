class Client {
  constructor() {
    this.debug = false;
  }

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
    if (!this.tcpSocket) return;
    this.tcpSocket.write(buffer);
  }

  sendUdp(buffer) {
    if (!this.udpServer || !this.udpRemotePort || !this.tcpSocket.remoteAddress) return;
    this.udpServer.send(buffer, this.udpRemotePort, this.tcpSocket.remoteAddress);
  }
}

module.exports = Client;