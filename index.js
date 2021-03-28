//require needed modules
const { Client, Collection } = require('discord.js'),
    config = require('./config/config.json'),
    { colors, format, reset } = require('./utils/clformat');
    require('dotenv').config()

//set up the client variable
global.client = new Client({
    "disableMentions": "everyone"
})
client.config = config;
client.commands = new Collection()
client.aliases = new Collection()
client.events = new Collection()

//load all handlers
for (let handler of ["commands", "events"]) {
    console.log(`${colors.blue}Info:${reset}  ${colors.green}${handler.charAt(0).toUpperCase() + handler.slice(1)} handler${reset} loading intiated.`)
    try {
        require(`./handlers/${handler}`).load()
    } catch(e) {
        console.log(`${colors.red}Error:${reset} Loading ${colors.green}${handler}${reset}`)
        console.log(e)
    }
}

client.login() // login thru token