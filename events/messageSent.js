const { colors, format, reset } = require('../utils/clformat');

client.on('message',async (message) => {
    let prefix = client.config.prefix;

    if (message.mentions.has(client.user.id)) {
        return message.channel.send(`Hey there! My prefix is \`${prefix}\`.`);
    }
    if (!message.content.startsWith(prefix)) return;
    if (message.author.bot) return;
    if (!message.guild) return;

    let args = message.content.slice(prefix.length).trim().split(/ +/g);
    let command = args.shift().toLowerCase();
    if (!command) return;
    
    let cmdfile = client.commands.get(command);
    if (!cmdfile) cmdfile = client.aliases.get(command);
    if (!cmdfile) return;

    try {
        await cmdfile.run(message, args)
    } catch(e) {
        message.channel.send(`A error occured trying to run ${command}: \n\`\`\`${e}\`\`\``)
        console.error(`${colors.red}Error:${reset} Error occured with ${colors.green}${cmdfile.name}${reset} at ${colors.green}${new Date().toUTCString().split(' ')[4]} UTC${reset}`)
        console.log(e)
    }
})

module.exports = {
    'name': 'messageSent'
}