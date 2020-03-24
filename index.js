require("dotenv").config();
const { token, owner } = process.env;
const { CommandoClient } = require("discord.js-commando");
const path = require("path");

("pinging");
const { ping } = require("minecraft-protocol");

("sqlite stuff");
const { Promise } = require("bluebird");
const { open } = require("sqlite");
const dbPromise = open("./db.sqlite", { Promise });

("define client");
const client = new CommandoClient({
  commandPrefix: "mcs!",
  owner: owner
});
("refresh stats");
global.refreshStats = async () => {
  const db = await dbPromise;
  const servers = await db.all("SELECT * FROM stats");
  servers.forEach(async server => {
    try {
      const guild = client.guilds.cache.get(server.SERVER);
      if (!guild) {
        return await db.run(`DELETE FROM stats WHERE id=${server.ID}`);
      }
      const channel = guild.channels.cache.get(server.CHANNEL);
      if (!channel) {
        return await db.run(`DELETE FROM stats WHERE id=${server.ID}`);
      }
      try {
        const pingResults = await ping({
          host: server.MCSERVERHOST,
          port: server.MCSERVERPORT
        });
        return await channel.setName(
          `${pingResults.players.online}/${pingResults.players.max}`,
          "Stat refresh scheulder"
        );
      } catch (e) {
        return await channel.setName("OFFLINE", "Stat refresh scheulder");
      }
    } catch (e) {}
  });
};

("register commands");
client.registry
  .registerDefaultTypes()
  .registerGroups([["main", "General"]])
  .registerDefaultGroups()
  .registerDefaultCommands()
  .registerCommandsIn(path.join(__dirname, "commands"));

("log when ready");
client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
  client.user.setActivity("minecraft");
  refreshStats();
  setInterval(refreshStats, 30000);
});

("catch possible errors");
client.on("error", console.error);
("Login to discord");
client.login(token);
