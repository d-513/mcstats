const mc = require("minecraft-protocol");

module.exports.ping = function ping(options) {
  return new Promise((resolve, reject) => {
    mc.ping(options, (err, pingResults) => {
      if (err) reject(err);
      else resolve(pingResults);
    });
  });
};
