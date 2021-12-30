const { MessageEmbed } = require("discord.js"),
    colors = require("../../config/embedcolors"),
    { Game } = require('../../handlers/games/minesapi'),
    { convertXp } = require("../../utils/xpUtils"),
    db = require('../../utils/databaseDriver');

module.exports = {
    name: "minesweeper",
    aliases: ["mines", "ms"],
    category: "games",
    shortdescription: "Try to discover all the mines without blowing up!",
    description: "Try to discover all tiles under which there's bombs, each tile you open will show you how many bombs are around it around it,",
    ussage: "minesweeper",
    reqperms: [],
    run: async (message, args, prefix) => {
        let game = new Game(),
            start = Date.now(),
            genEmbed = () => {return new MessageEmbed().setColor(colors.info).setAuthor({name: "Minesweeper", iconURL: message.author.displayAvatarURL()}).addField("Board", game.render())},
            gameMsg = await message.channel.send({embeds: [genEmbed().setDescription(`To open a tile write the tile coordinate in chat.\nTo flag it, add F to the coordinate.\n\`Ex. C4F\`\n\nYou can use \`end\` to end the game now.`)]}),
            responseRegex = /^[A-I][1-9]F?|^end$/mi,
            filter = (m) => m.author.id == message.author.id && m.content.match(responseRegex),
            collector = message.channel.createMessageCollector({filter, idle: 60000})

        collector.on("collect", m => {
            m.delete().catch(e => {console.log(e)})
            if (m.content.toLowerCase() == "end") return collector.stop()

            let controls = m.content.match(responseRegex)[0].toLowerCase()

            let x = controls.charCodeAt(0) - 97,
                y = parseInt(controls.charAt(1)) - 1

            if (x > game.board.data?.[0].length || y > game.board.data.length) return;

            if (controls.length == 3) {
                game.flag(x,y)
            } else game.open(x,y)

            if (!game.state.ongoing) return collector.stop();

            gameMsg.edit({embeds: [genEmbed().setDescription(`To open a tile write the tile coordinate in chat.\nTo flag it, add F to the coordinate.\n\`Ex. C4F\`\n\nYou can use \`end\` to end the game now.`)]})
        })

        collector.on("end", async () => {
            let timeElapsed = Math.round((Date.now() - start) /60 /1000),
                bombsFlagged = 0,
                tilesOpen = 0

            for (let y = 0; y < game.board.data.length; y++) {
                for (let x = 0; x < game.board.data[y].length; x++) {
                    if (game.state.win) {
                        tilesOpen++
                        if (game.board.data[y][x].isMine) bombsFlagged++
                    } else {
                        if (!game.board.data[y][x].isMine && game.board.data[y][x].isOpen) tilesOpen++
                    
                        if (game.board.data[y][x].isMine && game.board.data[y][x].isFlagged) bombsFlagged++
                    }
                }
            }

            let xpGot = Math.round(timeElapsed * 10 + tilesOpen/49 * (bombsFlagged + 5) * 5),
                xp = await db.get(`users`, message.author.id, `xp`) ?? 0,
                oldLevel = convertXp(xp).level,
                newLevel = convertXp(xp + xpGot).level
            
            if (xpGot) db.add(`users`, message.author.id, `xp`, xpGot);

            gameMsg.edit({embeds: [genEmbed().setColor(game.state.win ? colors.win : colors.error)
                .setDescription(`Game ended, you ${game.state.win ? `won` : `lost`}. **+${xpGot}xp**\n${game.state.win ? `You found all the bombs!` : game.state.ongoing ? `Game stopped` : `You dug a bomb.`}${newLevel != oldLevel ? `\n\n**Level up!** You're now level ${newLevel}!` : ``}`)]})
        })
    }
}