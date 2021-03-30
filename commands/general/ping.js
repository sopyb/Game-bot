const { MessageEmbed } = require('discord.js'),
    colors = require('../../config/embedcolors.json');

module.exports = {
    name: 'ping',
    category: 'info',
    shortdescription: `Ping! Pong!`,
    description: `Check bot's latency to discord's API.`,
    ussage: "ping",
    run: function(message, args) {
        let embed = new MessageEmbed().setAuthor(`Ping`, message.author.displayAvatarURL()).setColor(colors.info).setDescription(`Pinging...`);
        message.channel.send(embed).then(msg => {
            embed = new MessageEmbed().setAuthor(`Ping`, message.author.displayAvatarURL()).setColor(colors.success).setDescription(`Pong! That took ${Math.round(client.ws.ping)}ms.`)
            msg.edit(embed)
        })
    }
}