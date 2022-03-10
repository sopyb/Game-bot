const { MessageEmbed } = require("discord.js");
const colors = require("../../config/embedcolors.json");

module.exports = {
  name: "ping",
  category: "info",
  shortdescription: "Ping! Pong!",
  description: "Check bot's latency to discord's API.",
  usage: "ping",
  run: function (message, args) {
    let embed = new MessageEmbed()
      .setAuthor({ name: "Ping", iconURL: message.author.displayAvatarURL() })
      .setColor(colors.info)
      .setDescription("Pinging...");
    message.channel.send({ embeds: [embed] }).then((msg) => {
      embed = new MessageEmbed()
        .setAuthor({ name: "Ping", iconURL: message.author.displayAvatarURL() })
        .setColor(colors.success)
        .setDescription(
          `Pong! That took ${Date.now() - message.createdTimestamp}ms.`
        );
      msg.edit({ embeds: [embed] });
    });
  },
};
