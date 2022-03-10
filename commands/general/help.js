const { MessageEmbed } = require("discord.js");
const colors = require("../../config/embedcolors.json");

// Thank you stack overflow user
function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

module.exports = {
  name: "help",
  category: "info",
  shortdescription: "Provides info about commands.",
  description: "Check all commands avalaible and info about each of them.",
  usage: "help [command]",
  run: function (message, args, prefix) {
    const categories = client.commands
      .map((k) => k.category)
      .filter(onlyUnique);
    const commands = (category) => {
      return client.commands
        .filter((k) => k.category === category)
        .map(
          (k) =>
            `\`${k.name}\` - ${
              k.shortdescription || "No short description. :("
            }`
        )
        .sort()
        .join("\n");
    };

    // if first argument is a valid category
    if (!args[0]) args.push("");
    if (client.commands.has(args[0].toLowerCase())) {
      const command = client.commands.get(args[0].toLowerCase());
      const embed = new MessageEmbed()
        .setAuthor({
          name: command.name.charAt(0).toUpperCase() + command.name.slice(1),
          iconURL: message.author.displayAvatarURL(),
        })
        .setColor(colors.info)
        .setDescription(command.description || "No description :c")
        .addField(
          `Ussage: ${prefix + command.usage || "🤷 not documented."}`,
          `Category: ${command.category}`
        )
        .setFooter(
          "Arguments in [] are optional while arguments in () are mandatory",
          client.user.displayAvatarURL()
        );
      message.channel.send({ embeds: [embed] });
    } else {
      const embed = new MessageEmbed()
        .setAuthor({
          name: "Help menu",
          iconURL: message.author.displayAvatarURL(),
        })
        .setColor(colors.info)
        .setDescription(
          `Use ${prefix}help [command] to see more info on all the commands`
        )
        .setFooter("Requested:", client.user.displayAvatarURL())
        .setTimestamp(Date.now());
      for (const category of categories) {
        if (!category) continue;
        embed.addField(
          category.charAt(0).toUpperCase() + category.slice(1),
          commands(category)
        );
      }
      message.channel.send({ embeds: [embed] });
    }
  },
};
