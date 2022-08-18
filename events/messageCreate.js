const { colors, format, reset } = require('../utils/clformat'),
    { MessageEmbed, Collection, Permissions } = require('discord.js'),
    db = require('../utils/databaseDriver')

client.cooldown = new Collection();

client.on('messageCreate',async (message) => {
    let prefix = await db.get(`servers`, message.guild.id, `prefix`);
    if (!prefix) prefix = client.config.prefix;

    if (message.content.includes(`<@${client.user.id}>`)) {
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

    if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && cmdfile.reqperms) {
        for (perm of cmdfile.reqperms) {
            if (!message.member.permissions.has(perm)) {
                return message.reply(`You're missing permissions to execute the command.`).then((msg) =>setTimeout(() => {msg.delete().catch(console.error)}, 3000));
            }
        }
    }
    
    let cmdcooldown = cmdfile.cooldown ?? 5;

    if (!client.config.ownerID.includes(message.author.id) && cmdcooldown !== 0) {
        if (!client.cooldown.has(cmdfile.name)) client.cooldown.set(cmdfile.name, new Collection());

        let cooldowns = client.cooldown.get(cmdfile.name)
        let time = Date.now();
        if(!cooldowns.has(message.author.id)) {
            cooldowns.set(message.author.id, time + (cmdcooldown * 1000));
        } else {
            let wearoff = cooldowns.get(message.author.id)
            if (time <= wearoff) {
                return message.reply({content: `You're being rate limited. You can use that command again in ${(Math.ceil((wearoff-time)/10)/100).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}s`}).then((msg) =>setTimeout(() => {msg.delete().catch(console.error)}, 3000))
            } else {
                cooldowns.set(message.author.id, time + (cmdcooldown * 1000));
            }
        }
    }
    
    message.channel.sendTyping()
    try {
        await cmdfile.run(message, args, prefix)
    } catch(e) {
        message.channel.send(`A error occured trying to run ${command}: \n\`\`\`${e}\`\`\``)
        console.error(`${colors.red}Error:${reset} Error occured with ${colors.green}${cmdfile.name}${reset} at ${colors.green}${new Date().toUTCString().split(' ')[4]} UTC${reset}`)
        console.log(e)
    }
})

module.exports = {
    'name': 'messageSent'
}