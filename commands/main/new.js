const { Command } = require("discord.js-commando");
("pinging");
const { ping } = require("minecraft-protocol");
const { removeColors, parseMotd } = require("mc-motd-transform");
("sqlite stuff");
const { escape } = require("sqlstring");
const { Promise } = require("bluebird");
const { open } = require("sqlite");
const dbPromise = open("./db.sqlite", { Promise });
("the command");
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
        "mcs!new 670916724354449412 hypixel.net"
      ],
      guildOnly: true,
      args: [
        {
          key: "vc",
          prompt:
            "Please provide a channel ID (https://support.discordapp.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-)",
          type: "string"
        },
        {
          key: "host",
          prompt: "Please provide a minecraft server host",
          type: "string"
        },
        {
          key: "port",
          prompt: "Please provide a minecraft server port",
          type: "integer",
          default: false
        }
      ]
    });
  }
  async run(message, { vc, host, port }) {
    let msg = await message.say(
      "Setting up stats for this channel, please wait..."
    );
    try {
      const db = await dbPromise;
      const alreadyExists = await db.get(
        `SELECT * FROM stats WHERE CHANNEL=${escape(vc)}`
      );
      if (alreadyExists) {
        throw "This channel has already configured statistics.";
      }
      const channel = message.guild.channels.cache.find(
        channel => channel.id === vc && channel.type === "voice"
      );
      if (!channel) {
        throw `Invalid channel id: \`${vc}\`. Make sure it's a voice channel.`;
      }
      const server = await ping({ host, port });
      if (!server.players) {
        throw "This server has incorrect packet format";
      }
      await msg.edit(`Server found: \n\`${removeColors(parseMotd(server))}\``);
      await db.run(
        `INSERT INTO stats (SERVER, CHANNEL, MCSERVERHOST, MCSERVERPORT) VALUES (${escape(
          message.guild.id
        )}, ${escape(vc)}, ${escape(host)}, ${escape(port)})`
      );
      refreshStats();
      return await msg.edit("Successfully added channel to the database");
    } catch (err) {
      return await msg.edit(`Error: ${err}`);
    }
  }
};
