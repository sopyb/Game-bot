const { MessageEmbed } = require("discord.js"),
    colors = require("../../config/embedcolors"),
    { Game } = require('../../handlers/games/minesapi')

module.exports = {
    name: "minesweeper",
    aliases: ["mines", "ms"],
    category: "Games",
    shortdescription: "Try to discover all the mines without blowing up!",
    description: "Try to discover all tiles under which there's bombs, each tile you open will show you how many bombs are around it around it,",
    ussage: "minesweeper",
    reqperms: [],
    run: async function (message, args, prefix) {
        let game = new Game({bombs: 1}),
            embed = new MessageEmbed().setColor(colors.info).setAuthor({name: "Minesweeper", iconURL: message.author.displayAvatarURL()}).addField("Minesweeper board", game.render()),
            gameMsg = await message.channel.send({embeds: [embed]}),
            responseRegex = /^([a-i]|[A-I])[1-9]F?|^stop$/m,
            filter = (m) => m.author.id == message.author.id && m.content.match(responseRegex).length != 0,
            collector = message.channel.createMessageCollector({filter, idle: 60000})

        collector.on("collect", m => {
            if (m.content.toLowerCase() == "stop") collector.stop()

            let controls = m.content.match(responseRegex)[0].toLowerCase()

            let x = controls.charCodeAt(0) - 97,
                y = parseInt(controls.charAt(1)) - 1

            if (x > 7 || y > 7) return;

            if (controls.length == 3) {
                game.flag(x,y)
            } else game.open(x,y)

            if (!game.board.state.ongoing) return collector.stop();

            let embed = new MessageEmbed().setColor(colors.info).setAuthor({name: "Minesweeper", iconURL: message.author.displayAvatarURL()}).addField("Minesweeper board", game.render());
            gameMsg.edit({embeds: [embed]})
        })

        collector.on("end", () => {
            if (game.board.state.ongoing) {
                let embed = new MessageEmbed().setColor(colors.error).setAuthor({name: "Minesweeper", iconURL: message.author.displayAvatarURL()}).addField("Minesweeper board", game.render());
                gameMsg.edit({embeds: [embed]})
            } else if (game.board.state.won) {
                let embed = new MessageEmbed().setColor(colors.win).setAuthor({name: "Minesweeper", iconURL: message.author.displayAvatarURL()}).addField("Minesweeper board", game.render());
                gameMsg.edit({embeds: [embed]})
            } else {
                let embed = new MessageEmbed().setColor(colors.error).setAuthor({name: "Minesweeper", iconURL: message.author.displayAvatarURL()}).addField("Minesweeper board", game.render());
                gameMsg.edit({embeds: [embed]})
            }
        })
    }
}