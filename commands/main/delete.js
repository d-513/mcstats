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
module.exports = class DeleteCommand extends Command {
  constructor(client) {
    super(client, {
      name: "delete",
      aliases: ["deletestatchannel"],
      group: "main",
      memberName: "delete",
      description: "Deletes a stat channel.",
      examples: ["mcs!delete 1038746592843"],
      guildOnly: true,
      args: [
        {
          key: "vc",
          prompt:
            "Please provide a stat channel ID to delete (https://support.discordapp.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-)",
          type: "string"
        }
      ]
    });
  }
  async run(message, { vc }) {
    let msg = await message.say("Deleting this stat channel, please wait");
    try {
      const db = await dbPromise;
      const exists = await db.get(
        `SELECT * FROM stats WHERE CHANNEL=${escape(vc)}`
      );
      if (!exists) {
        throw "This channel doesn't have configured statistics.";
      }
      if (exists.SERVER !== message.guild.id) {
        throw "You need to execute this command in the guild with this channel";
      }
      await db.run(`DELETE FROM stats WHERE channel=${escape(vc)}`);
      refreshStats();
      return await msg.edit("Successfully deleted stats from this channel");
    } catch (err) {
      return await msg.edit(`Error: ${err}`);
    }
  }
};
