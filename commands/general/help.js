const { MessageEmbed } = require('discord.js'),
    colors = require('../../config/embedcolors.json');

// Thank you stack overflow user 
function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

module.exports = {
    name: 'help',
    category: 'info',
    shortdescription: `Provides info about commands`,
    description: `Check all commands avalaible and info about each of them.`,
    ussage: "help [command]",
    run: function(message, args) {
        let categories = client.commands.map(k => k.category).filter(onlyUnique),
            commands = (category) => {return client.commands.filter(k => k.category === category).map(k => `\`${k.name}\` - ${k.shortdescription || `No short description. :(`}`).sort().join(`\n`)}
            prefix = client.config.prefix;

        //if first argument is a valid category
        if (!args[0]) args.push('')
        if(client.commands.has(args[0].toLowerCase())) {
            let command = client.commands.get(args[0].toLowerCase());
            let embed = new MessageEmbed()
                .setAuthor(command.name.charAt(0).toUpperCase() + command.name.slice(1), message.author.displayAvatarURL())
                .setColor(colors.info)
                .setDescription(command.description || `No description :c`)
                .addField(`Ussage: ${prefix + command.ussage || `🤷 not documented.`}`, `Category: ${command.category}`)
                .setFooter(`Arguments in [] are optional while arguments in () are mandatory`, client.user.displayAvatarURL())
            message.channel.send(embed);
        } else {
            let embed = new MessageEmbed().setAuthor(`Help menu`, message.author.displayAvatarURL()).setColor(colors.info).setDescription(`Use ${prefix}help [command] to see more info on all the commands`).setFooter(`Requested:`, client.user.displayAvatarURL()).setTimestamp(Date.now());
            for (let category of categories) {
                embed.addField(category.charAt(0).toUpperCase() + category.slice(1), commands(category))
            }
            message.channel.send(embed);
        } 
    }
}