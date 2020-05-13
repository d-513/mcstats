const { Command } = require("discord.js-commando");
const stats = require("../../lib/stats");
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
          type: "string",
        },
      ],
    });
  }
  async run(message, { vc }) {
    const msg = await message.say("Deleting this stat channel, please wait");
    try {
      const exists = stats.getChannel(vc);
      if (!exists) throw "This channel doesn't have configured statistics.";
      if (exists.SERVER !== message.guild.id)
        throw "You need to execute this command in the guild with this channel";
      stats.deleteStat(vc);
      stats.refreshStats();
      return await msg.edit("Successfully deleted stats from this channel");
    } catch (err) {
      return await msg.edit(`Error: ${err}`);
    }
  }
};
