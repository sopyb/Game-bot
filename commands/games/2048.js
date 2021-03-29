const { Game } = require('../../handlers/games/2048api'), // just 17h working on the api :O
    { MessageEmbed } = require('discord.js'),
    colors = require('../../config/embedcolors.json');

function render(board) {
    let render = ""
    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[y].length; x++) {
            render += (`${board[y][x]} `)
        }
        render += "\n"
    }
    return render;
}

module.exports = {
    name: "2048",
    category: "games",
    shortdescription: "Join the numbers and get to the 2048 tile!",
    description: undefined,
    ussage: "2048",
    run: async function(message, args) {
        // defining functions and nicknaming functions
        let gameobj = new Game();

        let embedmsg = new MessageEmbed().setColor(colors.info).setTitle("2048").setDescription(`You can use 🛑 to end the game now.`).addField(`Score: 0`, render(gameobj.getData().board));
        let gamemsg = await message.channel.send(`${message.author}'s game`, {embed: embedmsg});

        let reactions = ["⬅️", "⬆️", "⬇️", "➡️", "🛑"]
        for (reaction of reactions) {
            gamemsg.react(reaction)
        }

        let filter = (react, user) => {
            return reactions.includes(react.emoji.name) && user === message.author
        }

        let collector = gamemsg.createReactionCollector(filter, {idle: 60000, errors: ['time']})

        let lockreaction = false;
        collector.on('collect', (reaction, user) => {
            reaction.users.remove(user.id)

            if (lockreaction) return;
            lockreaction=true;

            switch (reaction.emoji.name) {
                case "⬅️":
                    gameobj.moveLeft();
                    break;
                case "⬆️":
                    gameobj.moveUp();
                    break;
                case "⬇️":
                    gameobj.moveDown();
                    break;
                case "➡️":
                    gameobj.moveRight();
                    break;
                case "🛑":
                    collector.stop()
                    gameobj.state.ongoing = false
                    break;
            }
            let gamedata = gameobj.getData()
            if(gamedata.state.ongoing) {
                embedmsg = new MessageEmbed().setColor(gamedata.state.won ? colors.win : colors.info).setTitle("2048").setDescription(`${gamedata.state.won ? `You won the game, but you can keep on going.\n` : ``}You can use 🛑 to end the game now.`).addField(`Score: ${gamedata.score}`, render(gameobj.getData().board));
                gamemsg.edit(`${message.author}'s game`, {embed: embedmsg});
            } else {
                embedmsg = new MessageEmbed().setColor(gamedata.state.won ? colors.win : colors.error).setTitle("2048").setDescription(`Game ended, ${gamedata.state.won ? `you won` : `you lost`}.\nReason: ${Object.keys(gameobj.allowedMoves).map(k => gameobj.allowedMoves[k]).filter(k => k === true).length != 0 ? `Force stopped` : `No moves left`}.`).addField(`Final score: ${gamedata.score}`, render(gameobj.getData().board));
                gamemsg.edit(`${message.author}'s game`, {embed: embedmsg});
                collector.stop()
            }
            lockreaction = false;
        })

        collector.on('end', () => {
            gamemsg.reactions.removeAll();
            if (gameobj.state.ongoing) {
                embedmsg = new MessageEmbed().setColor(gamedata.state.won ? colors.win : colors.error).setTitle("2048").setDescription(`Game ended, ${gamedata.state.won ? `you won` : `you lost`}.\nReason: Game timed out.`).addField(`Final score: ${gamedata.score}`, render(gameobj.getData().board));
            }
        })
    }
}