const fs = require("fs");
const path = require("path");
const { db, dbPath } = require("./db");

function readSql(file) {
  return fs.readFileSync(path.join(__dirname, "..", file), "utf8");
}

function runSql(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => (err ? reject(err) : resolve()));
  });
}

async function main() {
  try {
    const schema = readSql("schema.sql");
    const seed = readSql("seed.sql");

    await runSql(schema);
    await runSql(seed);

    console.log("[init-db] OK:", dbPath);
  } catch (e) {
    console.error("[init-db] ERROR:", e);
    process.exitCode = 1;
  } finally {
    db.close();
  }
}

main();
