// YOU CAN GET THE EMOTES AT 
// https://imgur.com/a/uN2q9at
//
// The command will just display :2048_(tile value): if you don't config the emotes
// to get a emoji id use the emoji and put \ in front of it
// Ex: \:2048: = <:2048_0:826083631771942952>
const emoji = [
    "<:2048_0:826083631771942952>", //empty
    "<:2048_2:826083631587131395>", //2
    "<:2048_4:826083631906160640>", //4
    "<:2048_8:826083632120725585>", //8
    "<:2048_16:826083631998435369>", //16 and so on...
    "<:2048_32:826083632002760735>",
    "<:2048_64:826083632376315984>",
    "<:2048_128:826083631956099074>",
    "<:2048_256:826083632560341002>",
    "<:2048_512:826083632564797451>",
    "<:2048_1024:826083632640425984>",
    "<:2048_2048:826083632636100659>", //2048 - win condition
    "<:2048_4096:826083632799285309>",
    "<:2048_8192:826083632828645396>",
    "<:2048_16384:826083633353850901>",
    "<:2048_32768:826083633387143188>",
    "<:2048_65536:826083633429348383>",
    "<:2048_131072:826084356153278474>" //131072 - maximum possible
]

const { Game } = require('../../handlers/games/2048api'), // just 22h working on the api :O
    { MessageEmbed } = require('discord.js'),
    colors = require('../../config/embedcolors.json');

function render(board) {
    let render = ``
    for (let y = 0; y < board.length; y++) {
        for (let x = 0; x < board[y].length; x++) {
            if(!render) {
                render = (emoji[board[y][x] ? Math.log(board[y][x])/Math.log(2) : 0])
            } else render += (emoji[board[y][x] ? Math.log(board[y][x])/Math.log(2) : 0])
        }
        render += `\n`
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
        let gameobj = new Game({debug: true});

        let embedmsg = new MessageEmbed().setColor(colors.info).setTitle("2048")/*.setDescription(`You can use 🛑 to end the game now.`)*/.addField(`Score: 0`, render(gameobj.getData().board));
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
                    gameobj.board.data = [[2,4,2,4],[4,2,4,2],[2,4,2,4],[4,2,4,0]]
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
                    gameobj.board.ongoing = false
                    break;
            }

            if(gameobj.board.ongoing) {
                embedmsg = new MessageEmbed().setColor(gameobj.board.won ? colors.win : colors.info).setTitle("2048").setDescription(`${gameobj.board.won ? `You won the game, but you can keep on going.\n` : ``}You can use 🛑 to end the game now.`).addField(`Score: ${gameobj.score}`, render(gameobj.getData().board));
                gamemsg.edit(`${message.author}'s game`, {embed: embedmsg});
            } else {
                embedmsg = new MessageEmbed().setColor(gameobj.board.won ? colors.win : colors.error).setTitle("2048").setDescription(`Game ended, ${gameobj.board.won ? `you won` : `you lost`}.\nReason: ${!Object.keys(gameobj.allowedMoves).map(k => gameobj.allowedMoves[k]).includes(true) ? `No moves left` : `Force stopped`}.`).addField(`Final score: ${gameobj.score}`, render(gameobj.getData().board));
                gamemsg.edit(`${message.author}'s game`, {embed: embedmsg});
                collector.stop()
            }
            lockreaction = false;
        })

        collector.on('end', () => {
            gamemsg.reactions.removeAll();
            if (gameobj.board.ongoing) {
                embedmsg = new MessageEmbed().setColor(gameobj.board.won ? colors.win : colors.error).setTitle("2048").setDescription(`Game ended, ${gameobj.board.won ? `you won` : `you lost`}.\nReason: Game timed out.`).addField(`Final score: ${gameobj.score}`, render(gameobj.getData().board));
                gamemsg.edit(`${message.author}'s game`, {embed: embedmsg});
            }
        })
    }
}