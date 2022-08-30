const { MessageEmbed } = require("discord.js");
const colors = require("../../config/embedcolors");
const { Game } = require("../../handlers/games/minesapi");
const { convertXp } = require("../../utils/xpUtils");
const db = require("../../utils/databaseDriver");

module.exports = {
  name: "minesweeper",
  aliases: ["mines", "ms"],
  category: "games",
  shortdescription: "Try to discover all the mines without blowing up!",
  description:
    "Try to discover all tiles under which there's bombs, each tile you open will show you how many bombs are around it around it,",
  usage: "minesweeper",
  reqperms: [],
  run: async (message, args, prefix) => {
    const game = new Game();
    const start = Date.now();
    const genEmbed = () => {
      return new MessageEmbed()
        .setColor(colors.info)
        .setAuthor({
          name: "Minesweeper",
          iconURL: message.author.displayAvatarURL(),
        })
        .addField("Board", game.render());
    };
    const gameMsg = await message.channel.send({
      content: `${message.author}'s game`,
      embeds: [
        genEmbed().setDescription(
          "To open a tile write the tile coordinate in chat.\nTo flag it, add F to the coordinate.\n`Ex. C4F`\n\nYou can use `end` to end the game now."
        ),
      ],
    });
    const responseRegex = /^[A-I][1-9]F?|^end$/im;
    const filter = (m) =>
      m.author.id == message.author.id && m.content.match(responseRegex);
    const collector = message.channel.createMessageCollector({
      filter,
      idle: 60000,
    });

    collector.on("collect", (m) => {
      m.delete().catch((e) => {
        console.log(e);
      });
      if (m.content.toLowerCase() == "end") return collector.stop();

      const controls = m.content.match(responseRegex)[0].toLowerCase();

      const x = controls.charCodeAt(0) - 97;
      const y = parseInt(controls.charAt(1)) - 1;

      if (x < 1 || y < 1) return;

      if (x > game.board.data?.[0].length || y > game.board.data.length) return;

      if (controls.length == 3) {
        game.flag(x, y);
      } else game.open(x, y);

      if (!game.state.ongoing) return collector.stop();

      gameMsg.edit({
        content: `${message.author}'s game`,
        embeds: [
          genEmbed().setDescription(
            "To open a tile write the tile coordinate in chat.\nTo flag it, add F to the coordinate.\n`Ex. C4F`\n\nYou can use `end` to end the game now."
          ),
        ],
      });
    });

    collector.on("end", async () => {
      const timeElapsed = Math.round((Date.now() - start) / 60 / 1000);
      let bombsFlagged = 0;
      let tilesOpen = 0;

      for (let y = 0; y < game.board.data.length; y++) {
        for (let x = 0; x < game.board.data[y].length; x++) {
          if (game.state.win) {
            tilesOpen++;
            if (game.board.data[y][x].isMine) bombsFlagged++;
          } else {
            if (!game.board.data[y][x].isMine && game.board.data[y][x].isOpen) {
              tilesOpen++;
            }

            if (
              game.board.data[y][x].isMine &&
              game.board.data[y][x].isFlagged
            ) {
              bombsFlagged++;
            }
          }
        }
      }

      const xpGot = Math.round(
        timeElapsed * 10 + (tilesOpen / 49) * (bombsFlagged + 5) * 5
      );
      const xp = (await db.get("users", message.author.id, "xp")) ?? 0;
      const oldLevel = convertXp(xp).level;
      const newLevel = convertXp(xp + xpGot).level;

      if (xpGot) db.add("users", message.author.id, "xp", xpGot);

      gameMsg.edit({
        content: `${message.author}'s game`,
        embeds: [
          genEmbed()
            .setColor(game.state.win ? colors.win : colors.error)
            .setDescription(
              `Game ended, you ${
                game.state.win ? "won" : "lost"
              }. **+${xpGot}xp**\n${
                game.state.win
                  ? "You found all the bombs!"
                  : game.state.ongoing
                  ? "Game stopped"
                  : "You dug a bomb."
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
