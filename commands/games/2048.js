const { Game } = require('../../handlers/2048api'),    //Yes... I gave up running into errors for 7h straight with my own api
    { MessageEmbed } = require('discord.js');  // maybe... I will go back at it (why do I hate myself)

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
        let gameobj = new Game({debug: true});
        
        //adding first 2 blocks
        gameobj.start();

        let embedmsg = new MessageEmbed().setColor("#1e6477").addField("2048!", render(gameobj.getData().board));
        let gamemsg = await message.channel.send(`${message.author}'s game`, {embed: embedmsg});

        let reactions = ["⬅️", "⬆️", "⬇️", "➡️", "🛑"]
        for (reaction of reactions) {
            gamemsg.react(reaction)
        }

        let filter = (react, user) => {
            return reactions.includes(react.emoji.name) && user === message.author
        }

        let collector = gamemsg.createReactionCollector(filter, {idle: 60000, errors: ['time']})

        collector.on('collect', (reaction, user) => {
            reaction.users.remove(user.id);
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
                    break;
            }
            //console.log(gameobj.getData())
            embedmsg = new MessageEmbed().setColor("#1e6477").addField("2048!", render(gameobj.getData().board));
            gamemsg.edit(`${message.author}'s game`, {embed: embedmsg});
        })

        collector.on('end', () => {
            gamemsg.reactions.removeAll();
        })

        collector.on('error', () => {
            gamemsg.reactions.removeAll();
        })
    }
}