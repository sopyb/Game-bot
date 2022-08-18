const { Game } = require('../../handlers/games/2048api'), // just 22h working on the api :O
    { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js'),
    colors = require('../../config/embedcolors.json'),
    { convertXp } = require('../../utils/xpUtils'),
    db = require('../../utils/databaseDriver');

module.exports = {
    name: "2048",
    category: "games",
    shortdescription: "Join the numbers and get to the 2048 tile!",
    description: "Join the numbers and get to the 2048 tile!\n\_\_\*\*Playing on a mobile device is advised for the best experience.\*\*\_\_\n\nUse the arrow reactions move the tiles. Tiles with the same number merge into one when they touch. Add them up to reach 2048 and beyond!",
    usage: "2048",
    run: async function(message, args) {
        let game = new Game(),
            start = Date.now(),
            components = [
                new MessageActionRow().addComponents(
                    new MessageButton().setStyle("SECONDARY").setCustomId('blank1').setLabel(" ").setDisabled(true),
                    new MessageButton().setStyle("PRIMARY").setCustomId('up').setLabel("\u2191"),
                    new MessageButton().setStyle("SECONDARY").setCustomId('blank2').setLabel(" ").setDisabled(true)),
                new MessageActionRow().addComponents(
                    new MessageButton().setStyle("PRIMARY").setCustomId('left').setLabel("\u2190"),
                    new MessageButton().setStyle("DANGER").setCustomId('end').setLabel("\u270b"),
                    new MessageButton().setStyle("PRIMARY").setCustomId('right').setLabel("\u2192")),
                new MessageActionRow().addComponents(
                    new MessageButton().setStyle("SECONDARY").setCustomId('blank4').setLabel(" ").setDisabled(true),
                    new MessageButton().setStyle("PRIMARY").setCustomId('down').setLabel("\u2193"),
                    new MessageButton().setStyle("SECONDARY").setCustomId('blank3').setLabel(" ").setDisabled(true))
            ],
            genEmbed = () => {return new MessageEmbed().setColor(colors.info).setAuthor({name: `${message.member.displayName}'s 2048! game`, iconURL: message.author.displayAvatarURL()}). setDescription(`**Score: ${game.board.score}**`)},
            gameMsg = await message.channel.send({components, content: game.render(), embeds: [genEmbed()]}),
            filter = (i) => i.isButton(),
            collector = gameMsg.createMessageComponentCollector({filter, idle: 60000});

        collector.on('collect', i => {
            if (i.user.id != message.author.id) return i.reply({content: "You can't mess with other people's game... Meanie >:(", ephemeral: true});
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
                    collector.stop()
                    break;
            }
            gameMsg.edit({content: game.render(), embeds: [genEmbed().setColor(game.board.won ? colors.win : colors.info)]});
            i.deferUpdate()

            if (!game.state.ongoing) collector.stop()
        })

        collector.on('end', async () => {
            let timeElapsed = Math.round((Date.now() - start) /60 /1000),
                xpGot = Math.floor(timeElapsed * 10 + game.board.topTile/16 * Math.pow(2, game.board.score.toString().length - 3)),
                cacheXp = await db.get(`users`, message.author.id, `xp`) ?? 0,
                oldLevel = convertXp(cacheXp).level,
                newLevel = convertXp(cacheXp + xpGot).level

            if (xpGot) db.add(`users`, message.author.id, `xp`, xpGot);

            gameMsg.edit({content: game.render(), components: [], embeds: [genEmbed().setColor(game.state.win ? colors.win : colors.error)
                .setDescription(`**Score: ${game.board.score}**\n\nGame ended, you ${game.state.win ? `won` : `lost`}. **+${xpGot}xp**\n${game.state.ongoing ? `Game was ended by an external event` : `No moves left.`}${newLevel != oldLevel ? `\n\n**Level up!** You're now level ${newLevel}!` : ``}`)]})
        })
    }
}