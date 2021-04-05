//require needed modules
const { Client, Collection } = require('discord.js'),
    config = require('./config/config.json'),
    { colors, format, reset } = require('./utils/clformat');
    require('dotenv').config();
    require('./utils/databaseDriver').initDb();

//set up the client variable and sub vables
global.client = new Client({
    "disableMentions": "everyone"
})
client.config = config;

//load all handlers
for (let handler of ["commands", "events"]) {
    console.log(`${colors.blue}Info:${reset}  ${colors.green}${handler.charAt(0).toUpperCase() + handler.slice(1)} handler${reset} loading intiated.`)
    try {
        require(`./handlers/core/${handler}`).load()
    } catch(e) {
        console.log(`${colors.red}Error:${reset} Loading ${colors.green}${handler}${reset}`)
        console.log(e)
    }
}

client.login() // login thru token