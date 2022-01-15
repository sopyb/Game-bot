const { MessageEmbed, Permissions } = require('discord.js'),
    colors = require('../../config/embedcolors.json'),
    db = require('../../utils/databaseDriver');

module.exports = {
    name: 'prefix',
    category: 'config',
    shortdescription: `Check prefix or set a new one.`,
    description: `Change the prefix of the server to a new one or check to see the curent prefix`,
    usage: "prefix [new prefix]",
    reqperms: [Permissions.FLAGS.MANAGE_GUILD],
    run: (message, args, prefix) => {
        if (args[0]) {
            if (args[0].split('').length > 5) {
                return message.channel.send({embeds: [new MessageEmbed().setAuthor({name: `The prefix max length is 5 characters`, iconURL: message.author.displayAvatarURL()}).setColor(colors.error)]});
            }

            db.set(`servers`, message.guild.id, `prefix`, args[0]);
            message.channel.send({embeds: [new MessageEmbed().setAuthor({name: `Successfully updated server prefix to ${args[0]}`, iconURL: message.author.displayAvatarURL()}).setColor(colors.success)]});
        } else {
            message.channel.send({embeds: [new MessageEmbed().setAuthor({name: `Current server prefix is ${prefix}`, iconURL: message.author.displayAvatarURL()}).setColor(colors.info)]});
        }
    }
}