const { readdirSync } = require('fs'),
    Path = require('path'),
    { colors, format, reset } = require('../../utils/clformat'),
    { Collection } = require('discord.js');

client.commands = new Collection();
client.aliases = new Collection();

function load() {
    let start = Date.now()
    readdirSync(Path.join(__dirname, '../../commands')).forEach(dir => {
        readdirSync(Path.join(__dirname, '../../commands', dir)).filter(file => file.endsWith('.js')).forEach(file => {
            let command, path = Path.join(__dirname, '../../commands', dir, file);
            try {
                command = require(`../../commands/${dir}/${file}`)
            } catch(e) {
                console.error(`${colors.red}Error:${reset} Loading command at ${colors.green}${path}${reset}`)
                console.error(e)
                return;
            }
            if (command.name) {
                command.path = path
                client.commands.set(command.name, command)
            } else {
                console.error(`${colors.red}Error:${reset} Command at ${colors.green}${path}${reset} has no name.`)
                return;
            }

            if (command.aliases?.length > 0) {
                for(alias of command.aliases) {
                    client.aliases.set(alias, command.name)
                }
            }
        })
    });
    let elapsed = Date.now() - start;
    console.log(`${colors.blue}Info:${reset}  ${colors.green}${client.commands.size} command(s)${reset} succesfully loaded in ${colors.green}${elapsed}ms${reset}`)
}

function reload() {
    //#TODO: add reload function
}

module.exports = {
    load,
    reload
}