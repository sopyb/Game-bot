const { Game } = require("../../handlers/games/2048api"); // just 22h working on the api :O
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const colors = require("../../config/embedcolors.json");
const { convertXp } = require("../../utils/xpUtils");
const db = require("../../utils/databaseDriver");

module.exports = {
  name: "2048",
  category: "games",
  shortdescription: "Join the numbers and get to the 2048 tile!",
  description:
    "Join the numbers and get to the 2048 tile!\n__**Playing on a mobile device is advised for the best experience.**__\n\nUse the arrow reactions move the tiles. Tiles with the same number merge into one when they touch. Add them up to reach 2048 and beyond!",
  usage: "2048",
  run: async function (message, args) {
    const game = new Game();
    const start = Date.now();
    const components = [
      new MessageActionRow().addComponents(
        new MessageButton()
          .setStyle("SECONDARY")
          .setCustomId("blank1")
          .setLabel(" ")
          .setDisabled(true),
        new MessageButton()
          .setStyle("PRIMARY")
          .setCustomId("up")
          .setLabel("\u2191"),
        new MessageButton()
          .setStyle("SECONDARY")
          .setCustomId("blank2")
          .setLabel(" ")
          .setDisabled(true)
      ),
      new MessageActionRow().addComponents(
        new MessageButton()
          .setStyle("PRIMARY")
          .setCustomId("left")
          .setLabel("\u2190"),
        new MessageButton()
          .setStyle("DANGER")
          .setCustomId("end")
          .setLabel("\u270b"),
        new MessageButton()
          .setStyle("PRIMARY")
          .setCustomId("right")
          .setLabel("\u2192")
      ),
      new MessageActionRow().addComponents(
        new MessageButton()
          .setStyle("SECONDARY")
          .setCustomId("blank4")
          .setLabel(" ")
          .setDisabled(true),
        new MessageButton()
          .setStyle("PRIMARY")
          .setCustomId("down")
          .setLabel("\u2193"),
        new MessageButton()
          .setStyle("SECONDARY")
          .setCustomId("blank3")
          .setLabel(" ")
          .setDisabled(true)
      ),
    ];
    const genEmbed = () => {
      return new MessageEmbed()
        .setColor(colors.info)
        .setAuthor({
          name: `${message.member.displayName}'s 2048! game`,
          iconURL: message.author.displayAvatarURL(),
        })
        .setDescription(`**Score: ${game.board.score}**`);
    };
    const gameMsg = await message.channel.send({
      components,
      content: game.render(),
      embeds: [genEmbed()],
    });
    const filter = (i) => i.isButton();
    const collector = gameMsg.createMessageComponentCollector({
      filter,
      idle: 60000,
    });

    collector.on("collect", (i) => {
      if (i.user.id != message.author.id) {
        return i.reply({
          content: "You can't mess with other people's game... Meanie >:(",
          ephemeral: true,
        });
      }
      switch (i.customId) {
        case "left":
          game.moveLeft();
          break;
        case "up":
          game.moveUp();
          break;
        case "down":
          game.moveDown();
          break;
        case "right":
          game.moveRight();
          break;
        case "end":
          collector.stop();
          break;
      }
      gameMsg.edit({
        content: game.render(),
        embeds: [
          genEmbed().setColor(game.board.won ? colors.win : colors.info),
        ],
      });
      i.deferUpdate();

      if (!game.state.ongoing) collector.stop();
    });

    collector.on("end", async () => {
      const timeElapsed = Math.round((Date.now() - start) / 60 / 1000);
      const xpGot = Math.floor(
        timeElapsed * 10 +
          (game.board.topTile / 16) *
            Math.pow(2, game.board.score.toString().length - 3)
      );
      const cacheXp = (await db.get("users", message.author.id, "xp")) ?? 0;
      const oldLevel = convertXp(cacheXp).level;
      const newLevel = convertXp(cacheXp + xpGot).level;

      if (xpGot) db.add("users", message.author.id, "xp", xpGot);

      gameMsg.edit({
        content: game.render(),
        components: [],
        embeds: [
          genEmbed()
            .setColor(game.state.win ? colors.win : colors.error)
            .setDescription(
              `**Score: ${game.board.score}**\n\nGame ended, you ${
                game.state.win ? "won" : "lost"
              }. **+${xpGot}xp**\n${
                game.state.ongoing
                  ? "Game was ended by an external event"
                  : "No moves left."
              }${
                newLevel != oldLevel
                  ? `\n\n**Level up!** You're now level ${newLevel}!`
                  : ""
              }`
            ),
        ],
      });
    });
  },
};
