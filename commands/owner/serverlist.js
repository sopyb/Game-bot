const { MessageEmbed } = require("discord.js");
const colors = require("../../config/embedcolors.json");

module.exports = {
  name: "serverlist",
  run: async (message, args) => {
    if (!client.config.ownerID.includes(message.author.id)) {
      return message.channel.send(
        "You might be a high level wizzard but you can't still use this spell."
      );
    }
    const servers = client.guilds.cache;

    const embedArray = new Array();
    const pageamount = Math.ceil(servers.size / 10);
    for (let i = 0; i < pageamount; i++) {
      let fieldtext = "";
      const embed = new MessageEmbed()
        .setTitle("Servers list:")
        .setColor(colors.info);
      for (let j = i * 10; j < servers.size && j < (i + 1) * 10; j++) {
        if (j < (i + 1) * 10) {
          const server = Array.from(servers)[j][1];
          fieldtext = fieldtext + `${server.name} - \*\*\(${server.id}\)\*\*\n`;
        }
      }
      embed.addField(`Page(${i + 1}\/${pageamount})`, fieldtext);
      embedArray.push(embed);
    }

    if (pageamount > 1) {
      // saves embed msg
      let cpage = 0;
      const reactmsg = await message.channel.send({
        embeds: [embedArray[cpage]],
      });

      // adds reactions to the embed
      reactmsg.react("⏪");
      reactmsg.react("◀️");
      reactmsg.react("⏹️");
      reactmsg.react("▶️");
      reactmsg.react("⏩");
      reactmsg.react("🔢");

      // creates reactions colector
      const filter = (reaction, user) => {
        return user.id === message.author.id;
      };
      const reactcollector = reactmsg.createReactionCollector(filter, {
        idle: 60000,
        dispose: true,
      });

      reactcollector.on("collect", (reaction, user) => {
        // First page
        if (reaction.emoji.name === "⏪") {
          cpage = 0;
          reactmsg.edit({ embeds: [embedArray[cpage]] });
        }

        // Last page
        if (reaction.emoji.name === "◀️") {
          if (cpage != 0) {
            cpage += -1;
            reactmsg.edit({ embeds: [embedArray[cpage]] });
          }
        }

        // Stop
        if (reaction.emoji.name === "⏹️") {
          reactcollector.stop();
        }

        // Next page
        if (reaction.emoji.name === "▶️") {
          if (cpage != embedArray.length - 1) {
            cpage += 1;
            reactmsg.edit({ embeds: [embedArray[cpage]] });
          }
        }

        // Last page
        if (reaction.emoji.name === "⏩") {
          cpage = embedArray.length - 1;
          reactmsg.edit({ embeds: [embedArray[cpage]] });
        }

        // Go to page
        if (reaction.emoji.name === "🔢") {
          // Request message
          reactmsg.channel
            .send("Write the numer of the page you want jump to.")
            .then((msg) => {
              msg.delete({ timeout: 10000 });
            });

          // Await message
          message.channel
            .awaitMessages((m) => m.author === message.author, {
              max: 1,
              time: 30000,
              errors: ["time"],
            })
            .then((collected) => {
              // check if value collected is valid
              if (
                parseInt(collected.first().content) > 0 &&
                parseInt(collected.first().content) <= embedArray.length
              ) {
                cpage = parseInt(collected.first().content) - 1;
                reactmsg.edit({ embeds: [embedArray[cpage]] });
              } else {
                message.channel
                  .send(`\`${collected.first().content}\` is not a valid page!`)
                  .then((msg) => {
                    msg.delete({ timeout: 5000 });
                  });
              }
              collected.first().delete({ timeout: 250 });
            })
            .catch((collected) => {
              message.channel
                .send("Timed out after no response in 15s.")
                .then((msg) => {
                  msg.delete({ timeout: 5000 });
                });
            });
        }

        // Clear user reaction
        reaction.users.remove(user.id);
      });

      reactcollector.on("end", (collected) => {
        reactmsg.reactions.removeAll();
      });
    } else {
      message.channel.send({ embeds: [embedArray[0]] });
    }
  },
};
