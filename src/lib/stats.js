const db = require("./db");
const { ping } = require("./protocol");
const { escape } = require("sqlstring");
let client;
module.exports.setClient = (newClient) => (client = newClient);

function deleteStat(id) {
  return db.prepare(`DELETE FROM stats WHERE id=${id}`).run();
}
function getChannel(vc) {
  return db.prepare(`SELECT * FROM stats WHERE CHANNEL=${escape(vc)}`).get();
}
function refreshStats() {
  const servers = db.prepare("SELECT * FROM stats").all();
  servers.forEach(async (server) => {
    const guild = client.guilds.cache.get(server.SERVER);
    if (!guild) return deleteStat(server.ID);
    const channel = guild.channels.cache.get(server.CHANNEL);
    if (!channel) return deleteStat(server.ID);

    ping({
      host: server.MCSERVERHOST,
      port: server.MCSERVERPORT,
    })
      .then((pingResults) => {
        channel.setName(
          `${pingResults.players.online}/${pingResults.players.max}`,
          "Stat refresh scheulder"
        );
      })
      .catch(() => channel.setName("OFFLINE", "Stat refresh scheulder"));
  });
}

module.exports.refreshStats = refreshStats;
module.exports.deleteStat = deleteStat;
module.exports.getChannel = getChannel;
