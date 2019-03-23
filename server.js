const config = require('./config');
const UdpServer = require('./udpServer/UdpServer');
const TcpServer = require('./tcpServer/TcpServer');

const clients = {};
const entities = {};
const last_processed_input = {};

const udp_server = new UdpServer(config.udp_port, clients, entities, last_processed_input);
const tcp_server = new TcpServer(config.tcp_port, clients, entities, last_processed_input);

udp_server.startServer(20);
tcp_server.startServer(udp_server);