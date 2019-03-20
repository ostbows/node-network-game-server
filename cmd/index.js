const actions = {
  move: 0
};

const move = (action, buffer) => {
  const client_id = buffer.readUInt8(1);
  const input_number = buffer.readUInt16LE(2);
  const press_time = buffer.readFloatLE(4);

  return {
    action,
    client_id,
    input_number,
    press_time
  };
};

exports.actions = actions;

exports.parse = buffer => {
  const action = buffer.readUInt8(0);

  switch (action) {
    case actions.move:
      return move(action, buffer);
  }

  return null;
};