const db = require("better-sqlite3")("db.sqlite");

db.prepare(
  'CREATE TABLE IF NOT EXISTS "stats"("ID"	INTEGER,"SERVER"	TEXT,"CHANNEL"	TEXT,"MCSERVERHOST"	TEXT,"MCSERVERPORT"	INTEGER,PRIMARY KEY("ID"))'
).run();
module.exports = db;
