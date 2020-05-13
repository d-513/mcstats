const { Command } = require("discord.js-commando");
const stats = require("../../lib/stats");
const db = require("../../lib/db");
const { ping } = require("../../lib/protocol");
const { escape } = require("sqlstring");
module.exports = class NewCommand extends Command {
  constructor(client) {
    super(client, {
      name: "new",
      aliases: ["newstatchannel"],
      group: "main",
      memberName: "new",
      description: "Creates a new stat channel.",
      userPermissions: ["MANAGE_CHANNELS"],
      examples: [
        "mcs!new 670916724354449412 mc.hypixel.net 25565",
        "mcs!new 670916724354449412 hypixel.net",
      ],
      guildOnly: true,
      args: [
        {
          key: "vc",
          prompt:
            "Please provide a channel ID (https://support.discordapp.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-)",
          type: "string",
        },
        {
          key: "host",
          prompt: "Please provide a minecraft server host",
          type: "string",
        },
        {
          key: "port",
          prompt: "Please provide a minecraft server port",
          type: "integer",
          default: false,
        },
      ],
    });
  }
  async run(message, { vc, host, port }) {
    let msg = await message.say(
      "Setting up stats for this channel, please wait..."
    );
    try {
      const alreadyExists = stats.getChannel(vc);
      if (alreadyExists)
        throw "This channel has already configured statistics.";

      const channel = message.guild.channels.cache.find(
        (channel) => channel.id === vc && channel.type === "voice"
      );
      if (!channel)
        throw `Invalid channel id: \`${vc}\`. Make sure it's a voice channel.`;

      const server = await ping({ host, port });
      if (!server.players) {
        throw "This server has an incorrect packet format";
      }
      db.prepare(
        `INSERT INTO stats (SERVER, CHANNEL, MCSERVERHOST, MCSERVERPORT) VALUES (${escape(
          message.guild.id
        )}, ${escape(vc)}, ${escape(host)}, ${escape(port)})`
      ).run();
      stats.refreshStats();
      return await msg.edit("Successfully added channel to the database");
    } catch (err) {
      console.log(err);
      return await msg.edit(`Error: ${err}`);
    }
  }
};
