require("dotenv").config();
const { TOKEN, OWNER } = process.env;
const { CommandoClient } = require("discord.js-commando");
const stats = require("./lib/stats");
const path = require("path");

const client = new CommandoClient({
  commandPrefix: "mcs!",
  owner: OWNER,
});
stats.setClient(client);
// register commands
client.registry
  .registerDefaultTypes()
  .registerGroups([["main", "General"]])
  .registerDefaultGroups()
  .registerDefaultCommands()
  .registerCommandsIn(path.join(__dirname, "commands"));

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}! (${client.user.id})`);
  client.user.setActivity("minecraft");
  stats.refreshStats();
  setInterval(stats.refreshStats, 30000);
});

client.on("error", console.error);
client.login(TOKEN);
