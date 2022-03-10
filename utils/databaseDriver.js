const sqlite = require("sqlite3");
const { open } = require("sqlite");
const Path = require("path");

async function initDb() {
  open({
    filename: Path.join(process.cwd(), "./database.db"),
    driver: sqlite.Database,
  })
    .then((database) => {
      global.db = database;
      const db = database;

      db.run(`CREATE TABLE IF NOT EXISTS servers (
            ID PRIMARY KEY,
            prefix TEXT
        )`);

      db.run(`CREATE TABLE IF NOT EXISTS users (
            ID PRIMARY KEY,
            xp INTEGER DEFAULT 0,
            balance INTEGER DEFAULT 0,
            cardBackground INTEGER DEFAULT 0,
            title INTEGER DEFAULT 0,
            description TEXT,
            inventory TEXT,
            stats TEXT
        )`);

      /*  Update old database

            ALTER TABLE users ADD cardBackground INTEGER DEFAULT 0
            ALTER TABLE users ADD title INTEGER DEFAULT 0;
            ALTER TABLE users ADD inventory TEXT;
            ALTER TABLE users ADD stats TEXT;
        */
    })
    .catch((e) => console.log(e));
}

async function get(table, ID, query) {
  const result = await db.get(
    `SELECT ${query} FROM ${table} WHERE ID = "${ID}";`
  );

  return result?.[Object.keys?.(result)?.[0]];
}

async function all(table, ID) {
  const result = await db.get(`SELECT * FROM ${table} WHERE ID = "${ID}";`);

  return result;
}

async function set(table, ID, query, value) {
  const result = await get(table, ID, "*");

  if (typeof value === "string") {
    value = `"${value}"`;
  }

  if (result != null) {
    await db.run(`UPDATE ${table} SET ${query} = ${value} WHERE ID = "${ID}";`);
  } else {
    await db.run(
      `INSERT INTO ${table}(ID, ${query}) VALUES("${ID}", ${value});`
    );
  }
}

async function add(table, ID, query, value) {
  const result = await get(table, ID, "*");

  value += result ?? 0;

  await set(table, ID, query, value);
}

process.on("exit", () => db.close());

module.exports = {
  initDb,
  get,
  all,
  set,
  add,
};
