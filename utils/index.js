exports.bufferToObject = buffer => JSON.parse(buffer.toString().replace(/\0/g, ''));
exports.objectToBuffer = obj => Buffer.from(JSON.stringify(obj));
exports.sizeOfObject = obj => Object.keys(obj).length;