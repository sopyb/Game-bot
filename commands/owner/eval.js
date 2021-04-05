module.exports = {
    name: 'eval',  // doesn't show on help missing category
    run: async function(message, args) {
        if (!client.config.ownerID.includes(message.author.id)) return message.channel.send(`You might be a high level wizzard but you can't still use this spell.`);

        if (!args[0]) return message.channel.send(`You dummy gimmie stuff to eval... bad dev smh.`)
        let stringtoeval = args.join(" "),
            start = (Date.now()),
            evalresponse = eval(stringtoeval),
            time = Date.now() - start;

        message.channel.send(`**Evaluated:**\n\`\`\`js\n${stringtoeval}\`\`\`**Response:**\n\`\`\`js\n${evalresponse}\`\`\`In ${time}ms.`)
    }
}