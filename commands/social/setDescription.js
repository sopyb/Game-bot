const db = require("../../utils/databaseDriver");

module.exports = {
    name: "setdescription",
    aliases: [],
    category: "social",
    cooldown: 5,
    shortdescription: "Change your bio",
    description: "Change your description on the rank card",
    usage: "setdescription (new description)",
    reqperms: [],
    run: (message, args, prefix) => {
        if (!args?.length) return message.channel.send(`What am I supposed to set your description to? >:(\n**Usage:** \`${prefix + module.exports.usage}\``)

        let description = args.join(" ")

        if (description.length > 200) return message.channel.send(`The description must be under 200 characters long!`)

        db.set("users", message.author.id, "description", description).then(() => {message.channel.send(`Description was successfully set to \`${description}\``)}).catch(console.log)
    }
}