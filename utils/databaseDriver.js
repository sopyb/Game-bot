const sqlite = require('sqlite3'),
    { open } = require('sqlite'),
    Path = require('path')

async function initDb() {
    open({
        filename: Path.join(process.cwd(), './database.db'),
        driver: sqlite.Database
    }).then((database) => {
        global.db = database;
        let db = database

        db.run(`CREATE TABLE IF NOT EXISTS servers (
            ID PRIMARY KEY,
            prefix TEXT
        )`) ;

        db.run(`CREATE TABLE IF NOT EXISTS users (
            ID PRIMARY KEY,
            xp INTEGER DEFAULT 0,
            balance INTEGER DEFAULT 0,
            description TEXT
        )`);
    }).catch(e => console.log(e));
}

async function get(table, ID, query) {
    let result = await db.get(`SELECT ${query} FROM ${table} WHERE ID = "${ID}";`);

    return result?.[Object.keys?.(result)?.[0]];
}

async function set(table, ID, query, value) {
    let result = await get(table, ID, query);

    if(typeof value === "string") {
        value = `"${value}"`
    }

    if(result != null) {
        await db.run(`UPDATE ${table} SET ${query} = ${value} WHERE ID = "${ID}";`)
    } else {
        await db.run(`INSERT INTO ${table}(ID, ${query}) VALUES("${ID}", ${value});`)
    }
}

async function add(table, ID, query, value) {
    let result = await get(table, ID, query)

    value += result ?? 0;

    await set(table, ID, query, value);
}

process.on("exit", () => global.db.close())


module.exports = {
    initDb,
    get,
    set,
    add
}