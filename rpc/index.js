const { sizeOfObject } = require('../utils');

const actions = {
  world_state: 0,
  disconnected: 1,
  connected: 2
};

exports.getConnected = (client_id, update_rate) => {
  const buffer = Buffer.allocUnsafe(3);
  buffer.writeUInt8(actions.connected, 0);
  buffer.writeUInt8(client_id, 1);
  buffer.writeUInt8(update_rate, 2);
  return buffer;
};

exports.getDisconnected = client_id => {
  const buffer = Buffer.allocUnsafe(2);
  buffer.writeUInt8(actions.disconnected, 0);
  buffer.writeUInt8(client_id, 1);
  return buffer;
};

exports.getWorldState = (entities, last_processed_input) => {
  const buffer_size = 1 + sizeOfObject(entities) * (1 + 4 + 2 + 1);
  const buffer = Buffer.allocUnsafe(buffer_size);

  let i = 0;
  buffer.writeUInt8(actions.world_state, i);

  for (const id in entities) {
    const entity = entities[id];

    i += 1; buffer.writeUInt8(id, i);
    i += 1; buffer.writeFloatLE(entity.x, i);
    i += 4; buffer.writeUInt16LE(last_processed_input[id], i);
    i += 2; buffer.writeInt8(-1, i);
  }

  return buffer;
};