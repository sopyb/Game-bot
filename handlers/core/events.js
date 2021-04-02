const { readdirSync } = require('fs'),
    Path = require('path'),
    { colors, format, reset } = require('../../utils/clformat'),
    { Collection } = require('discord.js');

client.events = new Collection();

function load() {
    let start = Date.now()

    readdirSync(Path.join(__dirname, `../../events`)).filter(file => file.endsWith('.js')).forEach(file => {
        let event, path = Path.join(__dirname, `../../events`, file);
        try {
            event = require(path)
        } catch (e) {
            console.error(`${colors.red}Error:${reset} Loading event at ${colors.green}${path}${reset}`)
            console.error(e)
        }
        event.path = path
        if (event.name) {
            client.events.set(event.name, event)
        } else {
            console.warn(`${colors.yellow}Warn:${reset}  Event at ${colors.green}${path}${reset} has no name.`)
            console.warn(`${colors.yellow}Warn:${reset}  Using ${colors.green}${file.slice(0, -3)}${reset} as event name`)
            client.events.set(file.slice(0, -3), event)
        }
    })

    let elapsed = Date.now() - start;
    console.log(`${colors.blue}Info:${reset}  ${colors.green}${client.events.size} event(s)${reset} succesfully loaded in ${colors.green}${elapsed}ms${reset}`)

}

function reload() {
    //#TODO: add reload function
}

module.exports = {
    load,
    reload
}