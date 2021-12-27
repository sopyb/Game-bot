const sqlite = require('sqlite3'),
    { open } = require('sqlite'),
    Path = require('path')

async function initDb() {
    open({
        filename: Path.join(process.cwd(), './database.db'),
        driver: sqlite.Database
    }).then((database) => {
        db = database;

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

        db.close()
    }).catch(e => console.log(e));
}

async function get(table, ID, query) {
    let db = await open({
        filename: Path.join(process.cwd(), './database.db'),
        driver: sqlite.Database
    });

    let result = await db.get(`SELECT ${query} FROM ${table} WHERE ID = "${ID}"`);

    db.close();
    return result?.[Object.keys?.(result)?.[0]];
}

async function set(table, ID, query, value) {
    let db = await open({
        filename: Path.join(process.cwd(), './database.db'),
        driver: sqlite.Database
    }),
    result = await db.get(`SELECT ${query} FROM ${table} WHERE ID = "${ID}"`);

    if(typeof value === "string") {
        value = `"${value}"`
    }

    if(result != {}) {
        await db.run(`UPDATE ${table} SET ${query} = ${value} WHERE ID = "${ID}"`)
    } else {
        await db.run(`INSERT INTO ${table}(ID, ${query}) VALUES("${ID}", ${value});`)
    }
    
    db.close();
}

async function add(table, ID, query, value) {
    let db = await open({
        filename: Path.join(process.cwd(), './database.db'),
        driver: sqlite.Database
    });

    let result = await db.get(`SELECT ${query} FROM ${table} WHERE ID = ${ID}`);

    value += result?.[Object.keys?.(result)?.[0]] || 0;

    if(result != {}) {
        await db.run(`UPDATE ${table} SET ${query} = ${value} WHERE ID = ${ID}`)
    } else {
        await db.run(`INSERT INTO ${table}(ID, ${query}) VALUES(${ID}, ${value});`)
    }

    db.close();
}



module.exports = {
    initDb,
    get,
    set,
    add
}