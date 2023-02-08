/**
 * File: detectDB.js
 * Author: chuncheng.zhang
 * Purpose: Detect the sqlite3 database.
 */

const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3");
const { ArgumentParser } = require("argparse");
const { parseArgs } = require("util");
const { version } = require("./package.json");

/**
 * Default path setup.
 */
var db_folder = path.join(
    process.env["LOCALAPPDATA"],
    "Microsoft\\Edge\\User Data\\Default"
  ),
  DBSrc = path.join(db_folder, "history"),
  DBDst = DBSrc + ".db";

/**
 * ArgumentParser setup.
 */
const parser = new ArgumentParser({
  description: "Open a file as sqlite3, and list its tables",
});
parser.add_argument("-v", "--version", {
  action: "version",
  version,
});
parser.add_argument("-d", "--defaultDBPath", {
  help: `If use the default database path, "${DBSrc}"`,
  action: "store_const",
  const: DBSrc,
});
parser.add_argument("-c", "--columns", {
  help: `If query the column names from the found tables`,
  action: "store_true",
});
parser.add_argument("-b", "--dbPath", {
  help: "Specify the database path, it overrides the -d option",
});
const args = parser.parse_args();

printDivider("Arguments");
console.dir(args);

if (args.dbPath) {
  DBSrc = args.dbPath;
  DBDst = DBSrc + ".auto.db";
}

/**
 * Main body
 */
const query = {
  name: "tables",
  help: "Get tables from the database",
  query: `
SELECT name FROM sqlite_master WHERE type='table';
`,
};

fs.copyFile(DBSrc, DBDst, (err) => {
  if (err) throw err;

  const dbSession = new sqlite3.Database(DBDst, (err) => {
    if (err) {
      console.log(`Db session fails, removing: ${DBDst}`);
      fs.rm(DBDst, (err) => {
        console.error("Error-1", err);
      });
      throw err;
    }
  });

  dbSession.all(query.query, (err, res) => {
    if (err) {
      console.error(err, query);
      console.log(`Db query fails, removing: ${DBDst}`);
      fs.rm(DBDst, (err) => {
        if (err) {
          console.error("Error-2", err);
          throw err;
        }
      });
    }

    printDivider("File information");
    console.dir(Object.assign({ DBDst }, query, fs.statSync(DBDst)));
    printDivider("Query results");
    console.dir(res);

    if (args.columns) {
      res.map(({ name }) => queryColFromTableName(dbSession, name));
    }
  });

  dbSession.close();
});

/**
 * Query columns from the given table name, the DB session is supposed to be opened.
 *
 * @param {sqlite3 Session} session
 * @param {tableName} tableName
 */

function queryColFromTableName(session, tableName = "meta") {
  session.all(`PRAGMA table_info('${tableName}')`, (err, res) => {
    if (err) {
      console.error("Failed to query columns from table " + tableName);
      throw err;
    }

    printDivider(`Columns in ${tableName}`);
    console.dir(res);
  });
}

/**
 * Print the divider line of ********, with max-length, the center is the given msg.
 *
 * @param {string} msg
 * @param {Int} maxLength
 */

function printDivider(msg, maxLength = 80) {
  var output = "**** " + msg + " ";

  output += "*".repeat(
    output.length > maxLength ? 0 : maxLength - output.length
  );

  console.log(output);
}
