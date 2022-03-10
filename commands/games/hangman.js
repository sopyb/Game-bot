const { Game } = require("../../handlers/games/hangmanapi");
const colors = require("../../config/embedcolors");
const { MessageEmbed } = require("discord.js");
const { convertXp } = require("../../utils/xpUtils");
const db = require("../../utils/databaseDriver");

module.exports = {
  name: "hangman",
  aliases: [],
  category: "games",
  cooldown: 5,
  shortdescription: "Guess the word to not be hanged",
  description:
    "Attempt to build the missing word by guessing one letter at a time. The game is won if the player correctly identifies the missing word without making more than 6 wrong guesses",
  usage: "hangman",
  reqperms: [],
  run: async (message, args, prefix) => {
    const game = new Game();
    const start = Date.now();
    const genEmbed = () => {
      return new MessageEmbed()
        .setColor(colors.info)
        .setAuthor({
          name: "Hangman",
          iconURL: message.author.displayAvatarURL(),
        })
        .addField(
          `Health: ${"❤️".repeat(6 - game.strikeCount)}${"💔".repeat(
            game.strikeCount
          )}`,
          game.render()
        );
    };
    const gameMsg = await message.channel.send({
      content: `${message.author}'s game`,
      embeds: [
        genEmbed().setDescription(
          "Type your guesses in the chat.\n\nYou can use `end` to end the game now."
        ),
      ],
    });
    const responseRegex = new RegExp(
      `^[a-z]$|^${"[a-z]".repeat(game.word.length)}$|^end$`,
      "mi"
    );
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

      game.guess(m.content);
      if (!game.state.ongoing) return collector.stop();

      gameMsg.edit({
        content: `${message.author}'s game`,
        embeds: [
          genEmbed().setDescription(
            "Type your guesses in the chat.\n\nYou can use `end` to end the game now."
          ),
        ],
      });
    });

    collector.on("end", async () => {
      const timeElapsed = Math.round((Date.now() - start) / 60 / 1000);
      let lettersGuessed = 0;

      game.word.split("").forEach((e) => {
        if (game.lettersGuessed.includes(e)) lettersGuessed++;
      });

      const xpGot = Math.round(
        timeElapsed * 10 +
          (game.word.length ** 0.7 * lettersGuessed) / (game.strikeCount + 1)
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
                  ? "You guessed the word correctly!"
                  : game.state.ongoing
                  ? "Game stopped"
                  : "You perished."
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
