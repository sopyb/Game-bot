const { MessageEmbed } = require('discord.js'),
    colors = require('../../config/embedcolors.json'),
    db = require('../../utils/databaseDriver');

module.exports = {
    name: 'prefix',
    category: 'config',
    shortdescription: `Check prefix or set a new one.`,
    description: `Change the prefix of the server to a new one or check to see the curent prefix`,
    ussage: "prefix [new prefix]",
    reqperms: ["MANAGE_GUILD"],
    run: (message, args, prefix) => {
        if (args[0]) {
            if (args[0].split('').length > 5) {
                return message.channel.send(new MessageEmbed().setAuthor(`The prefix max length is 5 characters.`, message.author.displayAvatarURL()).setColor(colors.error));
            }

            db.set(`servers`, message.guild.id, `prefix`, args[0]);
            message.channel.send(new MessageEmbed().setAuthor(`Successfully updated server prefix to ${args[0]}.`, message.author.displayAvatarURL()).setColor(colors.success));
        } else {
            message.channel.send(new MessageEmbed().setAuthor(`Current server prefix is ${prefix}.`, message.author.displayAvatarURL()).setColor(colors.info));
        }
    }
}